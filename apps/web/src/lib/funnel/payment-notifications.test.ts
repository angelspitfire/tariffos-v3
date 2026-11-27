import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ManualPaymentRecord } from '@tariffos/shared-types';
import { notifyPaymentSubmitted } from './payment-notifications';

const SAMPLE_PAYMENT: ManualPaymentRecord = {
  paymentId: 'pay-901',
  userId: 'usr-1',
  tenantId: 'ten-1',
  userEmail: 'pagos@caribe.ve',
  companyName: 'Aduanas Caribe C.A.',
  planId: 'pilot',
  planName: 'Piloto Operativo',
  billingCycle: 'monthly',
  monthsCovered: 1,
  amount: 150,
  currency: 'USD',
  method: 'zelle',
  referenceCode: 'ZEL-882211',
  paidAt: '2026-11-26T20:00:00.000Z',
  status: 'pending_verification',
};

describe('notifyPaymentSubmitted', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('sends webhook payload and admin email when BILLING_WEBHOOK_URL and RESEND_API_KEY are configured', async () => {
    vi.stubEnv('BILLING_WEBHOOK_URL', 'https://hooks.tariffos.test/billing');
    vi.stubEnv('RESEND_API_KEY', 're_test_123');
    vi.stubEnv('PLATFORM_ADMIN_EMAILS', 'founder@tariffos.app, ops@tariffos.app');
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://tariffos.app');

    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await notifyPaymentSubmitted(SAMPLE_PAYMENT);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://hooks.tariffos.test/billing',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"event":"payment.submitted"'),
      }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.resend.com/emails',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('ZEL-882211'),
      }),
    );
  });

  it('swallows network failures gracefully without throwing', async () => {
    vi.stubEnv('LEADS_WEBHOOK_URL', 'https://hooks.tariffos.test/fallback');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));

    await expect(notifyPaymentSubmitted(SAMPLE_PAYMENT)).resolves.toBeUndefined();
  });
});
