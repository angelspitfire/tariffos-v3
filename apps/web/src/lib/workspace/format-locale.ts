const currencyFormatters = new Map<string, Intl.NumberFormat>();

function getNumberFormatter(
  locale: string,
  minimumFractionDigits: number,
  maximumFractionDigits: number,
): Intl.NumberFormat {
  const key = `${locale}:${minimumFractionDigits}:${maximumFractionDigits}`;
  let formatter = currencyFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      minimumFractionDigits,
      maximumFractionDigits,
    });
    currencyFormatters.set(key, formatter);
  }
  return formatter;
}

export function formatCurrencyAmount(
  currencyCode: string,
  amount: number,
  options?: {
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  },
): string {
  const locale = options?.locale ?? 'en-US';
  const minDigits = options?.minimumFractionDigits ?? 2;
  const maxDigits = options?.maximumFractionDigits ?? 2;
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const formatted = getNumberFormatter(locale, minDigits, maxDigits).format(safeAmount);
  return `${currencyCode} ${formatted}`;
}

export function formatShortDate(value: Date | string, locale = 'es-VE'): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}
