export function digits(hs: string): string {
  return hs.replace(/[^0-9]/g, '');
}

/**
 * Dot a code the way the decree prints it: four digits, then pairs. A grouping
 * node's code is short and irregular (6 → "2106.90", 7 → "2106.90.2"), so this
 * dots exactly the digits present instead of padding to ten.
 */
export function formatCode(digitsText: string): string {
  if (digitsText.length <= 4) return digitsText;
  const parts = [digitsText.slice(0, 4)];
  for (let i = 4; i < digitsText.length; i += 2) parts.push(digitsText.slice(i, i + 2));
  return parts.join('.');
}

/** Alias for backward compatibility */
export const formatCodeLike = formatCode;

