import { describe, expect, it } from 'vitest';
import type { ManualPaymentRecord } from '@tariffos/shared-types';
import { computeEligiblePilotCredit, PILOT_CREDIT_USD } from './pilot-credit';

const BASE_PAYMENT: ManualPaymentRecord = {
  paymentId: 'pay-pilot-1',
  userId: 'u-1',
  tenantId: 'ten-1',
  userEmail: 'pagos@agencia.ve',
  planId: 'pilot',
  planName: 'Piloto Operativo',
  billingCycle: 'monthly',
  monthsCovered: 1,
  amount: 150,
  currency: 'USD',
  method: 'zelle',
  referenceCode: 'ZEL-101',
  paidAt: '2026-11-10T12:00:00.000Z',
  verifiedAt: '2026-11-10T14:00:00.000Z',
  status: 'verified',
};

describe('computeEligiblePilotCredit', () => {
  it('returns $150 credit when pilot was verified within 30 days and no agencia payment was verified yet', () => {
    const now = new Date('2026-11-26T12:00:00.000Z');
    const credit = computeEligiblePilotCredit([BASE_PAYMENT], now);
    expect(credit).toMatchObject({
      amountUsd: PILOT_CREDIT_USD,
      sourcePaymentId: 'pay-pilot-1',
    });
  });

  it('returns null after 30 days, for unverified pilots, or once agencia is already verified', () => {
    const expiredNow = new Date('2026-12-20T12:00:00.000Z');
    expect(computeEligiblePilotCredit([BASE_PAYMENT], expiredNow)).toBeNull();

    const pendingOnly: ManualPaymentRecord = { ...BASE_PAYMENT, status: 'pending_verification', verifiedAt: undefined };
    expect(computeEligiblePilotCredit([pendingOnly], new Date('2026-11-26T12:00:00.000Z'))).toBeNull();

    const upgraded: ManualPaymentRecord = {
      ...BASE_PAYMENT,
      paymentId: 'pay-agencia-1',
      planId: 'agencia',
      planName: 'Agencia',
      amount: 150,
    };
    expect(computeEligiblePilotCredit([BASE_PAYMENT, upgraded], new Date('2026-11-26T12:00:00.000Z'))).toBeNull();
  });
});
