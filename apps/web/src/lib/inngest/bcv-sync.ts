import { fetchBcvRates } from '@/lib/bcv/client';
import { persistBcvRates } from '@/lib/bcv/sync-service';
import { inngest } from './client';

export const BCV_SYNC_RETRIES = 4;

export const syncBcvRatesFn = inngest.createFunction(
  {
    id: 'sync-bcv-rates',
    retries: BCV_SYNC_RETRIES,
    triggers: [
      { cron: 'TZ=America/Caracas 0 8,17,19 * * 1-5' },
      { event: 'system/bcv-rate.sync' },
    ],
  },
  async ({ event, step }) => {
    const force = Boolean((event.data as { force?: boolean } | undefined)?.force);

    const quotes = await step.run('fetch-bcv-rates', async () => fetchBcvRates());
    const result = await step.run('persist-bcv-rates', async () =>
      persistBcvRates(quotes, { force }),
    );

    return {
      syncedAt: new Date().toISOString(),
      savedCount: result.saved.length,
      skippedCount: result.skipped.length,
      saved: result.saved,
      skipped: result.skipped,
    };
  },
);
