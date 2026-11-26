import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LandingHero } from './LandingHero';
import { readPendingQuery } from '@/lib/funnel/funnel-storage';

const mockPush = vi.fn<(href: string) => void>();

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

    await user.click(screen.getByRole('button', { name: /Laptop Dell Latitude i7/i }));
    const input = screen.getByLabelText(/Describe una mercancía/i);
    expect(input).toHaveValue('Laptop Dell Latitude i7 16GB RAM SSD 512GB');

    await user.click(screen.getByRole('button', { name: /Clasificar en workspace|Activar Piloto/i }));

    expect(readPendingQuery()).toBe('Laptop Dell Latitude i7 16GB RAM SSD 512GB');
    expect(mockPush).toHaveBeenCalledWith('/app');
  });

  it('redirects to /login?next=/app when cloud auth is required', async () => {
    const user = userEvent.setup();
    render(<LandingHero requiresAuth />);

    const input = screen.getByLabelText(/Describe una mercancía/i);
    await user.type(input, 'Ecógrafo Doppler portátil');
    await user.click(screen.getByRole('button', { name: 'Activar Piloto' }));

    expect(readPendingQuery()).toBe('Ecógrafo Doppler portátil');
    expect(mockPush).toHaveBeenCalledWith('/login?next=%2Fapp');
  });

  it('renders live A2UI 10-digit VE NCM preview verdict', () => {
    render(<LandingHero requiresAuth={false} />);
    expect(screen.getByText('8413.70.10.00')).toBeInTheDocument();
    expect(screen.getByText(/Decreto 4\.944/i)).toBeInTheDocument();
  });

  it('displays B2B pilot/agencia microcopy and sample PDF download link without free trial claims', () => {
    render(<LandingHero requiresAuth={false} />);
    expect(
      screen.getByRole('heading', { level: 1, name: /Clasificación arancelaria auditable con respaldo RGI/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Piloto Operativo \$150/i)).toBeInTheDocument();
    expect(screen.getByText(/Plan Agencia desde \$300\/mes/i)).toBeInTheDocument();
    expect(screen.getByText(/Enterprise a medida/i)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Descargar Dictamen PDF de ejemplo/i }),
    ).toHaveAttribute('href', '/samples/dictamen-ejemplo-tariffos.pdf');
  });
});
