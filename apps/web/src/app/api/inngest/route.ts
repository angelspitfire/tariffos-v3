import { serve } from 'inngest/next';
import { syncBcvRatesFn } from '@/lib/inngest/bcv-sync';
import { inngest } from '@/lib/inngest/client';
import { inngestFunctions } from '@/lib/inngest/functions';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [...inngestFunctions, syncBcvRatesFn],
});
