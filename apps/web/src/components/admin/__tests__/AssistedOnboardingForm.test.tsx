import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('next/navigation', () => ({
  useSearchParams: () =>
    new URLSearchParams('leadId=lead-1&email=carlos@caribe.ve&company=Aduanas+Caribe&name=Carlos&country=VE'),
}));

import { AssistedOnboardingForm } from '../organisms/AssistedOnboardingForm';

describe('AssistedOnboardingForm', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('pre-populates from lead query params and provisions tenant on submit', async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            plans: [
              {
                id: 'pro',
                name: 'pro',
                displayName: 'Pro',
                description: null,
                basePrice: 299,
                annualPriceUsd: 2990,
                annualOnly: false,
                classificationLimit: 400,
                maxTokens: 1000000,
                maxUsers: 3,
                overagePrice: 0,
                allowOverage: false,
                isPublic: true,
                isArchived: false,
                features: [],
                tenantCount: 0,
              },
            ],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            tenant: { id: 'ten-99', name: 'Aduanas Caribe' },
            invited: true,
          }),
          { status: 201 },
        ),
      );
    vi.stubGlobal('fetch', fetchMock);

    render(<AssistedOnboardingForm />);

    expect(screen.getByDisplayValue('Aduanas Caribe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('carlos@caribe.ve')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Crear tenant y enviar acceso/i }));

    await waitFor(() => {
      expect(screen.getByText(/Tenant aprovisionado con éxito/i)).toBeInTheDocument();
    });
  });

  it('syncs default planId with loaded plans from /api/admin/plans instead of sending stale default', async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            plans: [
              {
                id: 'plan-uuid-pilot',
                name: 'pilot',
                displayName: 'Piloto Operativo',
                description: null,
                basePrice: 150,
                annualPriceUsd: 0,
                annualOnly: false,
                classificationLimit: 250,
                maxTokens: 1000000,
                maxUsers: 2,
                overagePrice: 0,
                allowOverage: false,
                isPublic: true,
                isArchived: false,
                features: [],
                tenantCount: 0,
              },
              {
                id: 'plan-uuid-agencia',
                name: 'agencia',
                displayName: 'Agencia',
                description: null,
                basePrice: 300,
                annualPriceUsd: 3000,
                annualOnly: false,
                classificationLimit: 1000,
                maxTokens: 2000000,
                maxUsers: 5,
                overagePrice: 0,
                allowOverage: false,
                isPublic: true,
                isArchived: false,
                features: [],
                tenantCount: 0,
              },
            ],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            tenant: { id: 'ten-100', name: 'Aduanas Caribe' },
            invited: true,
          }),
          { status: 201 },
        ),
      );
    vi.stubGlobal('fetch', fetchMock);

    render(<AssistedOnboardingForm />);

    await waitFor(() => {
      expect(screen.getByRole('option', { name: /Piloto Operativo/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /Crear tenant y enviar acceso/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
    const postBody = JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body ?? '{}'));
    expect(postBody.planId).toBe('plan-uuid-pilot');
  });
});
