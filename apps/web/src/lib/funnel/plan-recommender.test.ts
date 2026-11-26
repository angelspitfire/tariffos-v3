import { describe, expect, it } from 'vitest';
import { SAAS_PLANS } from '@tariffos/shared-types';
import {
  isPlanAnnualOnly,
  isPlanFree,
  recommendSubscriptionPlan,
} from './plan-recommender';

describe('plan-recommender', () => {
  it('identifies trial as free and corporate as annual-only', () => {
    const trial = SAAS_PLANS.find((p) => p.planId === 'trial');
    const corporate = SAAS_PLANS.find((p) => p.planId === 'corporate');
    const pro = SAAS_PLANS.find((p) => p.planId === 'pro');

    expect(trial).toBeDefined();
    expect(corporate).toBeDefined();
    expect(pro).toBeDefined();

    expect(isPlanFree(trial!)).toBe(true);
    expect(isPlanFree(pro!)).toBe(false);
    expect(isPlanAnnualOnly(corporate!)).toBe(true);
    expect(isPlanAnnualOnly(pro!)).toBe(false);
  });

  it('recommends trial for evaluation volume and solo operator', () => {
    const rec = recommendSubscriptionPlan(
      {
        monthlyVolume: 'trial',
        teamSize: 'solo',
        needsBatch: false,
      },
      SAAS_PLANS,
    );

    expect(rec.planId).toBe('trial');
    expect(rec.recommendedCycle).toBe('monthly');
  });

  it('recommends basico for low volume solo operator without batch', () => {
    const rec = recommendSubscriptionPlan(
      {
        monthlyVolume: 'low',
        teamSize: 'solo',
        needsBatch: false,
      },
      SAAS_PLANS,
    );

    expect(rec.planId).toBe('basico');
    expect(rec.recommendedCycle).toBe('monthly');
  });

  it('upgrades low volume to pro when batch processing is required', () => {
    const rec = recommendSubscriptionPlan(
      {
        monthlyVolume: 'low',
        teamSize: 'solo',
        needsBatch: true,
      },
      SAAS_PLANS,
    );

    expect(rec.planId).toBe('pro');
    expect(rec.reasons.some((r) => r.toLowerCase().includes('lotes'))).toBe(true);
  });

  it('recommends enterprise for agency teams (4-10 users) or high volume', () => {
    const rec = recommendSubscriptionPlan(
      {
        monthlyVolume: 'high',
        teamSize: 'agency',
        needsBatch: true,
      },
      SAAS_PLANS,
    );

    expect(rec.planId).toBe('enterprise');
  });

  it('locks corporate recommendation to annual cycle', () => {
    const rec = recommendSubscriptionPlan(
      {
        monthlyVolume: 'massive',
        teamSize: 'corporate',
        needsBatch: true,
      },
      SAAS_PLANS,
    );

    expect(rec.planId).toBe('corporate');
    expect(rec.recommendedCycle).toBe('annual');
  });

  it('excludes trial when paidOnly is enabled', () => {
    const rec = recommendSubscriptionPlan(
      {
        monthlyVolume: 'trial',
        teamSize: 'solo',
        needsBatch: false,
        paidOnly: true,
      },
      SAAS_PLANS,
    );

    expect(rec.planId).toBe('basico');
  });
});
