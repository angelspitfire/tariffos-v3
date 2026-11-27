import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearMockSession,
  clearOnboardingDraft,
  consumePendingQuery,
  readMockProfile,
  readMockSession,
  readOnboardingDraft,
  readPendingQuery,
  readSelectedPlan,
  saveMockProfile,
  saveMockSession,
  saveOnboardingDraft,
  savePendingQuery,
  saveSelectedPlan,
} from './funnel-storage';

describe('funnel-storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('persists, reads, and consumes pendingQuery once', () => {
    savePendingQuery('  Inversor solar híbrido 5 kW  ');
    expect(readPendingQuery()).toBe('Inversor solar híbrido 5 kW');
    expect(consumePendingQuery()).toBe('Inversor solar híbrido 5 kW');
    expect(readPendingQuery()).toBeNull();
  });

  it('consumes legacy tariffos_pending_query key from session or local storage', () => {
    window.localStorage.setItem('tariffos_pending_query', '  Motor eléctrico 5 HP  ');
    expect(consumePendingQuery()).toBe('Motor eléctrico 5 HP');
    expect(window.localStorage.getItem('tariffos_pending_query')).toBeNull();
  });

  it('persists selected planId and billingCycle', () => {
    saveSelectedPlan('corporate', 'annual');
    expect(readSelectedPlan()).toEqual({
      planId: 'corporate',
      billingCycle: 'annual',
    });
  });

  it('persists and clears mock user session', () => {
    saveMockSession({
      userId: 'usr-1',
      email: 'carlos@aduanas.ve',
      fullName: 'Carlos Mendoza',
      provider: 'email',
    });

    expect(readMockSession()?.email).toBe('carlos@aduanas.ve');
    clearMockSession();
    expect(readMockSession()).toBeNull();
  });

  it('persists onboarding profile draft with approvalWorkflowMode', () => {
    saveMockProfile({
      fullName: 'Ana Pérez',
      companyName: 'Aduanas del Caribe C.A.',
      defaultJurisdictionId: 've-seniat',
      defaultIncoterm: 'CIF',
      preferredCurrency: 'USD',
      approvalWorkflowMode: 'always_review',
      selectedPlanId: 'pro',
      selectedBillingCycle: 'monthly',
      onboardingCompleted: true,
    });

    const saved = readMockProfile();
    expect(saved?.companyName).toBe('Aduanas del Caribe C.A.');
    expect(saved?.approvalWorkflowMode).toBe('always_review');
  });

  it('persists, reads, and clears multi-step onboarding wizard draft state', () => {
    saveOnboardingDraft({
      userId: 'usr-1',
      currentStep: 2,
      fullName: 'María González',
      role: 'Agente de Aduanas',
      companyName: 'Aduanas Bolívar C.A.',
      brokerLicense: 'SENIAT-1042',
      taxId: 'J-30192837-4',
      defaultJurisdictionId: 've-seniat',
      defaultCustomsOffice: '5003 - PUERTO CABELLO',
      defaultIncoterm: 'CIF',
      preferredCurrency: 'EUR',
      approvalWorkflowMode: 'always_review',
      selectedPlanId: 'pilot',
      selectedBillingCycle: 'monthly',
      updatedAt: new Date().toISOString(),
    });

    const loaded = readOnboardingDraft('usr-1');
    expect(loaded?.currentStep).toBe(2);
    expect(loaded?.companyName).toBe('Aduanas Bolívar C.A.');
    expect(loaded?.defaultIncoterm).toBe('CIF');
    expect(loaded?.taxId).toBe('J-30192837-4');
    expect(loaded?.defaultCustomsOffice).toBe('5003 - PUERTO CABELLO');

    clearOnboardingDraft();
    expect(readOnboardingDraft('usr-1')).toBeNull();
  });

  it('scopes onboarding draft by expectedUserId and rejects other or anonymous drafts', () => {
    saveOnboardingDraft({
      userId: 'usr-a',
      currentStep: 2,
      fullName: 'Usuario A',
      role: 'Agente de Aduanas',
      companyName: 'Empresa A',
      brokerLicense: '',
      defaultJurisdictionId: 've-seniat',
      defaultIncoterm: 'FOB',
      preferredCurrency: 'USD',
      approvalWorkflowMode: 'agent_decides',
      selectedPlanId: 'pilot',
      selectedBillingCycle: 'monthly',
      updatedAt: new Date().toISOString(),
    });

    expect(readOnboardingDraft('usr-a')?.fullName).toBe('Usuario A');
    expect(readOnboardingDraft('usr-b')).toBeNull();

    window.localStorage.setItem(
      'tariffos_onboarding_draft_v1',
      JSON.stringify({
        currentStep: 2,
        fullName: 'Anon Draft',
        role: 'Agente de Aduanas',
        companyName: 'Empresa Anon',
        brokerLicense: '',
        defaultJurisdictionId: 've-seniat',
        defaultIncoterm: 'FOB',
        preferredCurrency: 'USD',
        approvalWorkflowMode: 'agent_decides',
        selectedPlanId: 'pilot',
        selectedBillingCycle: 'monthly',
        updatedAt: new Date().toISOString(),
      }),
    );
    expect(readOnboardingDraft('usr-b')).toBeNull();
  });

  it('expires and clears drafts older than 7 days and clamps legacy step 3 to 2', () => {
    saveOnboardingDraft({
      currentStep: 2,
      fullName: 'Old Draft',
      role: 'Agente de Aduanas',
      companyName: 'Old Co',
      brokerLicense: '',
      defaultJurisdictionId: 've-seniat',
      defaultIncoterm: 'FOB',
      preferredCurrency: 'USD',
      approvalWorkflowMode: 'agent_decides',
      selectedPlanId: 'pilot',
      selectedBillingCycle: 'monthly',
      updatedAt: new Date(Date.now() - 8 * 86_400_000).toISOString(),
    });

    expect(readOnboardingDraft()).toBeNull();
    expect(window.localStorage.getItem('tariffos_onboarding_draft_v1')).toBeNull();

    window.localStorage.setItem(
      'tariffos_onboarding_draft_v1',
      JSON.stringify({
        currentStep: 3,
        fullName: 'Legacy User',
        role: 'Agente de Aduanas',
        companyName: 'Legacy Co',
        brokerLicense: '',
        defaultJurisdictionId: 've-seniat',
        defaultIncoterm: 'FOB',
        preferredCurrency: 'USD',
        approvalWorkflowMode: 'agent_decides',
        selectedPlanId: 'pilot',
        selectedBillingCycle: 'monthly',
        updatedAt: new Date().toISOString(),
      }),
    );
    expect(readOnboardingDraft()?.currentStep).toBe(2);
  });
});
