import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LeadsInboxPanel } from '../organisms/LeadsInboxPanel';

describe('LeadsInboxPanel', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('lists leads, updates status, and provides 1-click onboarding conversion link', async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            leads: [
              {
                id: 'lead-1',
                email: 'contacto@aduanas.ve',
                name: 'Carlos',
                company: 'Aduanas VE',
                phone: null,
                notes: null,
                country: 'VE',
                volume: '100+',
                source: 'landing',
                status: 'PENDING',
                approvedAt: null,
                createdAt: '2026-11-26T00:00:00Z',
              },
            ],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            lead: {
              id: 'lead-1',
              email: 'contacto@aduanas.ve',
              name: 'Carlos',
              company: 'Aduanas VE',
              phone: null,
              notes: null,
              country: 'VE',
              volume: '100+',
              source: 'landing',
              status: 'CONTACTED',
              approvedAt: null,
              createdAt: '2026-11-26T00:00:00Z',
            },
          }),
          { status: 200 },
        ),
      );
    vi.stubGlobal('fetch', fetchMock);

    render(<LeadsInboxPanel />);

    await waitFor(() => {
      expect(screen.getByText('Aduanas VE')).toBeInTheDocument();
    });

    const onboardLink = screen.getByRole('link', { name: /Convertir a Onboarding/i });
    expect(onboardLink.getAttribute('href')).toContain('/admin/onboarding?leadId=lead-1');

    await user.click(screen.getByRole('button', { name: /Marcar contactado/i }));
    await waitFor(() => {
      expect(screen.getByText('Contactado')).toBeInTheDocument();
    });
  });
});
