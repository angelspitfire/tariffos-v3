import { beforeEach, describe, expect, it } from 'vitest';
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

  it('submits a manual payment report and shows it in the submitted payments list', async () => {
    const user = userEvent.setup();
    const port = createBillingActivationAdapter({ cloudMode: false });

    render(
      <PlanActivationTemplate
        plans={SAAS_PLANS}
        initialPlanId="pro"
        initialCycle="monthly"
        billingPort={port}
      />,
    );

    await user.type(screen.getByLabelText(/Referencia bancaria/i), 'BIN-554433');
    await user.type(screen.getByLabelText(/Titular o empresa/i), 'Importadora Andes C.A.');
    await user.type(screen.getByLabelText(/Correo de la cuenta/i), 'pagos@andes.ve');

    await user.click(
      screen.getByRole('button', { name: /Reportar pago y solicitar activación/i }),
    );

    await waitFor(() => {
      expect(screen.getByText(/Solicitud de activación recibida/i)).toBeInTheDocument();
    });
    expect(screen.getAllByText('BIN-554433').length).toBeGreaterThanOrEqual(1);
  });
});
