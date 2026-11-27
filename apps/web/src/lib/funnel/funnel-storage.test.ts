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
      currentStep: 2,
      fullName: 'María González',
      role: 'Agente de Aduanas',
      companyName: 'Aduanas Bolívar C.A.',
      brokerLicense: 'SENIAT-1042',
      defaultJurisdictionId: 've-seniat',
      defaultIncoterm: 'CIF',
      preferredCurrency: 'EUR',
      approvalWorkflowMode: 'always_review',
      selectedPlanId: 'pilot',
      selectedBillingCycle: 'monthly',
      updatedAt: '2026-11-27T10:40:00.000Z',
    });

    const loaded = readOnboardingDraft();
    expect(loaded?.currentStep).toBe(2);
    expect(loaded?.companyName).toBe('Aduanas Bolívar C.A.');
    expect(loaded?.defaultIncoterm).toBe('CIF');

    clearOnboardingDraft();
    expect(readOnboardingDraft()).toBeNull();
  });
});
