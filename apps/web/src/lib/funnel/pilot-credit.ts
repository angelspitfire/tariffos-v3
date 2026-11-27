import type { ManualPaymentRecord } from '@tariffos/shared-types';

export const PILOT_CREDIT_USD = 150;
export const PILOT_CREDIT_WINDOW_DAYS = 30;
const DAY_MS = 86_400_000;

export interface EligiblePilotCredit {
  amountUsd: number;
  expiresAt: string;
  sourcePaymentId: string;
}

export function computeEligiblePilotCredit(
  payments: readonly ManualPaymentRecord[],
  now = new Date(),
): EligiblePilotCredit | null {
  const alreadyHasVerifiedAgencia = payments.some(
    (p) => p.planId === 'agencia' && p.status === 'verified',
  );
  if (alreadyHasVerifiedAgencia) return null;

  const verifiedPilots = payments
    .filter((p) => p.planId === 'pilot' && p.status === 'verified')
    .sort((a, b) => (b.verifiedAt ?? b.paidAt).localeCompare(a.verifiedAt ?? a.paidAt));

  const latestPilot = verifiedPilots[0];
  if (!latestPilot) return null;

  const anchorDate = new Date(latestPilot.verifiedAt ?? latestPilot.paidAt);
  if (Number.isNaN(anchorDate.getTime())) return null;

  const expiresAtMs = anchorDate.getTime() + PILOT_CREDIT_WINDOW_DAYS * DAY_MS;
  if (now.getTime() > expiresAtMs) return null;

  return {
    amountUsd: PILOT_CREDIT_USD,
    expiresAt: new Date(expiresAtMs).toISOString(),
    sourcePaymentId: latestPilot.paymentId,
  };
}
