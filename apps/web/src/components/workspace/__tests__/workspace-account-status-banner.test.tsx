import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ClientCurrentUsageSnapshot } from '@tariffos/shared-types';
import { WorkspaceAccountStatusBanner } from '../molecules/WorkspaceAccountStatusBanner';

const BASE_USAGE: ClientCurrentUsageSnapshot = {
  tenantId: 'ten-1',
  tenantName: 'Aduanas Alpha',
  planId: 'pro',
  planName: 'Pro',
  billingStatus: 'ACTIVE',
  allowOverage: false,
  month: 11,
  year: 2026,
  used: 40,
  limit: 400,
  percentUsed: 10,
  inputTokens: 1200,
  outputTokens: 300,
};

describe('WorkspaceAccountStatusBanner', () => {
  it('renders nothing when account is ACTIVE and under 80% quota', () => {
    const { container } = render(<WorkspaceAccountStatusBanner usage={BASE_USAGE} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders deactivated banner with soporte@tariffos.app when billingStatus is CANCELED', () => {
    render(
      <WorkspaceAccountStatusBanner
        usage={{ ...BASE_USAGE, billingStatus: 'CANCELED' }}
      />,
    );
    expect(screen.getByText(/Cuenta dada de baja/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Contactar soporte/i })).toHaveAttribute(
      'href',
      'mailto:soporte@tariffos.app',
    );
  });

  it('renders verification-in-progress banner when PAST_DUE has pending_verification payment', () => {
    render(
      <WorkspaceAccountStatusBanner
        usage={{
          ...BASE_USAGE,
          planId: 'pilot',
          planName: 'Piloto Operativo',
          billingStatus: 'PAST_DUE',
          limit: 0,
          used: 0,
          latestPayment: {
            status: 'pending_verification',
            referenceCode: 'ZEL-9012',
            planName: 'Piloto Operativo',
          },
        }}
      />,
    );
    expect(screen.getByText(/Pago recibido en verificación/i)).toBeInTheDocument();
    expect(screen.getByText(/ZEL-9012/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ver estado/i })).toHaveAttribute(
      'href',
      '/activate-plan',
    );
  });

  it('renders rejected payment banner with reason and retry link', () => {
    render(
      <WorkspaceAccountStatusBanner
        usage={{
          ...BASE_USAGE,
          planId: 'pilot',
          planName: 'Piloto Operativo',
          billingStatus: 'PAST_DUE',
          limit: 0,
          used: 0,
          latestPayment: {
            status: 'rejected',
            referenceCode: 'ZEL-0001',
            planName: 'Piloto Operativo',
            rejectionReason: 'Comprobante ilegible',
          },
        }}
      />,
    );
    expect(screen.getByText(/Comprobante ilegible/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Corregir comprobante/i })).toHaveAttribute(
      'href',
      '/activate-plan',
    );
  });

  it('renders initial activation banner when billingStatus is PAST_DUE and limit is 0', () => {
    render(
      <WorkspaceAccountStatusBanner
        usage={{ ...BASE_USAGE, planId: 'pilot', planName: 'Piloto Operativo', billingStatus: 'PAST_DUE', limit: 0, used: 0 }}
      />,
    );
    expect(screen.getByText(/Piloto Operativo \(\$150/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Activar plan/i })).toHaveAttribute(
      'href',
      '/activate-plan?plan=pilot',
    );
  });

  it('renders past-due banner with activate-plan link when billingStatus is PAST_DUE and limit > 0', () => {
    render(
      <WorkspaceAccountStatusBanner
        usage={{ ...BASE_USAGE, billingStatus: 'PAST_DUE' }}
      />,
    );
    expect(screen.getByText(/Pago pendiente de regularización/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Activar plan/i })).toHaveAttribute(
      'href',
      '/activate-plan',
    );
  });

  it('renders quota warning when usage is >= 80% and overage is disabled', () => {
    render(
      <WorkspaceAccountStatusBanner
        usage={{ ...BASE_USAGE, used: 360, percentUsed: 90 }}
      />,
    );
    expect(screen.getByText(/90%/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ampliar plan/i })).toHaveAttribute(
      'href',
      '/activate-plan',
    );
  });
});
