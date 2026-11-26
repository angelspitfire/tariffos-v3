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

  it('completes 1-step express onboarding for trial with advanced preferences accordion and routes to /app', async () => {
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

    await user.click(screen.getByRole('button', { name: /Entrar al workspace/i }));

    const profile = readMockProfile();
    expect(profile).toMatchObject({
      fullName: 'María González',
      companyName: 'Aduanas Bolívar C.A.',
      defaultJurisdictionId: 've-seniat',
      defaultIncoterm: 'CIF',
      preferredCurrency: 'EUR',
      approvalWorkflowMode: 'always_review',
      selectedPlanId: 'trial',
      onboardingCompleted: true,
    });
    expect(mockPush).toHaveBeenCalledWith('/app');
  });

  it('skips plan picker when plan is preselected and routes paid plan to /activate-plan', async () => {
    const user = userEvent.setup();
    saveSelectedPlan('pro', 'annual');
    mockSearchParams = new URLSearchParams('plan=pro&cycle=annual');

    render(<ExpressOnboardingCard cloudMode={false} />);

    expect(screen.queryByText(/Elige cómo empezar/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Plan preseleccionado/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/Nombre completo/i), 'Luis Medina');
    await user.type(screen.getByLabelText(/Empresa o agencia/i), 'Logística Caribe S.A.');
    await user.click(screen.getByRole('button', { name: /Continuar a activación/i }));

    expect(mockPush).toHaveBeenCalledWith('/activate-plan?plan=pro&cycle=annual');
  });

  it('posts to /api/onboarding in cloud mode before routing', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, mode: 'cloud' }),
    });
    vi.stubGlobal('fetch', fetchMock);
    mockSearchParams = new URLSearchParams('plan=trial&cycle=monthly');

    render(<ExpressOnboardingCard cloudMode />);

    await user.type(screen.getByLabelText(/Nombre completo/i), 'Elena Torres');
    await user.type(screen.getByLabelText(/Empresa o agencia/i), 'Torres Aduanas');
    await user.click(screen.getByRole('button', { name: /Entrar al workspace/i }));

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/onboarding',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(mockPush).toHaveBeenCalledWith('/app');
    vi.unstubAllGlobals();
  });
});
