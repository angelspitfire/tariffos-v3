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

  it('renders deactivated banner when billingStatus is CANCELED', () => {
    render(
      <WorkspaceAccountStatusBanner
        usage={{ ...BASE_USAGE, billingStatus: 'CANCELED' }}
      />,
    );
    expect(screen.getByText(/Cuenta dada de baja/i)).toBeInTheDocument();
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
