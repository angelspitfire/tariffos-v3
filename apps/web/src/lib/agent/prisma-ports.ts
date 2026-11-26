import { prisma } from '@tariffos/database';
import {
  defaultProvider,
  runRgiWithLlm,
  type LegalNoteRecord,
  type PipelinePorts,
  type SkuPrecedentRecord,
  type TariffCandidateRecord,
} from '@tariffos/agent';
import { searchTariffCandidatesFts } from './tariff-fts';

const DEFAULT_AD_VALOREM_FALLBACK = 0;
const DEFAULT_IVA_FALLBACK = 16;
const DEFAULT_UNIT = 'u';
const MAX_SEARCH_CANDIDATES = 12;
const MAX_LEGAL_NOTES = 8;

function buildHsCodeLookupVariants(hsCode: string): string[] {
  const trimmed = hsCode.trim();
  const compact = trimmed.replace(/[^0-9]/g, '');
  const variants = new Set<string>();
  if (trimmed) variants.add(trimmed);
  if (compact) variants.add(compact);
  if (compact.length === 10) {
    variants.add(`${compact.slice(0, 4)}.${compact.slice(4, 6)}.${compact.slice(6, 8)}.${compact.slice(8, 10)}`);
  }
  return Array.from(variants);
}

/**
 * Hexagonal adapter wiring @tariffos/agent PipelinePorts to Prisma/Postgres
 * and hosted System One / @tariffos/ai-client providers.
 */
export function createPrismaPipelinePorts(): PipelinePorts {
  return {
    decisionProvider: process.env.TYPESAFE_API_KEY ? defaultProvider() : undefined,

    async findSkuPrecedent(
      tenantId: string,
      skuOrDesc: string,
    ): Promise<SkuPrecedentRecord | null> {
      const match = await prisma.productMaster.findFirst({
        where: {
          tenantId,
          description: { equals: skuOrDesc, mode: 'insensitive' },
        },
      });
      if (!match || !match.hsCode) return null;
      return {
        hsCode: match.hsCode,
        officialDescription: match.description,
        confidencePct: Math.round((match.confidence ?? 0.98) * 100),
        approvedByBroker: true,
      };
    },

    async searchTariffCandidates(
      countryCode: string,
      query: string,
    ): Promise<TariffCandidateRecord[]> {
      return searchTariffCandidatesFts(countryCode, query, MAX_SEARCH_CANDIDATES);
    },

    async getLegalNotes(countryCode: string, hsPrefix: string): Promise<LegalNoteRecord[]> {
      const chunks = await prisma.legalKnowledgeChunk.findMany({
        where: {
          parent: { countryCode },
          heading: { startsWith: hsPrefix.slice(0, 2) },
        },
        take: MAX_LEGAL_NOTES,
      });

      return chunks.map((chunk) => ({
        ref: chunk.ruleNumber ? `${chunk.heading} (${chunk.ruleNumber})` : chunk.heading,
        text: chunk.content,
      }));
    },

    async verifyHsCode(
      countryCode: string,
      hsCode: string,
    ): Promise<TariffCandidateRecord | null> {
      const variants = buildHsCodeLookupVariants(hsCode);
      const row = await prisma.nationalTariff.findFirst({
        where: {
          countryCode,
          hsCode: { in: variants },
          isActive: true,
          isDerogated: false,
        },
      });
      if (!row) return null;

      const permits = await prisma.hsPermitRequirement.findMany({
        where: { hsCode: { in: variants }, permitType: { countryCode } },
        include: { permitType: true },
      });

      return {
        hsCode: row.hsCode,
        description: row.description,
        adValoremRate: row.adValorem ?? DEFAULT_AD_VALOREM_FALLBACK,
        ivaRate: row.iva ?? DEFAULT_IVA_FALLBACK,
        unit: DEFAULT_UNIT,
        legalRegime: row.legalNotes,
        prohibited: row.legalNotes?.toLowerCase().includes('prohibid') ?? false,
        permits: permits.map((p) => p.permitType.name),
      };
    },

    runRgiReasoning: runRgiWithLlm,
  };
}
