/**
 * Currency value object for ISO 4217 currency codes.
 */

export class CurrencyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CurrencyError';
  }
}

export interface CurrencyInfo {
  code: string;
  symbol: string;
  decimals: number;
  name: string;
}

export class Currency {
  private static readonly REGISTRY: ReadonlyMap<string, CurrencyInfo> = new Map([
    ['USD', { code: 'USD', symbol: '$', decimals: 2, name: 'US Dollar' }],
    ['EUR', { code: 'EUR', symbol: '€', decimals: 2, name: 'Euro' }],
    ['VES', { code: 'VES', symbol: 'Bs.', decimals: 2, name: 'Venezuelan Bolívar' }],
    ['CNY', { code: 'CNY', symbol: '¥', decimals: 2, name: 'Chinese Yuan' }],
    ['COP', { code: 'COP', symbol: '$', decimals: 0, name: 'Colombian Peso' }],
    ['BRL', { code: 'BRL', symbol: 'R$', decimals: 2, name: 'Brazilian Real' }],
    ['MXN', { code: 'MXN', symbol: '$', decimals: 2, name: 'Mexican Peso' }],
    ['ARS', { code: 'ARS', symbol: '$', decimals: 2, name: 'Argentine Peso' }],
  ]);

  private readonly _info: CurrencyInfo;

  private constructor(info: CurrencyInfo) {
    this._info = info;
  }

  static fromCode(code: string): { ok: true; value: Currency } | { ok: false; error: CurrencyError } {
    const normalized = code.toUpperCase();
    const info = Currency.REGISTRY.get(normalized);
    if (!info) {
      return { ok: false, error: new CurrencyError(`Unsupported currency code: ${code}`) };
    }
    return { ok: true, value: new Currency(info) };
  }

  static fromCodeUnsafe(code: string): Currency {
    const result = Currency.fromCode(code);
    if (!result.ok) throw result.error;
    return result.value;
  }

  static getSupportedCodes(): string[] {
    return Array.from(Currency.REGISTRY.keys());
  }

  get code(): string { return this._info.code; }
  get symbol(): string { return this._info.symbol; }
  get decimals(): number { return this._info.decimals; }
  get name(): string { return this._info.name; }

  format(amount: number, options: { showSymbol?: boolean; showCode?: boolean } = {}): string {
    const { showSymbol = true, showCode = false } = options;
    const formatted = amount.toLocaleString('en-US', {
      minimumFractionDigits: this._info.decimals,
      maximumFractionDigits: this._info.decimals,
    });
    let result = '';
    if (showSymbol) result += this._info.symbol + ' ';
    result += formatted;
    if (showCode) result += ` ${this._info.code}`;
    return result.trim();
  }

  parse(value: string): number {
    const cleaned = value.replace(/[^\d.,-]/g, '').replace(',', '');
    return parseFloat(cleaned);
  }

  equals(other: Currency): boolean {
    return this._info.code === other._info.code;
  }

  toString(): string { return this._info.code; }
}
