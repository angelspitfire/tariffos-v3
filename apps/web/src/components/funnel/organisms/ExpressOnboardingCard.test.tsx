import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExpressOnboardingCard } from './ExpressOnboardingCard';
import {
  readMockProfile,
  readOnboardingDraft,
  saveOnboardingDraft,
  saveSelectedPlan,
} from '@/lib/funnel/funnel-storage';

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

  it('completes classic 3-step onboarding wizard, persists draft step across steps, and routes to /activate-plan', async () => {
    const user = userEvent.setup();
    render(<ExpressOnboardingCard cloudMode={false} />);

    // Step 1: Organización y perfil
    expect(screen.getByText(/Paso 1 de 3/i)).toBeInTheDocument();
    await user.type(screen.getByLabelText(/Nombre completo/i), 'María González');
    await user.type(screen.getByLabelText(/Empresa o agencia/i), 'Aduanas Bolívar C.A.');
    await user.click(screen.getByRole('button', { name: /Siguiente/i }));

    // Step 2: Operación y aduana
    expect(screen.getByText(/Paso 2 de 3/i)).toBeInTheDocument();
    expect(readOnboardingDraft()?.currentStep).toBe(2);
    await user.selectOptions(screen.getByLabelText(/Jurisdicción por defecto/i), 've-seniat');
    await user.selectOptions(screen.getByLabelText(/Incoterm por defecto/i), 'CIF');
    await user.selectOptions(screen.getByLabelText(/Moneda principal/i), 'EUR');
    await user.selectOptions(screen.getByLabelText(/Modo de revisión/i), 'always_review');
    await user.click(screen.getByRole('button', { name: /Siguiente/i }));

    // Step 3: Plan y activación
    expect(screen.getByText(/Paso 3 de 3/i)).toBeInTheDocument();
    expect(screen.getByText(/Elige cómo empezar/i)).toBeInTheDocument();
    expect(readOnboardingDraft()?.currentStep).toBe(3);

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
    expect(readOnboardingDraft()).toBeNull();
    expect(mockPush).toHaveBeenCalledWith('/activate-plan?plan=pilot&cycle=monthly');
  });

  it('restores the client last saved wizard step and fields on reload', () => {
    saveOnboardingDraft({
      currentStep: 2,
      fullName: 'Sofía Márquez',
      role: 'Agente de Aduanas',
      companyName: 'Márquez Cargo C.A.',
      brokerLicense: 'SENIAT-4012',
      defaultJurisdictionId: 've-seniat',
      defaultIncoterm: 'CIF',
      preferredCurrency: 'EUR',
      approvalWorkflowMode: 'direct_seal',
      selectedPlanId: 'pilot',
      selectedBillingCycle: 'monthly',
      updatedAt: '2026-11-27T10:40:00.000Z',
    });

    render(<ExpressOnboardingCard cloudMode />);

    expect(screen.getByText(/Paso 2 de 3/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Incoterm por defecto/i)).toHaveValue('CIF');

    const select = screen.getByLabelText(/Jurisdicción por defecto/i) as HTMLSelectElement;
    const veOption = Array.from(select.options).find((o) => o.value === 've-seniat');
    const coOption = Array.from(select.options).find((o) => o.value === 'co-dian');
    expect(veOption?.disabled).toBe(false);
    expect(coOption?.disabled).toBe(true);
    expect(coOption?.textContent).toMatch(/Próximamente|Enterprise/i);
  });

  it('skips plan picker summary when plan is preselected and posts to /api/onboarding in cloud mode', async () => {
    const user = userEvent.setup();
    saveSelectedPlan('pilot', 'monthly');
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, mode: 'cloud' }),
    });
    vi.stubGlobal('fetch', fetchMock);
    mockSearchParams = new URLSearchParams('plan=pilot&cycle=monthly');

    render(<ExpressOnboardingCard cloudMode initialFullName="Elena Torres" />);

    expect(screen.getByLabelText(/Nombre completo/i)).toHaveValue('Elena Torres');
    await user.selectOptions(screen.getByLabelText(/Rol operativo/i), 'Auditor de Cumplimiento');
    await user.type(screen.getByLabelText(/Patente aduanal/i), 'SENIAT-AA-9001');
    await user.type(screen.getByLabelText(/Empresa o agencia/i), 'Torres Aduanas');
    await user.click(screen.getByRole('button', { name: /Siguiente/i }));
    await user.click(screen.getByRole('button', { name: /Siguiente/i }));

    expect(screen.getByText(/Plan preseleccionado/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Continuar a activación/i }));

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/onboarding',
      expect.objectContaining({ method: 'POST' }),
    );
    const postedBody = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body ?? '{}'));
    expect(postedBody).toMatchObject({
      fullName: 'Elena Torres',
      role: 'Auditor de Cumplimiento',
      brokerLicense: 'SENIAT-AA-9001',
    });
    expect(mockPush).toHaveBeenCalledWith('/activate-plan?plan=pilot&cycle=monthly');
    vi.unstubAllGlobals();
  });

  it('skips /activate-plan and routes directly to /app when cloud onboarding returns skipPaymentActivation: true', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        mode: 'cloud',
        skipPaymentActivation: true,
        tenant: { billingStatus: 'ACTIVE' },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);
    mockSearchParams = new URLSearchParams('plan=pilot&cycle=monthly');

    render(<ExpressOnboardingCard cloudMode />);

    await user.type(screen.getByLabelText(/Nombre completo/i), 'Angel Fernandez');
    await user.type(screen.getByLabelText(/Empresa o agencia/i), 'TariffOS');
    await user.click(screen.getByRole('button', { name: /Siguiente/i }));
    await user.click(screen.getByRole('button', { name: /Siguiente/i }));
    await user.click(screen.getByRole('button', { name: /Continuar a activación/i }));

    expect(mockPush).toHaveBeenCalledWith('/app');
    vi.unstubAllGlobals();
  });

  it('renders PlanRecommender inside step 3 when choosing a plan and applies recommendation', async () => {
    const user = userEvent.setup();
    render(<ExpressOnboardingCard cloudMode={false} />);

    await user.type(screen.getByLabelText(/Nombre completo/i), 'Carlos Rivas');
    await user.type(screen.getByLabelText(/Empresa o agencia/i), 'Caribe Cargo');
    await user.click(screen.getByRole('button', { name: /Siguiente/i }));
    await user.click(screen.getByRole('button', { name: /Siguiente/i }));

    await user.click(screen.getByRole('button', { name: /Recomendar plan/i }));
    await user.click(screen.getByRole('button', { name: /250–1,000/i }));
    await user.click(screen.getByRole('button', { name: /Aplicar plan/i }));

    expect(screen.getAllByText(/Recomendado/i).length).toBeGreaterThanOrEqual(2);
  });
});
