'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type {
  ApprovalWorkflowMode,
  IncotermCode,
  SubscriptionBillingCycle,
  SubscriptionPlanConfig,
} from '@tariffos/shared-types';
import {
  clearOnboardingDraft,
  DEFAULT_CUSTOMS_OFFICE,
  FUNNEL_JURISDICTIONS,
  readMockSession,
  readOnboardingDraft,
  readPendingQuery,
  readSelectedPlan,
  saveOnboardingDraft,
  type OnboardingWizardStep,
} from '@/lib/funnel/funnel-storage';
import {
  persistOnboardingProfile,
  resolvePlanPricing,
} from '@/lib/funnel/onboarding-actions';

export interface UseOnboardingWizardParams {
  isCloud: boolean;
  userId?: string;
  plans: readonly SubscriptionPlanConfig[];
  preselectedPlanId?: string;
  preselectedCycle?: SubscriptionBillingCycle;
  initialFullName?: string;
}

export function useOnboardingWizard({
  isCloud,
  userId,
  plans,
  preselectedPlanId,
  preselectedCycle,
  initialFullName,
}: UseOnboardingWizardParams) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlPlan = preselectedPlanId ?? searchParams.get('plan');
  const urlCycle = preselectedCycle ?? searchParams.get('cycle');
  const hasExplicitUrlPlan = Boolean(urlPlan);

  const [step, setStep] = useState<OnboardingWizardStep>(1);
  const [fullName, setFullName] = useState(initialFullName ?? '');
  const [role, setRole] = useState('Agente de Aduanas');
  const [companyName, setCompanyName] = useState('');
  const [brokerLicense, setBrokerLicense] = useState('');
  const [taxId, setTaxId] = useState('');
  const [jurisdictionId, setJurisdictionId] = useState(FUNNEL_JURISDICTIONS[0]?.id ?? 've-seniat');
  const [customsOffice, setCustomsOffice] = useState(DEFAULT_CUSTOMS_OFFICE);
  const [incoterm, setIncoterm] = useState<IncotermCode>('FOB');
  const [currency, setCurrency] = useState<'USD' | 'EUR'>('USD');
  const [approvalMode, setApprovalMode] = useState<ApprovalWorkflowMode>('agent_decides');
  const [selectedPlanId, setSelectedPlanId] = useState(urlPlan || 'pilot');
  const [billingCycle, setBillingCycle] = useState<SubscriptionBillingCycle>(
    urlCycle === 'annual' ? 'annual' : 'monthly',
  );
  const [showPlanPicker, setShowPlanPicker] = useState(!hasExplicitUrlPlan);
  const [pendingQuery, setPendingQuery] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fullNameError, setFullNameError] = useState<string | null>(null);
  const [companyNameError, setCompanyNameError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [requiresReauth, setRequiresReauth] = useState(false);

  const hydratedRef = useRef(false);
  const fullNameRef = useRef<HTMLInputElement>(null);
  const companyNameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const draft = readOnboardingDraft(userId);
    const mockSession = readMockSession();
    const storedPlan = readSelectedPlan();
    setPendingQuery(readPendingQuery());

    if (draft) {
      setStep(draft.currentStep);
      setFullName(draft.fullName || initialFullName || mockSession?.fullName || '');
      setRole(draft.role || 'Agente de Aduanas');
      setCompanyName(draft.companyName || '');
      setBrokerLicense(draft.brokerLicense || '');
      setTaxId(draft.taxId || '');
      setJurisdictionId(draft.defaultJurisdictionId || FUNNEL_JURISDICTIONS[0]?.id || 've-seniat');
      setCustomsOffice(draft.defaultCustomsOffice || DEFAULT_CUSTOMS_OFFICE);
      setIncoterm(draft.defaultIncoterm || 'FOB');
      setCurrency(draft.preferredCurrency || 'USD');
      setApprovalMode(draft.approvalWorkflowMode || 'agent_decides');
      if (!hasExplicitUrlPlan && draft.selectedPlanId) {
        setSelectedPlanId(draft.selectedPlanId);
        setBillingCycle(draft.selectedBillingCycle);
      }
    } else {
      if (!initialFullName && mockSession?.fullName) setFullName(mockSession.fullName);
      if (!hasExplicitUrlPlan && storedPlan?.planId) {
        setSelectedPlanId(storedPlan.planId);
        setBillingCycle(storedPlan.billingCycle);
        setShowPlanPicker(false);
      }
    }
    hydratedRef.current = true;
  }, [hasExplicitUrlPlan, initialFullName, userId]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    saveOnboardingDraft({
      userId, currentStep: step, fullName, role, companyName, brokerLicense, taxId,
      defaultJurisdictionId: jurisdictionId, defaultCustomsOffice: customsOffice,
      defaultIncoterm: incoterm, preferredCurrency: currency, approvalWorkflowMode: approvalMode,
      selectedPlanId, selectedBillingCycle: billingCycle, updatedAt: new Date().toISOString(),
    });
  }, [
    userId, step, fullName, role, companyName, brokerLicense, taxId,
    jurisdictionId, customsOffice, incoterm, currency, approvalMode,
    selectedPlanId, billingCycle,
  ]);

  const { matchedPlan, isOneTime, isPaidPlan, effectiveCycle } = resolvePlanPricing(
    plans,
    selectedPlanId,
    billingCycle,
  );

  const validateIdentityStep = (): boolean => {
    const nameInvalid = fullName.trim().length < 2;
    const companyInvalid = companyName.trim().length < 2;
    setFullNameError(nameInvalid ? 'Ingresa tu nombre completo.' : null);
    setCompanyNameError(companyInvalid ? 'Ingresa el nombre de tu empresa o agencia.' : null);
    if (nameInvalid) { fullNameRef.current?.focus(); return false; }
    if (companyInvalid) { companyNameRef.current?.focus(); return false; }
    return true;
  };

  const handleNextStep = () => {
    setSubmitError(null);
    setRequiresReauth(false);
    if (step === 1 && !validateIdentityStep()) return;
    setStep(2);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (step < 2) { handleNextStep(); return; }
    if (!validateIdentityStep()) { setStep(1); return; }

    setSubmitError(null);
    setRequiresReauth(false);
    setIsSubmitting(true);
    try {
      const result = await persistOnboardingProfile(
        {
          fullName: fullName.trim(), role, brokerLicense: brokerLicense.trim(),
          taxId: taxId.trim() || undefined, companyName: companyName.trim(),
          defaultJurisdictionId: jurisdictionId, defaultCustomsOffice: customsOffice,
          defaultIncoterm: incoterm, preferredCurrency: currency, approvalWorkflowMode: approvalMode,
          selectedPlanId, selectedBillingCycle: effectiveCycle, onboardingCompleted: true,
        },
        isCloud,
      );
      if (!result.ok) {
        setRequiresReauth(Boolean(result.requiresReauth));
        setSubmitError(result.error);
        return;
      }
      clearOnboardingDraft();
      router.push(
        isPaidPlan && !result.skipPaymentActivation
          ? `/activate-plan?plan=${encodeURIComponent(selectedPlanId)}&cycle=${effectiveCycle}`
          : '/app',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    step, setStep, fullName, setFullName, role, setRole, companyName, setCompanyName,
    brokerLicense, setBrokerLicense, taxId, setTaxId, jurisdictionId, setJurisdictionId,
    customsOffice, setCustomsOffice, incoterm, setIncoterm, currency, setCurrency,
    approvalMode, setApprovalMode, selectedPlanId, setSelectedPlanId, billingCycle, setBillingCycle,
    showPlanPicker, setShowPlanPicker, pendingQuery, isSubmitting,
    fullNameError, setFullNameError, companyNameError, setCompanyNameError,
    submitError, setSubmitError, requiresReauth, fullNameRef, companyNameRef,
    matchedPlan, isOneTime, isPaidPlan, effectiveCycle, handleNextStep, handleSubmit,
  };
}
