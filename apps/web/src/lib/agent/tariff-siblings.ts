import { ancestryOf, composeDocument, prisma } from '@tariffos/database';
import type { TariffCandidateRecord } from '@tariffos/agent';

const DEFAULT_AD_VALOREM = 0;
const DEFAULT_IVA = 16;
const DEFAULT_UNIT = 'u';
const MAX_PREFIXES = 3;
const DEFAULT_MAX_RESULTS = 16;

function formatDotted10(hsCode: string): string {
  const digits = hsCode.replace(/[^0-9]/g, '');
  if (digits.length !== 10) return hsCode;
  return `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6, 8)}.${digits.slice(8, 10)}`;
}

function collectAncestorCodes(leafCodes: string[]): string[] {
  const prefixes = new Set<string>();
  for (const code of leafCodes) {
    for (let len = 4; len < code.length; len += 1) {
      prefixes.add(code.slice(0, len));
    }
  }
  return Array.from(prefixes);
}

/**
 * Loads sibling 10-digit tariff leaves sharing the top candidates' 6-digit NCM/HS prefixes
 * and composes full hierarchical descriptions so Tier 2 RGI 6 compares residual `"Las demás"` lines accurately.
 */
export async function fetchSiblingSubheadings(
  countryCode: string,
  hsPrefixes: string[],
  maxResults = DEFAULT_MAX_RESULTS,
): Promise<TariffCandidateRecord[]> {
  const prefixes6 = Array.from(
    new Set(
      hsPrefixes
        .map((p) => p.replace(/[^0-9]/g, '').slice(0, 6))
        .filter((p) => p.length === 6),
    ),
  ).slice(0, MAX_PREFIXES);

  if (prefixes6.length === 0) return [];

  const leafRows = await prisma.nationalTariff.findMany({
    where: {
      countryCode,
      isActive: true,
      isDerogated: false,
      OR: prefixes6.map((prefix) => ({ hsCode: { startsWith: prefix } })),
    },
    select: {
      hsCode: true,
      description: true,
      adValorem: true,
      iva: true,
      legalNotes: true,
      customsFee: true,
      isBK: true,
      isBIT: true,
    },
    orderBy: { hsCode: 'asc' },
  });

  const leaves = leafRows
    .filter((row) => row.hsCode.replace(/[^0-9]/g, '').length === 10)
    .slice(0, maxResults);
  if (leaves.length === 0) return [];

  const ancestorCodes = collectAncestorCodes(leaves.map((l) => l.hsCode));
  const ancestors =
    ancestorCodes.length > 0
      ? await prisma.nationalTariff.findMany({
          where: { countryCode, hsCode: { in: ancestorCodes } },
          select: { hsCode: true, description: true },
        })
      : [];

  const byCode = new Map<string, string>(ancestors.map((a) => [a.hsCode, a.description]));

  return leaves.map((leaf) => ({
    hsCode: formatDotted10(leaf.hsCode),
    description: composeDocument(ancestryOf(leaf.hsCode, byCode), leaf.description) || leaf.description,
    adValoremRate: leaf.adValorem ?? DEFAULT_AD_VALOREM,
    ivaRate: leaf.iva ?? DEFAULT_IVA,
    unit: DEFAULT_UNIT,
    legalRegime: leaf.legalNotes ?? undefined,
    prohibited: false,
    permits: [],
    customsFeeRate: leaf.customsFee ?? undefined,
    isBK: leaf.isBK,
    isBIT: leaf.isBIT,
  }));
}
