export interface EffectiveTariffDutyInput {
  aec?: unknown;
  exAec?: unknown;
  fallbackRate?: number;
}

export interface EffectiveTariffDutyResult {
  effectiveRate: number;
  baseRate: number | null;
  exceptionCode: string | null;
  isBK: boolean;
  isBIT: boolean;
}

const PDF_COLUMN_HEADER_ARTIFACT = /^\(\d+\)$/;

function cleanScheduleCell(raw: unknown): string {
  if (typeof raw === 'number' && Number.isFinite(raw)) return String(raw);
  if (typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  if (!trimmed || PDF_COLUMN_HEADER_ARTIFACT.test(trimmed)) return '';
  return trimmed;
}

/**
 * Sanitizes official customs statistical/physical units (e.g. `kg`, `u`, `2u`, `l`, `m2`),
 * discarding empty cells and PDF table-header artifacts such as `(7)`.
 */
export function sanitizeStatisticalUnit(raw: unknown): string | null {
  const cleaned = cleanScheduleCell(raw);
  return cleaned.length > 0 ? cleaned : null;
}

/**
 * Resolves the effective Ad Valorem duty rate across NCM / Mercosur schedules:
 * - Parses BK / BIT capital & telecom flags on the community AEC rate.
 * - Applies immediate national exceptions marked with `"E"` (e.g. `98E`, `0E`, `35E`)
 *   over the base AEC rate while preserving conditional aeronautical markers (`"A"`).
 */
export function resolveEffectiveTariffDuty(
  input: EffectiveTariffDutyInput,
): EffectiveTariffDutyResult {
  const aecText = cleanScheduleCell(input.aec);
  const exAecText = cleanScheduleCell(input.exAec);

  const isBIT = /\bBIT\b|BIT$/i.test(aecText);
  const isBK = !isBIT && /\bBK\b|BK$/i.test(aecText);

  const aecMatch = aecText.match(/^(\d+(?:\.\d+)?)/);
  const parsedBase = aecMatch?.[1] ? Number.parseFloat(aecMatch[1]) : null;
  const fallback =
    typeof input.fallbackRate === 'number' && Number.isFinite(input.fallbackRate)
      ? input.fallbackRate
      : null;
  const baseRate = parsedBase ?? fallback;

  const exMatch = exAecText.match(/^(\d+(?:\.\d+)?)\s*([EA])?$/i);
  const exRate = exMatch?.[1] ? Number.parseFloat(exMatch[1]) : null;
  const exSuffix = exMatch?.[2]?.toUpperCase() ?? null;
  const exceptionCode = exAecText ? exAecText.replace(/\s+/g, '').toUpperCase() : null;

  const appliesImmediately = exRate !== null && (exSuffix === 'E' || exSuffix === null);
  const effectiveRate = appliesImmediately ? exRate : (baseRate ?? 0);

  return {
    effectiveRate,
    baseRate,
    exceptionCode,
    isBK,
    isBIT,
  };
}
