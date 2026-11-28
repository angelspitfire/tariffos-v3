import type { TariffCandidateRecord } from '@tariffos/agent';
import { prisma } from '@tariffos/database';

const DEFAULT_AD_VALOREM_FALLBACK = 0;
const DEFAULT_IVA_FALLBACK = 16;
const DEFAULT_UNIT = 'u';
const EXPIRY_ALERT_WINDOW_MS = 45 * 24 * 60 * 60 * 1000;

export async function verifyHsCodeAgainstPrisma(
  countryCode: string,
  variants: string[],
): Promise<TariffCandidateRecord | null> {
  const now = new Date();
  const exemptionDelegate = (
    prisma as unknown as {
      tariffExemptionRule?: {
        findFirst: (args: unknown) => Promise<{
          programCode: string;
          title: string;
          decreeRef: string;
          gazetteRef?: string | null;
          exemptAdValoremPct?: number | null;
          exemptVatPct?: number | null;
          requiredPermitCode?: string | null;
          conditionsSummary?: string | null;
          validToDate?: Date | null;
        } | null>;
      };
    }
  ).tariffExemptionRule;

  const [row, permits, exemption] = await Promise.all([
    prisma.nationalTariff.findFirst({
      where: {
        countryCode,
        hsCode: { in: variants },
        isActive: true,
        isDerogated: false,
      },
    }),
    prisma.hsPermitRequirement.findMany({
      where: { hsCode: { in: variants }, permitType: { countryCode } },
      include: { permitType: true },
    }),
    exemptionDelegate
      ? exemptionDelegate.findFirst({
          where: {
            countryCode,
            hsCode: { in: variants },
            isActive: true,
            validFromDate: { lte: now },
            OR: [{ validToDate: null }, { validToDate: { gte: now } }],
          },
        })
      : Promise.resolve(null),
  ]);
  if (!row) return null;

  const rowExt = row as typeof row & {
    statisticalUnit?: string | null;
    baseAdValorem?: number | null;
    tariffExceptionCode?: string | null;
  };
  const validToIso = exemption?.validToDate
    ? exemption.validToDate.toISOString().slice(0, 10)
    : undefined;
  const expiringSoon = Boolean(
    exemption?.validToDate &&
      exemption.validToDate.getTime() - now.getTime() <= EXPIRY_ALERT_WINDOW_MS,
  );

  return {
    hsCode: row.hsCode,
    description: row.description,
    adValoremRate: row.adValorem ?? DEFAULT_AD_VALOREM_FALLBACK,
    ...(typeof rowExt.baseAdValorem === 'number'
      ? { baseAdValoremRate: rowExt.baseAdValorem }
      : {}),
    ...(rowExt.tariffExceptionCode
      ? { tariffExceptionCode: rowExt.tariffExceptionCode }
      : {}),
    ivaRate: row.iva ?? DEFAULT_IVA_FALLBACK,
    unit: rowExt.statisticalUnit?.trim() || DEFAULT_UNIT,
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
    ...(exemption
      ? {
          activeExemption: {
            programCode: exemption.programCode,
            title: exemption.title,
            decreeRef: exemption.decreeRef,
            ...(exemption.gazetteRef ? { gazetteRef: exemption.gazetteRef } : {}),
            ...(typeof exemption.exemptAdValoremPct === 'number'
              ? { exemptAdValoremPct: exemption.exemptAdValoremPct }
              : {}),
            ...(typeof exemption.exemptVatPct === 'number'
              ? { exemptVatPct: exemption.exemptVatPct }
              : {}),
            ...(exemption.requiredPermitCode
              ? { requiredPermitCode: exemption.requiredPermitCode }
              : {}),
            ...(exemption.conditionsSummary
              ? { conditionsSummary: exemption.conditionsSummary }
              : {}),
            ...(validToIso ? { validToDate: validToIso } : {}),
            expiringSoon,
          },
        }
      : {}),
  };
}
