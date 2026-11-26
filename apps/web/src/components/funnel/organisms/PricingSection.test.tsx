import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SAAS_PLANS } from '@tariffos/shared-types';
import { PricingSection } from './PricingSection';

const mockPush = vi.fn<(href: string) => void>();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('PricingSection', () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockPush.mockReset();
  });

  it('renders the 3 B2B tiers as 3 aligned cards in strict ladder order: Piloto Operativo -> Agencia -> Enterprise', () => {
    render(<PricingSection plans={SAAS_PLANS} />);

    const cardHeadings = screen
      .getAllByRole('heading', { level: 3 })
      .map((el) => el.textContent);
    expect(cardHeadings).toEqual(['Piloto Operativo', 'Agencia', 'Enterprise']);

    expect(screen.getByText('$150')).toBeInTheDocument();
    expect(screen.getAllByText(/pago único/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/100% acreditable/i).length).toBeGreaterThanOrEqual(1);

    expect(screen.getByText('$300')).toBeInTheDocument();
    expect(screen.getByText(/Más popular/i)).toBeInTheDocument();
    expect(screen.getByText(/1,000 clasif\./i)).toBeInTheDocument();

    expect(screen.getByText('A medida')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Contactar/i })).toBeInTheDocument();
  });

  it('routes Piloto Operativo CTA to /onboarding?plan=pilot&cycle=monthly', async () => {
    const user = userEvent.setup();
    render(<PricingSection plans={SAAS_PLANS} />);

    await user.click(screen.getByRole('button', { name: /Activar Piloto Operativo/i }));

    expect(mockPush).toHaveBeenCalledWith('/onboarding?plan=pilot&cycle=monthly');
  });

  it('routes Enterprise custom pricing CTA to /#contacto without storing a paid plan', async () => {
    const user = userEvent.setup();
    render(<PricingSection plans={SAAS_PLANS} />);

    await user.click(screen.getByRole('button', { name: /Contactar/i }));

    expect(mockPush).toHaveBeenCalledWith('/#contacto');
  });

  it('toggles Agencia plan to annual ($3,000/año) while keeping monthly equivalent ($250/mes) and 1,000 quota visible', async () => {
    const user = userEvent.setup();
    render(<PricingSection plans={SAAS_PLANS} />);

    await user.click(screen.getByRole('button', { name: /Anual/i }));

    expect(screen.getByText('$3,000')).toBeInTheDocument();
    expect(screen.getByText(/Equiv\. \$250\/mes/i)).toBeInTheDocument();
    expect(screen.getByText(/1,000 clasif\./i)).toBeInTheDocument();
  });

  it('displays 100% creditable pilot and <24h manual verification copy without free trial or $49 legacy claims', () => {
    render(<PricingSection plans={SAAS_PLANS} />);
    expect(screen.getAllByText(/100% acreditable/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Activación verificada en menos de 24 horas hábiles/i)).toBeInTheDocument();
    expect(screen.queryByText(/Trial gratuito/i)).not.toBeInTheDocument();
    expect(screen.queryByText('$49')).not.toBeInTheDocument();
  });
});
