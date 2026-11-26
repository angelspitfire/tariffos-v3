import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExpressOnboardingCard } from './ExpressOnboardingCard';
import { readMockProfile, saveSelectedPlan } from '@/lib/funnel/funnel-storage';

const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
}));

describe('ExpressOnboardingCard', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    mockPush.mockReset();
    mockSearchParams = new URLSearchParams();
  });

  it('completes 1-step express onboarding defaulting to pilot and routes to /activate-plan', async () => {
    const user = userEvent.setup();
    render(<ExpressOnboardingCard cloudMode={false} />);

    // Plan picker is shown when no plan was preselected
    expect(screen.getByText(/Elige cómo empezar/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/Nombre completo/i), 'María González');
    await user.type(screen.getByLabelText(/Empresa o agencia/i), 'Aduanas Bolívar C.A.');
    await user.selectOptions(screen.getByLabelText(/Jurisdicción por defecto/i), 've-seniat');

    // Open collapsible Preferencias avanzadas
    await user.click(screen.getByRole('button', { name: /Preferencias avanzadas/i }));
    await user.selectOptions(screen.getByLabelText(/Incoterm por defecto/i), 'CIF');
    await user.selectOptions(screen.getByLabelText(/Moneda principal/i), 'EUR');
    await user.selectOptions(screen.getByLabelText(/Modo de revisión/i), 'always_review');

    await user.click(screen.getByRole('button', { name: /Continuar a activación/i }));

    const profile = readMockProfile();
    expect(profile).toMatchObject({
      fullName: 'María González',
      companyName: 'Aduanas Bolívar C.A.',
      defaultJurisdictionId: 've-seniat',
      defaultIncoterm: 'CIF',
      preferredCurrency: 'EUR',
      approvalWorkflowMode: 'always_review',
      selectedPlanId: 'pilot',
      onboardingCompleted: true,
    });
    expect(mockPush).toHaveBeenCalledWith('/activate-plan?plan=pilot&cycle=monthly');
  });

  it('skips plan picker when plan is preselected and routes paid plan to /activate-plan', async () => {
    const user = userEvent.setup();
    saveSelectedPlan('agencia', 'annual');
    mockSearchParams = new URLSearchParams('plan=agencia&cycle=annual');

    render(<ExpressOnboardingCard cloudMode={false} />);

    expect(screen.queryByText(/Elige cómo empezar/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Plan preseleccionado/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/Nombre completo/i), 'Luis Medina');
    await user.type(screen.getByLabelText(/Empresa o agencia/i), 'Logística Caribe S.A.');
    await user.click(screen.getByRole('button', { name: /Continuar a activación/i }));

    expect(mockPush).toHaveBeenCalledWith('/activate-plan?plan=agencia&cycle=annual');
  });

  it('posts to /api/onboarding in cloud mode before routing to /activate-plan', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, mode: 'cloud' }),
    });
    vi.stubGlobal('fetch', fetchMock);
    mockSearchParams = new URLSearchParams('plan=pilot&cycle=monthly');

    render(<ExpressOnboardingCard cloudMode />);

    await user.type(screen.getByLabelText(/Nombre completo/i), 'Elena Torres');
    await user.type(screen.getByLabelText(/Empresa o agencia/i), 'Torres Aduanas');
    await user.click(screen.getByRole('button', { name: /Continuar a activación/i }));

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/onboarding',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(mockPush).toHaveBeenCalledWith('/activate-plan?plan=pilot&cycle=monthly');
    vi.unstubAllGlobals();
  });

  it('renders PlanRecommender inside onboarding when choosing a plan and applies recommendation', async () => {
    const user = userEvent.setup();
    render(<ExpressOnboardingCard cloudMode={false} />);

    await user.click(screen.getByRole('button', { name: /Recomendar plan/i }));
    await user.click(screen.getByRole('button', { name: /250–1,000/i }));
    await user.click(screen.getByRole('button', { name: /Aplicar plan/i }));

    expect(screen.getAllByText(/Recomendado/i).length).toBeGreaterThanOrEqual(2);
  });
});
