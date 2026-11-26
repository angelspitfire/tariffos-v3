import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LandingHero } from './LandingHero';
import { readPendingQuery } from '@/lib/funnel/funnel-storage';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('LandingHero', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    mockPush.mockReset();
  });

  it('fills sample chip into input, saves pendingQuery, and navigates to /app in offline mode', async () => {
    const user = userEvent.setup();
    render(<LandingHero requiresAuth={false} />);

    await user.click(screen.getByRole('button', { name: /Inversor solar híbrido 5 kW/i }));
    const input = screen.getByLabelText(/Describe una mercancía/i);
    expect(input).toHaveValue('Inversor solar híbrido 5 kW');

    await user.click(screen.getByRole('button', { name: /Clasificar gratis/i }));

    expect(readPendingQuery()).toBe('Inversor solar híbrido 5 kW');
    expect(mockPush).toHaveBeenCalledWith('/app');
  });

  it('redirects to /login?next=/app when cloud auth is required', async () => {
    const user = userEvent.setup();
    render(<LandingHero requiresAuth />);

    const input = screen.getByLabelText(/Describe una mercancía/i);
    await user.type(input, 'Ecógrafo Doppler portátil');
    await user.click(screen.getByRole('button', { name: /Clasificar gratis/i }));

    expect(readPendingQuery()).toBe('Ecógrafo Doppler portátil');
    expect(mockPush).toHaveBeenCalledWith('/login?next=%2Fapp');
  });

  it('renders live A2UI 10-digit VE NCM preview verdict', () => {
    render(<LandingHero requiresAuth={false} />);
    expect(screen.getByText('8413.70.10.00')).toBeInTheDocument();
    expect(screen.getByText(/Decreto 4\.944/i)).toBeInTheDocument();
  });
});
