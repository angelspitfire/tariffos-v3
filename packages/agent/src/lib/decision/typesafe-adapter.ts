import { TypeSafeClient } from '@typesafe-ai/sdk';
import type { DecisionProvider, SystemOneFn, SystemOneBatchFn } from './provider.js';

/** TypeSafe Jev decision provider — wraps the hosted TypeSafe client. */
function createTypesafeProvider(): DecisionProvider {
  let client: TypeSafeClient | null = null;

  function getClient(): TypeSafeClient {
    if (!client) {
      const apiKey = process.env.TYPESAFE_API_KEY;
      if (!apiKey) {
        throw new Error('TYPESAFE_API_KEY is not set. Populate it in .env.local — TypeSafe judgments refuse to run without a key.');
      }
      client = new TypeSafeClient({ apiKey });
    }
    return client;
  }

  const systemOne: SystemOneFn = async (request, options) => {
    return getClient().systemOne(request, options);
  };

  // TypeSafe doesn't have batch; callers must fall back to systemOne
  const systemOneBatch: SystemOneBatchFn = async (requests, options) => {
    return Promise.all(requests.map((r) => systemOne(r, options)));
  };

  return {
    name: 'typesafe-jev',
    systemOne,
    systemOneBatch,
  };
}

let cached: DecisionProvider | null = null;

export function typesafeProvider(): DecisionProvider {
  if (!cached) {
    cached = createTypesafeProvider();
  }
  return cached;
}
