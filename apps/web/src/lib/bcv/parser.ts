export type BcvPair = 'USD/VES' | 'EUR/VES';

export interface BcvRateQuote {
  pair: BcvPair;
  rate: number;
  valueDate: string;
  source: string;
}

export const MIN_VALID_RATE = 0.01;
export const MAX_VALID_RATE = 100_000;
export const MAX_RATE_DELTA_RATIO = 0.25;

const SPANISH_MONTHS: Record<string, string> = {
  enero: '01',
  febrero: '02',
  marzo: '03',
  abril: '04',
  mayo: '05',
  junio: '06',
  julio: '07',
  agosto: '08',
  septiembre: '09',
  setiembre: '09',
  octubre: '10',
  noviembre: '11',
  diciembre: '12',
};

export function parseVenezuelanDecimal(raw: string): number | null {
  const cleaned = raw.replace(/\s+/g, '').trim();
  if (!cleaned) return null;

  let normalized = cleaned;
  if (cleaned.includes(',') && cleaned.includes('.')) {
    normalized = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (cleaned.includes(',')) {
    normalized = cleaned.replace(',', '.');
  }

  if (!/^\d+(\.\d+)?$/.test(normalized)) return null;
  const parsed = Number.parseFloat(normalized);
  if (!Number.isFinite(parsed) || parsed < MIN_VALID_RATE || parsed > MAX_VALID_RATE) {
    return null;
  }
  return Math.round(parsed * 10_000) / 10_000;
}

function extractValueDateFromHtml(html: string, fallbackDateIso: string): string {
  const contentMatch = html.match(
    /class=["'][^"']*date-display-single[^"']*["'][^>]*content=["'](\d{4}-\d{2}-\d{2})/i,
  );
  if (contentMatch?.[1]) {
    return contentMatch[1];
  }

  const spanMatch = html.match(
    /class=["'][^"']*date-display-single[^"']*["'][^>]*>([^<]+)</i,
  );
  if (spanMatch?.[1]) {
    const text = spanMatch[1].toLowerCase();
    const dateMatch = text.match(/(\d{1,2})\s+([a-záéíóú]+)\s+(\d{4})/i);
    if (dateMatch) {
      const day = dateMatch[1].padStart(2, '0');
      const month = SPANISH_MONTHS[dateMatch[2]];
      const year = dateMatch[3];
      if (month) return `${year}-${month}-${day}`;
    }
  }

  return fallbackDateIso.slice(0, 10);
}

function extractCurrencyBlockRate(html: string, blockId: 'dolar' | 'euro'): number | null {
  const regex = new RegExp(
    `id=["']${blockId}["'][\\s\\S]{0,600}?<strong>\\s*([^<]+?)\\s*<\\/strong>`,
    'i',
  );
  const match = html.match(regex);
  if (!match?.[1]) return null;
  return parseVenezuelanDecimal(match[1]);
}

export function parseBcvHtml(
  html: string,
  fallbackDateIso: string = new Date().toISOString(),
): BcvRateQuote[] {
  const usdRate = extractCurrencyBlockRate(html, 'dolar');
  const eurRate = extractCurrencyBlockRate(html, 'euro');

  if (usdRate === null || eurRate === null) {
    throw new Error('BCV HTML did not contain valid #dolar and #euro rate blocks');
  }

  const valueDate = extractValueDateFromHtml(html, fallbackDateIso);
  return [
    { pair: 'USD/VES', rate: usdRate, valueDate, source: 'bcv.org.ve' },
    { pair: 'EUR/VES', rate: eurRate, valueDate, source: 'bcv.org.ve' },
  ];
}

export function validateRateDelta(
  previousRate: number | null | undefined,
  nextRate: number,
  maxDeltaRatio: number = MAX_RATE_DELTA_RATIO,
): boolean {
  if (!previousRate || previousRate <= 0) return true;
  const deltaRatio = Math.abs(nextRate - previousRate) / previousRate;
  return deltaRatio <= maxDeltaRatio;
}
