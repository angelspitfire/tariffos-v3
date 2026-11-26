import { describe, expect, it } from 'vitest';
import { SAAS_PLANS } from '@tariffos/shared-types';
import {
  isPlanAnnualOnly,
  isPlanCustomPricing,
  isPlanFree,
  isPlanOneTime,
  recommendSubscriptionPlan,
} from './plan-recommender';

describe('plan-recommender', () => {
  it('identifies pilot as one-time, agencia as recurring, and enterprise as custom pricing', () => {
    const pilot = SAAS_PLANS.find((p) => p.planId === 'pilot');
    const agencia = SAAS_PLANS.find((p) => p.planId === 'agencia');
    const enterprise = SAAS_PLANS.find((p) => p.planId === 'enterprise');

    expect(pilot).toBeDefined();
    expect(agencia).toBeDefined();
    expect(enterprise).toBeDefined();

    expect(isPlanOneTime(pilot!)).toBe(true);
    expect(isPlanFree(pilot!)).toBe(false);
    expect(isPlanFree(enterprise!)).toBe(false);
    expect(isPlanCustomPricing(enterprise!)).toBe(true);
    expect(isPlanAnnualOnly(agencia!)).toBe(false);
  });

  it('recommends pilot for evaluation volume and solo operator', () => {
    const rec = recommendSubscriptionPlan(
      {
        monthlyVolume: 'trial',
        teamSize: 'solo',
        needsBatch: false,
      },
      SAAS_PLANS,
    );

    expect(rec.planId).toBe('pilot');
    expect(rec.recommendedCycle).toBe('monthly');
  });

  it('recommends agencia for low or medium volume solo/small operator', () => {
    const rec = recommendSubscriptionPlan(
      {
        monthlyVolume: 'low',
        teamSize: 'solo',
        needsBatch: false,
      },
      SAAS_PLANS,
    );

    expect(rec.planId).toBe('agencia');
    expect(rec.recommendedCycle).toBe('monthly');
  });

  it('keeps agencia when batch processing is required for active volume', () => {
    const rec = recommendSubscriptionPlan(
      {
        monthlyVolume: 'medium',
        teamSize: 'small',
        needsBatch: true,
      },
      SAAS_PLANS,
    );

    expect(rec.planId).toBe('agencia');
    expect(rec.reasons.some((r) => r.toLowerCase().includes('lotes'))).toBe(true);
  });

  it('recommends enterprise for high/massive volume or multi-jurisdiction corporate teams', () => {
    const rec = recommendSubscriptionPlan(
      {
        monthlyVolume: 'high',
        teamSize: 'agency',
        needsBatch: true,
      },
      SAAS_PLANS,
    );

    expect(rec.planId).toBe('enterprise');
    expect(rec.estimatedUnitCostLabel).toBeUndefined();
  });

  it('excludes pilot when paidOnly recurring-only filter is enabled or respects pilot in paidOnly', () => {
    const rec = recommendSubscriptionPlan(
      {
        monthlyVolume: 'trial',
        teamSize: 'solo',
        needsBatch: false,
        paidOnly: true,
      },
      SAAS_PLANS,
    );

    expect(rec.planId).toBe('pilot');
  });
});
