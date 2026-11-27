import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { persistOnboardingProfile } from './onboarding-actions';

describe('onboarding-actions', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends taxId and defaultCustomsOffice in cloud POST /api/onboarding', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true, tenant: { billingStatus: 'PAST_DUE' } }), { status: 200 }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const res = await persistOnboardingProfile(
      {
        fullName: 'María González',
        companyName: 'Aduanas Bolívar C.A.',
        role: 'Agente de Aduanas',
        brokerLicense: 'SENIAT-1042',
        taxId: 'J-30192837-4',
        defaultJurisdictionId: 've-seniat',
        defaultCustomsOffice: '5003 - PUERTO CABELLO',
        defaultIncoterm: 'FOB',
        preferredCurrency: 'USD',
        approvalWorkflowMode: 'agent_decides',
        selectedPlanId: 'agencia',
        selectedBillingCycle: 'annual',
        onboardingCompleted: true,
      },
      true,
    );

    expect(res).toEqual({ ok: true, error: null, skipPaymentActivation: false });
    const postedBody = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body ?? '{}'));
    expect(postedBody).toMatchObject({
      taxId: 'J-30192837-4',
      defaultCustomsOffice: '5003 - PUERTO CABELLO',
    });
  });

  it('returns requiresReauth: true with session expired message on HTTP 401', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: 'Authentication required' }), { status: 401 }),
      ),
    );

    const res = await persistOnboardingProfile(
      {
        fullName: 'María González',
        companyName: 'Aduanas Bolívar C.A.',
        defaultJurisdictionId: 've-seniat',
        defaultIncoterm: 'FOB',
        preferredCurrency: 'USD',
        approvalWorkflowMode: 'agent_decides',
        selectedPlanId: 'pilot',
        selectedBillingCycle: 'monthly',
        onboardingCompleted: true,
      },
      true,
    );

    expect(res.ok).toBe(false);
    expect(res.requiresReauth).toBe(true);
    expect(res.error).toMatch(/sesión expiró/i);
  });

  it('surfaces validation issue message from HTTP 400 response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: 'Validation failed',
            issues: [{ message: 'Nombre de empresa o agencia requerido.' }],
          }),
          { status: 400 },
        ),
      ),
    );

    const res = await persistOnboardingProfile(
      {
        fullName: 'María González',
        companyName: 'A',
        defaultJurisdictionId: 've-seniat',
        defaultIncoterm: 'FOB',
        preferredCurrency: 'USD',
        approvalWorkflowMode: 'agent_decides',
        selectedPlanId: 'pilot',
        selectedBillingCycle: 'monthly',
        onboardingCompleted: true,
      },
      true,
    );

    expect(res.ok).toBe(false);
    expect(res.error).toBe('Nombre de empresa o agencia requerido.');
  });
});
