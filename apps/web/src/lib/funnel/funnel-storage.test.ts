import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearMockSession,
  consumePendingQuery,
  readMockProfile,
  readMockSession,
  readPendingQuery,
  readSelectedPlan,
  saveMockProfile,
  saveMockSession,
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
});
