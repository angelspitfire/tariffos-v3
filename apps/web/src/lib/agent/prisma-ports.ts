import { prisma } from '@tariffos/database';
import {
  defaultProvider,
  runRgiWithLlm,
  type LegalNoteRecord,
  type PipelinePorts,
  type SkuPrecedentRecord,
  type TariffCandidateRecord,
} from '@tariffos/agent';

const DEFAULT_AD_VALOREM_FALLBACK = 0;
const DEFAULT_IVA_FALLBACK = 16;
const DEFAULT_UNIT = 'u';
const MAX_SEARCH_CANDIDATES = 12;
const MAX_LEGAL_NOTES = 8;

/**
 * Hexagonal adapter wiring @tariffos/agent PipelinePorts to Prisma/Postgres
 * and hosted System One / @tariffos/ai-client providers.
 */
export function createPrismaPipelinePorts(): PipelinePorts {
  return {
    decisionProvider: process.env.TYPESAFE_API_KEY ? defaultProvider() : undefined,

    async findSkuPrecedent(tenantId: string, skuOrDesc: string): Promise<SkuPrecedentRecord | null> {
      const match = await prisma.productMaster.findFirst({
        where: {
          tenantId,
          OR: [{ sku: skuOrDesc }, { description: skuOrDesc }],
        },
      });
      if (!match || !match.hsCode) return null;
      return {
        hsCode: match.hsCode,
        officialDescription: match.description,
        confidencePct: 98,
        approvedByBroker: true,
      };
    },

    async searchTariffCandidates(countryCode: string, query: string): Promise<TariffCandidateRecord[]> {
      const terms = query.trim().split(/\s+/).filter((t) => t.length > 2).slice(0, 4);
      const rows = await prisma.nationalTariff.findMany({
        where: {
          countryCode,
          isActive: true,
          OR: terms.length > 0
            ? terms.map((term) => ({ description: { contains: term, mode: 'insensitive' as const } }))
            : undefined,
        },
        take: MAX_SEARCH_CANDIDATES,
      });

      return rows.map((row) => ({
        hsCode: row.hsCode,
        description: row.description,
        adValoremRate: row.adValorem ?? DEFAULT_AD_VALOREM_FALLBACK,
        ivaRate: row.iva ?? DEFAULT_IVA_FALLBACK,
        unit: DEFAULT_UNIT,
        legalRegime: row.legalNotes,
        prohibited: row.legalNotes?.toLowerCase().includes('prohibid') ?? false,
      }));
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

    async verifyHsCode(countryCode: string, hsCode: string): Promise<TariffCandidateRecord | null> {
      const row = await prisma.nationalTariff.findFirst({
        where: { countryCode, hsCode, isActive: true },
      });
      if (!row) return null;

      const permits = await prisma.hsPermitRequirement.findMany({
        where: { countryCode, hsCode },
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
