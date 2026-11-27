import { defineTool } from 'eve/tools';
import { z } from 'zod';

const IncotermSchema = z.enum(['EXW', 'FOB', 'CFR', 'CIF', 'DDP']);

export default defineTool({
  description:
    'Recalculate deterministic CIF valuation, customs service fees, preferential discounts, antidumping, and landed cost in USD and VES without re-running tariff classification.',
  inputSchema: z.object({
    jurisdictionId: z.string().default('ve-seniat'),
    hsCode: z.string().min(4),
    originCode: z.string().default('CN'),
    incoterm: IncotermSchema.default('FOB'),
    invoiceAmount: z.number().nonnegative(),
    originChargesAmount: z.number().nonnegative().default(0),
    freightAmount: z.number().nonnegative().default(0),
    insuranceAmount: z.number().nonnegative().default(0),
    baseAdValoremPercent: z.number().nonnegative(),
    vatPercent: z.number().nonnegative().default(16),
    customsFeePercent: z.number().nonnegative().default(1),
    exchangeRate: z.number().positive().optional(),
    applyExemption: z.boolean().default(false),
    hasCertificateOfOrigin: z.boolean().default(false),
    applyAntidumping: z.boolean().default(false),
    antidumpingPercent: z.number().nonnegative().default(0),
  }),
  async execute(input) {
    let exchangeRate = input.exchangeRate;
    if (exchangeRate === undefined) {
      try {
        const { getCachedBcvRates } = await import('../../apps/web/src/lib/bcv/cached-rates');
        const bcv = await getCachedBcvRates();
        exchangeRate = bcv.rates['USD/VES'].rate;
      } catch {
        exchangeRate = 40;
      }
    }
    const { calculateFullDuties } = await import('@tariffos/agent');
    return calculateFullDuties({ ...input, exchangeRate });
  },
});
