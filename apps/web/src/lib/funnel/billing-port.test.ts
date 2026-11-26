import { beforeEach, describe, expect, it } from 'vitest';
import { createBillingActivationAdapter } from './billing-port';

describe('billing-port (offline/mock adapter)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('seeds realistic demo payments and submits a new manual payment', async () => {
    const adapter = createBillingActivationAdapter({ cloudMode: false });
    const initial = await adapter.listPayments();
    expect(initial.length).toBeGreaterThanOrEqual(2);

    const created = await adapter.submitPayment({
      planId: 'pro',
      billingCycle: 'monthly',
      method: 'zelle',
      amount: 299,
      currency: 'USD',
      referenceCode: 'ZEL-778899',
      paidAt: '2026-11-25',
      payerName: 'Importadora Sol C.A.',
      payerEmail: 'pagos@sol.ve',
    });

    expect(created.status).toBe('pending_verification');
    expect(created.referenceCode).toBe('ZEL-778899');

    const status = await adapter.getWorkspacePlanStatus(2);
    expect(status.status).toBe('pending_verification');
    expect(status.pendingActivation?.referenceCode).toBe('ZEL-778899');
  });

  it('approves a pending payment and activates the workspace plan', async () => {
    const adapter = createBillingActivationAdapter({ cloudMode: false });
    const created = await adapter.submitPayment({
      planId: 'agencia',
      billingCycle: 'annual',
      method: 'transferencia_usd',
      amount: 3000,
      currency: 'USD',
      referenceCode: 'WIRE-9011',
      paidAt: '2026-11-25',
      payerName: 'Agencia Marítima Sur',
      payerEmail: 'admin@maritimasur.ve',
    });

    const approved = await adapter.approvePayment(created.paymentId);
    expect(approved.status).toBe('verified');

    const status = await adapter.getWorkspacePlanStatus(10);
    expect(status.status).toBe('active');
    expect(status.planId).toBe('agencia');
    expect(status.quotaLimit).toBe(1000);
  });

  it('rejects a pending payment with an explicit rejection reason', async () => {
    const adapter = createBillingActivationAdapter({ cloudMode: false });
    const created = await adapter.submitPayment({
      planId: 'pilot',
      billingCycle: 'monthly',
      method: 'pago_movil',
      amount: 150,
      currency: 'VES',
      referenceCode: 'PM-001122',
      paidAt: '2026-11-25',
      payerName: 'Comercial Norte',
      payerEmail: 'norte@comercial.ve',
    });

    const rejected = await adapter.rejectPayment(
      created.paymentId,
      'Referencia bancaria no encontrada',
    );
    expect(rejected.status).toBe('rejected');
    expect(rejected.rejectionReason).toBe('Referencia bancaria no encontrada');

    const status = await adapter.getWorkspacePlanStatus(1);
    expect(status.status).toBe('rejected');
    expect(status.rejectionReason).toBe('Referencia bancaria no encontrada');
  });
});
