import { describe, expect, it } from 'vitest';
import {
  computePlanStatus,
  countClassifications,
  mergeCloudUsageIntoPlanStatus,
  PLAN_WARNING_RATIO,
} from './plan-status';
import type { WorkspaceThread } from './types';

function threadWithResults(results: number): WorkspaceThread {
  const now = new Date().toISOString();
  return {
    id: 't1',
    title: 'Hilo',
    jurisdictionId: 've-seniat',
    status: 'regular',
    createdAt: now,
    updatedAt: now,
    messages: Array.from({ length: results }, (_, i) => ({
      id: `m${i}`,
      role: 'assistant' as const,
      text: '',
      createdAt: now,
      jurisdictionId: 've-seniat',
      envelope: {
        workflowState: 'classified',
        inlineComponents: [{ type: 'verdict', hsCode: '9018.12.10.00' }],
        canvasComponents: [],
      },
    })) as unknown as WorkspaceThread['messages'],
  };
}

describe('plan status', () => {
  it('counts only assistant turns that carry a classification result', () => {
    expect(countClassifications([threadWithResults(3)])).toBe(3);
    expect(countClassifications([])).toBe(0);
  });

  it('flags trial usage against the 5-classification quota', () => {
    const status = computePlanStatus([threadWithResults(1)], 'trial');
    expect(status.isTrial).toBe(true);
    expect(status.quotaLimit).toBe(5);
    expect(status.usagePct).toBe(20);
    expect(status.nearLimit).toBe(false);
    expect(status.exhausted).toBe(false);
  });

  it('warns near the limit and marks exhaustion', () => {
    const near = computePlanStatus([threadWithResults(4)], 'trial');
    expect(near.usagePct / 100).toBeGreaterThanOrEqual(PLAN_WARNING_RATIO);
    expect(near.nearLimit).toBe(true);
    const done = computePlanStatus([threadWithResults(5)], 'trial');
    expect(done.exhausted).toBe(true);
  });

  it('uses the selected paid plan quota and is not flagged as trial', () => {
    const status = computePlanStatus([threadWithResults(2)], 'basico');
    expect(status.isTrial).toBe(false);
    expect(status.quotaLimit).toBeGreaterThan(5);
  });

  it('merges live cloud usage into plan status including CANCELED state', () => {
    const local = computePlanStatus([], 'trial');
    const merged = mergeCloudUsageIntoPlanStatus(local, {
      tenantId: 'ten-1',
      tenantName: 'Aduanas Alpha',
      planId: 'pro',
      planName: 'Pro',
      billingStatus: 'CANCELED',
      allowOverage: false,
      month: 11,
      year: 2026,
      used: 350,
      limit: 400,
      percentUsed: 88,
      inputTokens: 1000,
      outputTokens: 500,
    });
    expect(merged.planName).toBe('Pro');
    expect(merged.quotaUsed).toBe(350);
    expect(merged.quotaLimit).toBe(400);
    expect(merged.nearLimit).toBe(true);
    expect(merged.billingStatus).toBe('CANCELED');
    expect(merged.isTrial).toBe(false);
  });
});
