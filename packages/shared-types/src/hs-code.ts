const HS_HEADING_DIGITS = 4;
const HS_SUBGROUP_DIGITS = 2;

/**
 * Extracts only numeric digits from an HS/NCM tariff code.
 */
export function extractHsDigits(rawCode: string): string {
  return rawCode.replace(/[^0-9]/g, '');
}

/**
 * Formats an HS/NCM tariff code with dot separators (4-digit heading followed by
 * 2-digit groups, e.g. `8471309090` -> `8471.30.90.90`, `210690` -> `2106.90`).
 * Returns trimmed input if fewer than 4 digits are present.
 */
export function formatHsCode(rawCode: string): string {
  const trimmed = rawCode.trim();
  const digits = extractHsDigits(trimmed);
  if (digits.length < HS_HEADING_DIGITS) return trimmed;
  if (digits.length === HS_HEADING_DIGITS) return digits;

  const parts = [digits.slice(0, HS_HEADING_DIGITS)];
  for (let i = HS_HEADING_DIGITS; i < digits.length; i += HS_SUBGROUP_DIGITS) {
    parts.push(digits.slice(i, i + HS_SUBGROUP_DIGITS));
  }
  return parts.join('.');
}
