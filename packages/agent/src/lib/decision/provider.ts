import type { Questions, RequestOptions, SystemOneRequest, SystemOneResult } from '@typesafe-ai/sdk';
import { typesafeProvider } from './typesafe-adapter.js';

export type SystemOneFn = (
  request: SystemOneRequest,
  options?: RequestOptions,
) => Promise<SystemOneResult<Questions>>;

export type SystemOneBatchFn = (
  requests: SystemOneRequest[],
  options?: RequestOptions,
) => Promise<SystemOneResult<Questions>[]>;

export interface DecisionProvider {
  readonly name: string;
  readonly systemOne: SystemOneFn;
  readonly systemOneBatch?: SystemOneBatchFn;
}

/** Default hosted System One decision provider. */
export function defaultProvider(): DecisionProvider {
  return typesafeProvider();
}
