import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExpressOnboardingCard } from './ExpressOnboardingCard';
import {
  readMockProfile,
  readOnboardingDraft,
  saveOnboardingDraft,
  savePendingQuery,
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

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('completes 2-step express onboarding wizard with optional advanced preferences and routes to /activate-plan', async () => {
    const user = userEvent.setup();
    render(<ExpressOnboardingCard cloudMode={false} />);

    // Step 1: Perfil y operación
    expect(screen.getByText(/Paso 1 de 2/i)).toBeInTheDocument();
    await user.type(screen.getByLabelText(/Nombre completo/i), 'María González');
    await user.type(screen.getByLabelText(/RIF \/ Tax ID/i), 'J-30192837-4');
    await user.type(screen.getByLabelText(/Empresa o agencia/i), 'Aduanas Bolívar C.A.');

    await user.click(screen.getByRole('button', { name: /Preferencias operativas/i }));
    await user.selectOptions(screen.getByLabelText(/Jurisdicción por defecto/i), 've-seniat');
    await user.selectOptions(screen.getByLabelText(/Aduana principal/i), '5003 - PUERTO CABELLO');
    await user.selectOptions(screen.getByLabelText(/Incoterm por defecto/i), 'CIF');
    await user.selectOptions(screen.getByLabelText(/Moneda principal/i), 'EUR');
    await user.selectOptions(screen.getByLabelText(/Modo de revisión/i), 'always_review');

    await user.click(screen.getByRole('button', { name: /Siguiente/i }));

    // Step 2: Plan y activación
    expect(screen.getByText(/Paso 2 de 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Elige cómo empezar/i)).toBeInTheDocument();
    expect(readOnboardingDraft()?.currentStep).toBe(2);

    await user.click(screen.getByRole('button', { name: /Continuar a activación/i }));

    const profile = readMockProfile();
    expect(profile).toMatchObject({
      fullName: 'María González',
      companyName: 'Aduanas Bolívar C.A.',
      taxId: 'J-30192837-4',
      defaultJurisdictionId: 've-seniat',
      defaultCustomsOffice: '5003 - PUERTO CABELLO',
      defaultIncoterm: 'CIF',
      preferredCurrency: 'EUR',
      approvalWorkflowMode: 'always_review',
      selectedPlanId: 'pilot',
      onboardingCompleted: true,
    });
    expect(readOnboardingDraft()).toBeNull();
    expect(mockPush).toHaveBeenCalledWith('/activate-plan?plan=pilot&cycle=monthly');
  });

  it('restores saved draft scoped by userId and isolates drafts across different accounts', async () => {
    const user = userEvent.setup();
    saveOnboardingDraft({
      userId: 'usr-a',
      currentStep: 2,
      fullName: 'Sofía Márquez',
      role: 'Agente de Aduanas',
      companyName: 'Márquez Cargo C.A.',
      brokerLicense: 'SENIAT-4012',
      defaultJurisdictionId: 've-seniat',
      defaultCustomsOffice: '5002 - MAIQUETÍA (AÉREA)',
      defaultIncoterm: 'CIF',
      preferredCurrency: 'EUR',
      approvalWorkflowMode: 'direct_seal',
      selectedPlanId: 'pilot',
      selectedBillingCycle: 'monthly',
      updatedAt: new Date().toISOString(),
    });

    const { unmount } = render(<ExpressOnboardingCard cloudMode userId="usr-a" />);

    await waitFor(() => {
      expect(screen.getByText(/Paso 2 de 2/i)).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /Anterior/i }));
    await user.click(screen.getByRole('button', { name: /Preferencias operativas/i }));
    expect(screen.getByLabelText(/Incoterm por defecto/i)).toHaveValue('CIF');

    const select = screen.getByLabelText(/Jurisdicción por defecto/i) as HTMLSelectElement;
    const veOption = Array.from(select.options).find((o) => o.value === 've-seniat');
    const coOption = Array.from(select.options).find((o) => o.value === 'co-dian');
    expect(veOption?.disabled).toBe(false);
    expect(coOption?.disabled).toBe(true);
    expect(coOption?.textContent).toMatch(/Próximamente|Enterprise/i);

    unmount();

    // Different user must NOT inherit usr-a draft
    render(<ExpressOnboardingCard cloudMode userId="usr-b" initialFullName="Usuario B" />);
    expect(screen.getByText(/Paso 1 de 2/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre completo/i)).toHaveValue('Usuario B');
    expect(screen.getByLabelText(/Empresa o agencia/i)).toHaveValue('');
  });

  it('skips plan picker summary when plan is preselected and posts taxId and customs office in cloud mode', async () => {
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
    await user.type(screen.getByLabelText(/RIF \/ Tax ID/i), 'J-29881122-0');
    await user.type(screen.getByLabelText(/Empresa o agencia/i), 'Torres Aduanas');
    await user.click(screen.getByRole('button', { name: /Preferencias operativas/i }));
    await user.selectOptions(screen.getByLabelText(/Aduana principal/i), '5004 - MARACAIBO');
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
      taxId: 'J-29881122-0',
      defaultCustomsOffice: '5004 - MARACAIBO',
    });
    expect(mockPush).toHaveBeenCalledWith('/activate-plan?plan=pilot&cycle=monthly');
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
    await user.click(screen.getByRole('button', { name: /Continuar a activación/i }));

    expect(mockPush).toHaveBeenCalledWith('/app');
  });

  it('renders PlanRecommender inside step 2 when choosing a plan and applies recommendation', async () => {
    const user = userEvent.setup();
    render(<ExpressOnboardingCard cloudMode={false} />);

    await user.type(screen.getByLabelText(/Nombre completo/i), 'Carlos Rivas');
    await user.type(screen.getByLabelText(/Empresa o agencia/i), 'Caribe Cargo');
    await user.click(screen.getByRole('button', { name: /Siguiente/i }));

    await user.click(screen.getByRole('button', { name: /Recomendar plan/i }));
    await user.click(screen.getByRole('button', { name: /250–1,000/i }));
    await user.click(screen.getByRole('button', { name: /Aplicar plan/i }));

    expect(screen.getAllByText(/Recomendado/i).length).toBeGreaterThanOrEqual(2);
  });

  it('shows inline field-level errors and focuses invalid input when name or company is missing', async () => {
    const user = userEvent.setup();
    render(<ExpressOnboardingCard cloudMode={false} />);

    await user.click(screen.getByRole('button', { name: /Siguiente/i }));
    expect(screen.getByText(/Ingresa tu nombre completo\./i)).toBeInTheDocument();
    expect(screen.getByText(/Ingresa el nombre de tu empresa o agencia\./i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre completo/i)).toHaveFocus();

    await user.type(screen.getByLabelText(/Nombre completo/i), 'María González');
    await user.click(screen.getByRole('button', { name: /Siguiente/i }));
    expect(screen.queryByText(/Ingresa tu nombre completo\./i)).not.toBeInTheDocument();
    expect(screen.getByText(/Ingresa el nombre de tu empresa o agencia\./i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Empresa o agencia/i)).toHaveFocus();
  });

  it('displays saved pendingQuery banner and shows re-auth link on HTTP 401', async () => {
    const user = userEvent.setup();
    savePendingQuery('Inversor solar híbrido 5 kW');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: 'Authentication required' }), { status: 401 }),
      ),
    );
    mockSearchParams = new URLSearchParams('plan=pilot&cycle=monthly');

    render(<ExpressOnboardingCard cloudMode />);

    await waitFor(() => {
      expect(screen.getByText(/Inversor solar híbrido 5 kW/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/Nombre completo/i), 'María González');
    await user.type(screen.getByLabelText(/Empresa o agencia/i), 'Bolívar C.A.');
    await user.click(screen.getByRole('button', { name: /Siguiente/i }));
    await user.click(screen.getByRole('button', { name: /Continuar a activación/i }));

    expect(screen.getByText(/Tu sesión expiró/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Iniciar sesión/i })).toHaveAttribute(
      'href',
      '/login?next=/onboarding',
    );
  });
});
