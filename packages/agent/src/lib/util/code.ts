import { extractHsDigits, formatHsCode } from '@tariffos/shared-types';

export function digits(hs: string): string {
  return extractHsDigits(hs);
}

/**
 * Dot a code the way the decree prints it: four digits, then pairs. A grouping
 * node's code is short and irregular (6 → "2106.90", 7 → "2106.90.2"), so this
 * dots exactly the digits present instead of padding to ten.
 */
export function formatCode(digitsText: string): string {
  return formatHsCode(digitsText);
}

/** Alias for backward compatibility */
export const formatCodeLike = formatCode;

