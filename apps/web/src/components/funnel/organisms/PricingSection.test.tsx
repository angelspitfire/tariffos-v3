import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SAAS_PLANS } from '@tariffos/shared-types';
import { PricingSection } from './PricingSection';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('PricingSection', () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockPush.mockReset();
  });

  it('renders the 3 B2B tiers: Piloto Operativo ($150 one-time), Agencia ($300/mes) and Enterprise (custom without price)', () => {
    render(<PricingSection plans={SAAS_PLANS} />);

    expect(screen.getAllByText(/Piloto Operativo/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('heading', { name: 'Agencia' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Enterprise' })).toBeInTheDocument();

    expect(screen.getByText(/\$150 USD/i)).toBeInTheDocument();
    expect(screen.getByText('$300')).toBeInTheDocument();
    expect(screen.getByText('A medida')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Contactar/i })).toBeInTheDocument();
  });

  it('routes Enterprise custom pricing CTA to #contacto without storing a paid plan', async () => {
    const user = userEvent.setup();
    render(<PricingSection plans={SAAS_PLANS} />);

    await user.click(screen.getByRole('button', { name: /Contactar/i }));

    expect(mockPush).toHaveBeenCalledWith('/#contacto');
  });

  it('renders Enterprise as annual-only with price and Corporate last without price + Contactar', async () => {
    const user = userEvent.setup();
    const ladderPlans = [
      {
        ...SAAS_PLANS[1],
        planId: 'basico',
        name: 'Básico',
        monthlyPriceUsd: 49,
        annualPriceUsd: 490,
        sortOrder: 2,
      },
      {
        ...SAAS_PLANS[1],
        planId: 'pro',
        name: 'Pro',
        monthlyPriceUsd: 299,
        annualPriceUsd: 2990,
        sortOrder: 3,
      },
      {
        ...SAAS_PLANS[2],
        planId: 'enterprise',
        name: 'Enterprise',
        monthlyPriceUsd: 0,
        annualPriceUsd: 4490,
        annualOnly: true,
        customPricing: false,
        sortOrder: 4,
      },
      {
        ...SAAS_PLANS[2],
        planId: 'corporate',
        name: 'Corporate',
        annualPriceUsd: 5900,
        customPricing: false,
        sortOrder: 0,
      },
    ];
    render(<PricingSection plans={ladderPlans} />);

    const headings = screen.getAllByRole('heading', { level: 3 }).map((el) => el.textContent);
    expect(headings).toEqual(['Básico', 'Pro', 'Enterprise', 'Corporate']);
    expect(screen.getByText('$4,490')).toBeInTheDocument();
    expect(screen.getByText(/Solo anual/i)).toBeInTheDocument();
    expect(screen.queryByText('$5,900')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Contactar/i }));
    expect(mockPush).toHaveBeenCalledWith('/#contacto');
  });

  it('toggles Agencia plan pricing to annual cycle ($3,000)', async () => {
    const user = userEvent.setup();
    render(<PricingSection plans={SAAS_PLANS} />);

    await user.click(screen.getByRole('button', { name: /Anual/i }));

    expect(screen.getByText('$3,000')).toBeInTheDocument();
  });

  it('displays 100% creditable pilot and <24h manual verification copy without free trial claims', () => {
    render(<PricingSection plans={SAAS_PLANS} />);
    expect(screen.getAllByText(/100% acreditable/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Activación verificada en menos de 24 horas hábiles/i)).toBeInTheDocument();
    expect(screen.queryByText(/Trial gratuito/i)).not.toBeInTheDocument();
  });
});
