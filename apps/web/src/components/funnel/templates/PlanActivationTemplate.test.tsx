import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SAAS_PLANS } from '@tariffos/shared-types';
import { createBillingActivationAdapter } from '@/lib/funnel/billing-port';
import { PlanActivationTemplate } from '../templates/PlanActivationTemplate';

describe('PlanActivationTemplate', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('submits a manual payment report, pre-fills payer details, collapses recommender, and displays soporte@tariffos.app', async () => {
    const user = userEvent.setup();
    const port = createBillingActivationAdapter({ cloudMode: false });

    render(
      <PlanActivationTemplate
        plans={SAAS_PLANS}
        initialPlanId="pilot"
        initialCycle="monthly"
        initialPayerName="Importadora Andes C.A."
        initialPayerEmail="pagos@andes.ve"
        billingPort={port}
      />,
    );

    expect(screen.queryByRole('button', { name: 'Enterprise' })).not.toBeInTheDocument();
    expect(screen.queryByText(/Elige cómo empezar/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Comparar planes/i })).toBeInTheDocument();
    expect(screen.getAllByText(/100% acreditable/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByLabelText(/Titular o empresa/i)).toHaveValue('Importadora Andes C.A.');
    expect(screen.getByLabelText(/Correo de la cuenta/i)).toHaveValue('pagos@andes.ve');

    await user.type(screen.getByLabelText(/Referencia bancaria/i), 'BIN-554433');

    await user.click(
      screen.getByRole('button', { name: /Reportar pago y solicitar activación/i }),
    );

    await waitFor(() => {
      expect(screen.getByText(/Solicitud de activación recibida/i)).toBeInTheDocument();
    });
    expect(screen.getAllByText('BIN-554433').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/soporte@tariffos\.app/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/modo lectura/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ir al workspace/i })).toHaveAttribute('href', '/app');
  });

  it('auto-calculates VES amount from BCV rate when selecting Pago Móvil', async () => {
    const user = userEvent.setup();
    const port = createBillingActivationAdapter({ cloudMode: false });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          rates: { 'USD/VES': { rate: 50, valueDate: '2026-11-26' } },
          stale: false,
        }),
      }),
    );

    render(
      <PlanActivationTemplate
        plans={SAAS_PLANS}
        initialPlanId="pilot"
        initialCycle="monthly"
        billingPort={port}
      />,
    );

    await user.selectOptions(screen.getByLabelText(/Medio de pago utilizado/i), 'pago_movil');

    await waitFor(() => {
      expect(screen.getByText(/Monto exacto:/i)).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/Monto pagado/i)).toHaveValue(7500);
  });

  it('automatically applies $150 pilot credit when upgrading to Agencia within 30 days', async () => {
    const user = userEvent.setup();
    const submittedPayloads: Array<{ amount: number; notes?: string }> = [];
    const mockPort = {
      async listPayments() {
        return [
          {
            paymentId: 'pay-pilot-verified',
            userId: 'u-1',
            tenantId: 'ten-1',
            userEmail: 'pagos@andes.ve',
            planId: 'pilot',
            planName: 'Piloto Operativo',
            billingCycle: 'monthly' as const,
            monthsCovered: 1,
            amount: 150,
            currency: 'USD' as const,
            method: 'zelle' as const,
            referenceCode: 'ZEL-111',
            paidAt: new Date(Date.now() - 5 * 86_400_000).toISOString(),
            verifiedAt: new Date(Date.now() - 5 * 86_400_000).toISOString(),
            status: 'verified' as const,
          },
        ];
      },
      async submitPayment(payload: { amount: number; notes?: string; planId: string; billingCycle: 'monthly' | 'annual' | 'custom'; method: 'zelle'; currency: 'USD'; referenceCode: string; paidAt: string; payerName: string; payerEmail: string }) {
        submittedPayloads.push(payload);
        return {
          paymentId: 'pay-agencia-new',
          userId: 'u-1',
          tenantId: 'ten-1',
          userEmail: payload.payerEmail,
          planId: payload.planId,
          planName: 'Agencia',
          billingCycle: payload.billingCycle,
          monthsCovered: 1,
          amount: payload.amount,
          currency: payload.currency,
          method: payload.method,
          referenceCode: payload.referenceCode,
          paidAt: payload.paidAt,
          notes: payload.notes,
          status: 'pending_verification' as const,
        };
      },
      async approvePayment() {
        throw new Error('unused');
      },
      async rejectPayment() {
        throw new Error('unused');
      },
    };

    render(
      <PlanActivationTemplate
        plans={SAAS_PLANS}
        initialPlanId="agencia"
        initialCycle="monthly"
        initialPayerName="Andes C.A."
        initialPayerEmail="pagos@andes.ve"
        billingPort={mockPort}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText(/Crédito Piloto/i)).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/Monto pagado/i)).toHaveValue(150);

    await user.type(screen.getByLabelText(/Referencia bancaria/i), 'ZEL-UPG-150');
    await user.click(screen.getByRole('button', { name: /Reportar pago y solicitar activación/i }));

    await waitFor(() => {
      expect(submittedPayloads).toHaveLength(1);
    });
    expect(submittedPayloads[0]?.amount).toBe(150);
    expect(submittedPayloads[0]?.notes).toMatch(/Crédito Piloto \$150 aplicado/i);
  });
});
