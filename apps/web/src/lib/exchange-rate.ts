/**
 * Official customs exchange rate module for tax settlement calculations.
 */

export const OFFICIAL_RATE_VE_BS = 48.5;
export const OFFICIAL_RATE_CO_COP = 4120;
export const OFFICIAL_RATE_USD = 1.0;
export const CURRENCY_DECIMALS_STANDARD = 2;

export interface CustomsRateInfo {
  code: string;
  currencyName: string;
  symbol: string;
  rate: number; // against 1 USD
  officialSource: string;
}

export const CUSTOMS_EXCHANGE_RATES: Record<string, CustomsRateInfo> = {
  VE: {
    code: 'Bs.',
    currencyName: 'Bolívares Digitales',
    symbol: 'Bs.',
    rate: OFFICIAL_RATE_VE_BS,
    officialSource: 'Banco Central de Venezuela (BCV Oficial)',
  },
  CO: {
    code: 'COP',
    currencyName: 'Pesos Colombianos',
    symbol: '$',
    rate: OFFICIAL_RATE_CO_COP,
    officialSource: 'Superintendencia Financiera / TRM DIAN',
  },
  US: {
    code: 'USD',
    currencyName: 'Dólares Americanos',
    symbol: '$',
    rate: OFFICIAL_RATE_USD,
    officialSource: 'US Customs & Border Protection (CBP)',
  },
};

export function convertCustomsCurrency(amountUsd: number, countryCode: 'VE' | 'CO' | 'US' = 'VE'): number {
  const rateInfo = CUSTOMS_EXCHANGE_RATES[countryCode] ?? CUSTOMS_EXCHANGE_RATES['VE'];
  return amountUsd * rateInfo.rate;
}

export function formatCustomsCurrency(amount: number, currencyCode: string): string {
  if (currencyCode === 'USD') {
    return `$${amount.toLocaleString('en-US', {
      minimumFractionDigits: CURRENCY_DECIMALS_STANDARD,
      maximumFractionDigits: CURRENCY_DECIMALS_STANDARD,
    })} USD`;
  }

  if (currencyCode === 'Bs.') {
    return `Bs. ${amount.toLocaleString('es-VE', {
      minimumFractionDigits: CURRENCY_DECIMALS_STANDARD,
      maximumFractionDigits: CURRENCY_DECIMALS_STANDARD,
    })}`;
  }

  return `$${amount.toLocaleString('es-CO', {
    minimumFractionDigits: CURRENCY_DECIMALS_STANDARD,
    maximumFractionDigits: CURRENCY_DECIMALS_STANDARD,
  })} ${currencyCode}`;
}
