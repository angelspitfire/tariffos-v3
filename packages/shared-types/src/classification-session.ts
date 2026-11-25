/**
 * Pipeline status at the moment a diagnostic (or session) is emitted.
 * `NEEDS_INFO` is set when the Normalizer's `clarifReq` is non-empty —
 * the pipeline must not adjudicate until the questions are answered.
 */
export const CLASSIFICATION_SESSION_STATUSES = [
  'ACTIVE',
  'NEEDS_INFO',
  'COMPLETED',
  'FAILED',
] as const;

export type ClassificationSessionStatus = (typeof CLASSIFICATION_SESSION_STATUSES)[number];
