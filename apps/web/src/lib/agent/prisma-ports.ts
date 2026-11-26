import { prisma } from '@tariffos/database';
import {
  chapterToSectionPath,
  createRgiLlmRunner,
  defaultProvider,
  fetchWebSpecsFromEnv,
  fuseHybridTariffCandidates,
  runRgiWithLlm,
  type LegalNoteRecord,
  type PipelinePorts,
  type RgiLlmRuntimeOverride,
  type TariffCandidateRecord,
} from '@tariffos/agent';
import { searchTariffCandidatesFts } from './tariff-fts';
import { fetchSiblingSubheadings } from './tariff-siblings';
import { searchTariffCandidatesVector } from './tariff-vector';
import { findTenantSkuPrecedent } from './tier0-lookup';

const DEFAULT_AD_VALOREM_FALLBACK = 0;
const DEFAULT_IVA_FALLBACK = 16;
const DEFAULT_UNIT = 'u';
const MAX_SEARCH_CANDIDATES = 12;
const MAX_LEGAL_NOTES = 12;

function buildHsCodeLookupVariants(hsCode: string): string[] {
  const trimmed = hsCode.trim();
  const compact = trimmed.replace(/[^0-9]/g, '');
  const variants = new Set<string>();
  if (trimmed) variants.add(trimmed);
  if (compact) variants.add(compact);
  if (compact.length === 10) {
    variants.add(
      `${compact.slice(0, 4)}.${compact.slice(4, 6)}.${compact.slice(6, 8)}.${compact.slice(8, 10)}`,
    );
  }
  return Array.from(variants);
}

/**
 * Hexagonal adapter wiring @tariffos/agent PipelinePorts to Prisma/Postgres
 * (hybrid `TariffNodeEmbedding` vector + `NationalTariff` FTS) and `@tariffos/ai-client`.
 */
export function createPrismaPipelinePorts(runtimeLlm?: RgiLlmRuntimeOverride): PipelinePorts {
  return {
    decisionProvider: process.env.TYPESAFE_API_KEY ? defaultProvider() : undefined,
    fetchWebSpecs: fetchWebSpecsFromEnv,

    findSkuPrecedent: (tenantId, skuOrDesc) => findTenantSkuPrecedent(tenantId, skuOrDesc),

    async searchTariffCandidates(
      countryCode: string,
      query: string,
    ): Promise<TariffCandidateRecord[]> {
      const [vectorCandidates, lexicalCandidates] = await Promise.all([
        searchTariffCandidatesVector(countryCode, query, MAX_SEARCH_CANDIDATES),
        searchTariffCandidatesFts(countryCode, query, MAX_SEARCH_CANDIDATES),
      ]);
      if (vectorCandidates.length === 0) return lexicalCandidates;
      if (lexicalCandidates.length === 0) return vectorCandidates;
      return fuseHybridTariffCandidates(vectorCandidates, lexicalCandidates, {
        limit: MAX_SEARCH_CANDIDATES,
      });
    },

    expandSiblingSubheadings: (countryCode, prefixes) =>
      fetchSiblingSubheadings(countryCode, prefixes),

    async getLegalNotes(countryCode: string, hsPrefix: string): Promise<LegalNoteRecord[]> {
      const chapter = hsPrefix.replace(/[^0-9]/g, '').slice(0, 2);
      if (!chapter) return [];

      const sectionPath = chapterToSectionPath(chapter);
      const hierarchyPaths = sectionPath ? [chapter, sectionPath] : [chapter];

      const chunks = await prisma.legalKnowledgeChunk.findMany({
        where: {
          parent: {
            countryCode,
            hierarchyPath: { in: hierarchyPaths },
          },
        },
        include: {
          parent: { select: { hierarchyPath: true } },
        },
        take: MAX_LEGAL_NOTES,
      });

      return chunks.map((chunk) => {
        const ref = chunk.ruleNumber
          ? `${chunk.heading} (Nota ${chunk.ruleNumber})`
          : chunk.heading;
        const parentPath = chunk.parent?.hierarchyPath ?? '';
        return parentPath.startsWith('SEC-')
          ? { ref, text: chunk.content }
          : { ref, text: chunk.content, chapter };
      });
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
        legalRegime: row.legalNotes ?? undefined,
        prohibited: permits.some(
          (p: { permitType: { code: string } }) =>
            p.permitType.code === 'RL-1' || p.permitType.code === 'RL-2',
        ),
        permits: permits.map(
          (p: { permitType: { code: string; agency: string; name: string } }) =>
            `${p.permitType.code} (${p.permitType.agency}): ${p.permitType.name}`,
        ),
        customsFeeRate: row.customsFee ?? undefined,
        isBK: row.isBK,
        isBIT: row.isBIT,
      };
    },

    runRgiReasoning: runtimeLlm ? createRgiLlmRunner(runtimeLlm) : runRgiWithLlm,
  };
}
