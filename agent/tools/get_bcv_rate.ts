import { defineTool } from 'eve/tools';
import { z } from 'zod';
import type { CachedBcvRatesResponse } from '../../apps/web/src/lib/bcv/cached-rates';

export const GetBcvRateInputSchema = z.object({
  pair: z.enum(['USD/VES', 'EUR/VES', 'ALL']).default('ALL'),
  refresh: z.boolean().default(false),
});

export type GetBcvRateInput = z.infer<typeof GetBcvRateInputSchema>;

type BcvRateLoader = (opts?: { forceRefresh?: boolean }) => Promise<CachedBcvRatesResponse>;

/** Returns cached or freshly synced BCV official exchange rates for Eve turns. */
export async function executeGetBcvRate(
  input: GetBcvRateInput,
  loader?: BcvRateLoader,
) {
  const load =
    loader ??
    (async (opts?: { forceRefresh?: boolean }) => {
      const { getCachedBcvRates } = await import('../../apps/web/src/lib/bcv/cached-rates');
      return getCachedBcvRates(opts);
    });

  const data = await load({ forceRefresh: input.refresh });
  return {
    ...data,
    selectedRate: input.pair === 'ALL' ? null : data.rates[input.pair],
  };
}

export default defineTool({
  description:
    'Get current official BCV USD/VES and EUR/VES exchange rates (served from cache with optional live refresh).',
  inputSchema: GetBcvRateInputSchema,
  execute: (input) => executeGetBcvRate(input),
});
