import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readStoredBillingState } from './billing-local-store';
import { createBillingActivationAdapter } from './billing-port';

describe('billing-port', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('seeds demo payments and submits/approves/rejects in offline mode', async () => {
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
    expect(readStoredBillingState().status).toBe('pending_verification');

    const approved = await adapter.approvePayment(created.paymentId);
    expect(approved.status).toBe('verified');
    expect(readStoredBillingState().status).toBe('active');

    const rejected = await adapter.rejectPayment(created.paymentId, 'Referencia bancaria no encontrada');
    expect(rejected.status).toBe('rejected');
    expect(readStoredBillingState().status).toBe('rejected');
  });

  it('throws server errors in cloudMode without writing fake local pending state', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: 'Referencia duplicada en este ciclo.' }), { status: 400 }),
      ),
    );
    const adapter = createBillingActivationAdapter({ cloudMode: true });

    await expect(
      adapter.submitPayment({
        planId: 'pilot',
        billingCycle: 'monthly',
        method: 'zelle',
        amount: 150,
        currency: 'USD',
        referenceCode: 'ZEL-DUP',
        paidAt: '2026-11-25',
        payerName: 'Empresa Test',
        payerEmail: 'test@empresa.ve',
      }),
    ).rejects.toThrow(/Referencia duplicada/);

    expect(window.localStorage.length).toBe(0);
  });

  it('throws HTTP errors on listPayments and admin mutations in cloudMode', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() =>
        Promise.resolve(
          new Response(JSON.stringify({ error: 'Server error' }), { status: 500 }),
        ),
      ),
    );
    const adapter = createBillingActivationAdapter({ cloudMode: true, adminMode: true });

    await expect(adapter.listPayments()).rejects.toThrow(/Server error/);
    await expect(adapter.approvePayment('pay-1')).rejects.toThrow(/Server error/);
    await expect(adapter.rejectPayment('pay-1', 'Inválido')).rejects.toThrow(/Server error/);
  });
});
