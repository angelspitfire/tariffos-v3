import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlansManagerPanel } from '../organisms/PlansManagerPanel';

describe('PlansManagerPanel', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders plans and creates a new custom plan via modal', async () => {
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
                description: 'Para agencias',
                basePrice: 299,
                annualPriceUsd: 2990,
                annualOnly: false,
                classificationLimit: 400,
                maxTokens: 4000000,
                maxUsers: 3,
                overagePrice: 0,
                allowOverage: false,
                isPublic: true,
                isArchived: false,
                features: [],
                tenantCount: 2,
              },
            ],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            plan: {
              id: 'vip',
              name: 'vip',
              displayName: 'VIP Aduanas',
              description: null,
              basePrice: 600,
              annualPriceUsd: 6000,
              annualOnly: false,
              classificationLimit: 2000,
              maxTokens: 1000000,
              maxUsers: 10,
              overagePrice: 0,
              allowOverage: false,
              isPublic: false,
              isArchived: false,
              features: [],
              tenantCount: 0,
            },
          }),
          { status: 201 },
        ),
      )
      .mockResolvedValueOnce(new Response(JSON.stringify({ plans: [] }), { status: 200 }));

    vi.stubGlobal('fetch', fetchMock);

    render(<PlansManagerPanel />);

    await waitFor(() => {
      expect(screen.getByText('Pro')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /Crear plan/i }));
    await user.type(screen.getByPlaceholderText(/broker-vip/i), 'vip');
    await user.type(screen.getByPlaceholderText(/Broker VIP/i), 'VIP Aduanas');
    await user.click(screen.getAllByRole('button', { name: /^Crear plan$/i })[1]);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/admin/plans',
        expect.objectContaining({ method: 'POST' }),
      );
    });
  });
});
