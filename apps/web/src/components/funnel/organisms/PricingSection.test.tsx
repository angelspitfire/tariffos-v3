import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SAAS_PLANS } from '@tariffos/shared-types';
import { PricingSection } from './PricingSection';
import { readSelectedPlan } from '@/lib/funnel/funnel-storage';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('PricingSection', () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockPush.mockReset();
  });

  it('renders all 5 SAAS_PLANS with Corporate locked to annual ($5,900/año)', () => {
    render(<PricingSection plans={SAAS_PLANS} />);

    expect(screen.getByText(/Trial \/ Piloto/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Básico' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Pro' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Enterprise' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Corporate' })).toBeInTheDocument();

    expect(screen.getByText('$49')).toBeInTheDocument();
    expect(screen.getByText('$299')).toBeInTheDocument();
    expect(screen.getByText('$449')).toBeInTheDocument();
    expect(screen.getByText('$5,900')).toBeInTheDocument();
    expect(screen.getByText(/Solo anual/i)).toBeInTheDocument();
  });

  it('stores selected plan and cycle and routes to /onboarding when selecting Corporate', async () => {
    const user = userEvent.setup();
    render(<PricingSection plans={SAAS_PLANS} />);

    await user.click(screen.getByRole('button', { name: /Solicitar Corporate/i }));

    expect(readSelectedPlan()).toEqual({ planId: 'corporate', billingCycle: 'annual' });
    expect(mockPush).toHaveBeenCalledWith('/onboarding?plan=corporate&cycle=annual');
  });

  it('toggles commercial plan pricing to annual cycle', async () => {
    const user = userEvent.setup();
    render(<PricingSection plans={SAAS_PLANS} />);

    await user.click(screen.getByRole('button', { name: /Anual/i }));

    expect(screen.getByText('$490')).toBeInTheDocument();
    expect(screen.getByText('$2,990')).toBeInTheDocument();
    expect(screen.getByText('$4,490')).toBeInTheDocument();
    expect(screen.getByText('$5,900')).toBeInTheDocument();
  });

  it('distinguishes immediate Trial activation from 24h commercial plan verification', () => {
    render(<PricingSection plans={SAAS_PLANS} />);
    expect(screen.getByText(/Trial gratuito con activación inmediata/i)).toBeInTheDocument();
    expect(screen.getByText(/Planes comerciales en menos de 24 horas hábiles/i)).toBeInTheDocument();
  });
});
