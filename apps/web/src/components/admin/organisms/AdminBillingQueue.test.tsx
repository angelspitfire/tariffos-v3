import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createBillingActivationAdapter } from '@/lib/funnel/billing-port';
import { AdminBillingQueue } from './AdminBillingQueue';

describe('AdminBillingQueue', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('filters tabs and approves a pending payment in 1 click', async () => {
    const user = userEvent.setup();
    const adapter = createBillingActivationAdapter({ cloudMode: false });

    render(<AdminBillingQueue billingPort={adapter} />);

    await waitFor(() => {
      expect(screen.getByText('ZEL-894201')).toBeInTheDocument();
    });

    const approveButtons = screen.getAllByRole('button', { name: /Aprobar y activar plan/i });
    await user.click(approveButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText('ZEL-894201')).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('tab', { name: /Verificados/i }));
    expect(screen.getByText('ZEL-894201')).toBeInTheDocument();
  });

  it('rejects a pending payment with an inline rejection reason', async () => {
    const user = userEvent.setup();
    const adapter = createBillingActivationAdapter({ cloudMode: false });

    render(<AdminBillingQueue billingPort={adapter} />);

    await waitFor(() => {
      expect(screen.getByText('ZEL-894201')).toBeInTheDocument();
    });

    const rejectButtons = screen.getAllByRole('button', { name: /^Rechazar$/i });
    await user.click(rejectButtons[0]);

    const reasonInput = screen.getByLabelText(/Motivo del rechazo/i);
    await user.type(reasonInput, 'Monto incompleto en estado de cuenta');
    await user.click(screen.getByRole('button', { name: /Confirmar rechazo/i }));

    await waitFor(() => {
      expect(screen.queryByText('ZEL-894201')).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('tab', { name: /Rechazados/i }));
    expect(screen.getByText('ZEL-894201')).toBeInTheDocument();
    expect(screen.getByText(/Monto incompleto en estado de cuenta/i)).toBeInTheDocument();
  });
});
