import { describe, expect, it } from 'vitest';
import {
  AUTO_APPROVE_CONFIDENCE_THRESHOLD,
  HIGH_CONFIDENCE_THRESHOLD,
  MEDIUM_CONFIDENCE_THRESHOLD,
  REVIEW_CONFIDENCE_THRESHOLD,
  SUPPORTED_LIVE_COUNTRIES,
  isSupportedLiveCountry,
} from './thresholds.js';
import { LOW_CONFIDENCE_REVIEW_THRESHOLD } from './dossier-approval-policy.js';
import { HITL_CONFIDENCE_THRESHOLD } from './merceological-hitl.js';

describe('unified confidence thresholds and live countries', () => {
  it('aligns approval policy and HITL gate to REVIEW_CONFIDENCE_THRESHOLD', () => {
    expect(LOW_CONFIDENCE_REVIEW_THRESHOLD).toBe(REVIEW_CONFIDENCE_THRESHOLD);
    expect(HITL_CONFIDENCE_THRESHOLD).toBe(REVIEW_CONFIDENCE_THRESHOLD);
    expect(HIGH_CONFIDENCE_THRESHOLD).toBe(AUTO_APPROVE_CONFIDENCE_THRESHOLD);
    expect(MEDIUM_CONFIDENCE_THRESHOLD).toBeLessThan(REVIEW_CONFIDENCE_THRESHOLD);
  });

  it('allows only VE in live mode until additional tariff schedules are loaded', () => {
    expect(SUPPORTED_LIVE_COUNTRIES).toEqual(['VE']);
    expect(isSupportedLiveCountry('VE')).toBe(true);
    expect(isSupportedLiveCountry('ve')).toBe(true);
    expect(isSupportedLiveCountry('US')).toBe(false);
    expect(isSupportedLiveCountry('MX')).toBe(false);
  });
});
