import { describe, expect, it } from 'vitest';
import {
  computePlanStatus,
  countClassifications,
  mergeCloudUsageIntoPlanStatus,
  PLAN_WARNING_RATIO,
  resolveWorkspaceReadOnlyReason,
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

  it('flags pilot usage against the 250-classification quota', () => {
    const status = computePlanStatus([threadWithResults(50)], 'pilot');
    expect(status.isTrial).toBe(false);
    expect(status.isPilot).toBe(true);
    expect(status.quotaLimit).toBe(250);
    expect(status.usagePct).toBe(20);
    expect(status.nearLimit).toBe(false);
    expect(status.exhausted).toBe(false);
  });

  it('warns near the limit and marks exhaustion', () => {
    const near = computePlanStatus([threadWithResults(200)], 'pilot');
    expect(near.usagePct / 100).toBeGreaterThanOrEqual(PLAN_WARNING_RATIO);
    expect(near.nearLimit).toBe(true);
    const done = computePlanStatus([threadWithResults(250)], 'pilot');
    expect(done.exhausted).toBe(true);
  });

  it('uses the selected agencia plan quota and is not flagged as trial or pilot', () => {
    const status = computePlanStatus([threadWithResults(2)], 'agencia');
    expect(status.isTrial).toBe(false);
    expect(status.isPilot).toBe(false);
    expect(status.quotaLimit).toBe(1000);
  });

  it('resolves read-only reason for PAST_DUE, CANCELED, and exhausted accounts', () => {
    expect(resolveWorkspaceReadOnlyReason(null)).toBeNull();
    expect(
      resolveWorkspaceReadOnlyReason({
        tenantId: 't1',
        tenantName: 'A',
        planId: 'pilot',
        planName: 'Piloto Operativo',
        billingStatus: 'PAST_DUE',
        allowOverage: false,
        month: 11,
        year: 2026,
        used: 0,
        limit: 0,
        percentUsed: 0,
        inputTokens: 0,
        outputTokens: 0,
      }),
    ).toMatch(/Piloto Operativo|Activa/i);
    expect(
      resolveWorkspaceReadOnlyReason({
        tenantId: 't1',
        tenantName: 'A',
        planId: 'agencia',
        planName: 'Agencia',
        billingStatus: 'ACTIVE',
        allowOverage: false,
        month: 11,
        year: 2026,
        used: 100,
        limit: 1000,
        percentUsed: 10,
        inputTokens: 0,
        outputTokens: 0,
      }),
    ).toBeNull();
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

  it('marks TariffOS internal unlimited plan as isUnlimited without nearLimit or exhaustion', () => {
    const local = computePlanStatus([], 'pilot');
    const snapshot = {
      tenantId: 'ten-tariffos',
      tenantName: 'TariffOS',
      planId: 'tariffos_internal',
      planName: 'TariffOS Interno (Ilimitado)',
      billingStatus: 'ACTIVE' as const,
      allowOverage: true,
      unlimited: true,
      allowBatch: true,
      month: 11,
      year: 2026,
      used: 250000,
      limit: 0,
      percentUsed: 0,
      inputTokens: 900000,
      outputTokens: 300000,
    };
    const merged = mergeCloudUsageIntoPlanStatus(local, snapshot);
    expect(merged.isUnlimited).toBe(true);
    expect(merged.nearLimit).toBe(false);
    expect(merged.exhausted).toBe(false);
    expect(merged.usagePct).toBe(0);
    expect(resolveWorkspaceReadOnlyReason(snapshot)).toBeNull();
  });
});
