import { describe, it, expect } from 'vitest';
import {
  convertCustomsCurrency,
  formatCustomsCurrency,
  CUSTOMS_EXCHANGE_RATES,
} from './exchange-rate';

describe('exchange-rate', () => {
  it('converts USD to Venezuelan Bolivars (Bs.) at official customs rate', () => {
    const usdAmount = 1000;
    const rate = CUSTOMS_EXCHANGE_RATES['VE'].rate;
    const bs = convertCustomsCurrency(usdAmount, 'VE');

    expect(bs).toBe(usdAmount * rate);
  });

  it('converts USD to Colombian Pesos (COP) at official TRM rate', () => {
    const usdAmount = 100;
    const rate = CUSTOMS_EXCHANGE_RATES['CO'].rate;
    const cop = convertCustomsCurrency(usdAmount, 'CO');

    expect(cop).toBe(usdAmount * rate);
  });

  it('formats currency with appropriate symbols and locale', () => {
    expect(formatCustomsCurrency(1500, 'USD')).toBe('$1,500.00 USD');
    expect(formatCustomsCurrency(48500, 'Bs.')).toContain('Bs.');
    expect(formatCustomsCurrency(412000, 'COP')).toContain('COP');
  });
});
