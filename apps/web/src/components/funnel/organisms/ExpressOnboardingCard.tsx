'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import {
  SAAS_PLANS,
  type ApprovalWorkflowMode,
  type IncotermCode,
  type SubscriptionBillingCycle,
  type SubscriptionPlanConfig,
} from '@tariffos/shared-types';
import { isCloudModeEnabled } from '@/lib/runtime-config';
import {
  clearOnboardingDraft,
  FUNNEL_JURISDICTIONS,
  readMockSession,
  readOnboardingDraft,
  saveOnboardingDraft,
  type OnboardingWizardStep,
} from '@/lib/funnel/funnel-storage';
import {
  persistOnboardingProfile,
  resolveInitialOnboardingPlan,
} from '@/lib/funnel/onboarding-actions';
import { isPlanAnnualOnly, isPlanFree, isPlanOneTime } from '@/lib/funnel/plan-recommender';
import { FunnelBadge } from '../atoms/FunnelBadge';
import { FunnelButton } from '../atoms/FunnelButton';
import { FunnelCard } from '../atoms/FunnelCard';
import { OnboardingPlanPicker } from '../molecules/OnboardingPlanPicker';
import { OnboardingStepIdentity } from '../molecules/OnboardingStepIdentity';
import { OnboardingStepOperation } from '../molecules/OnboardingStepOperation';
import { OnboardingStepper } from '../molecules/OnboardingStepper';

export interface ExpressOnboardingCardProps {
  cloudMode?: boolean;
  plans?: readonly SubscriptionPlanConfig[];
  preselectedPlanId?: string;
  preselectedCycle?: SubscriptionBillingCycle;
  initialFullName?: string;
}

export function ExpressOnboardingCard({
  cloudMode,
  plans = SAAS_PLANS,
  preselectedPlanId,
  preselectedCycle,
  initialFullName,
}: ExpressOnboardingCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCloud = cloudMode ?? isCloudModeEnabled();

  const initialPlan = resolveInitialOnboardingPlan({
    urlPlan: preselectedPlanId ?? searchParams.get('plan'),
    urlCycle: preselectedCycle ?? searchParams.get('cycle'),
  });
  const savedDraft = readOnboardingDraft();
  const mockSession = readMockSession();

  const [step, setStep] = useState<OnboardingWizardStep>(savedDraft?.currentStep ?? 1);
  const [fullName, setFullName] = useState(savedDraft?.fullName || initialFullName || mockSession?.fullName || '');
  const [role, setRole] = useState(savedDraft?.role ?? 'Agente de Aduanas');
  const [companyName, setCompanyName] = useState(savedDraft?.companyName ?? '');
  const [brokerLicense, setBrokerLicense] = useState(savedDraft?.brokerLicense ?? '');
  const [jurisdictionId, setJurisdictionId] = useState(
    savedDraft?.defaultJurisdictionId ?? FUNNEL_JURISDICTIONS[0]?.id ?? 've-seniat',
  );
  const [incoterm, setIncoterm] = useState<IncotermCode>(savedDraft?.defaultIncoterm ?? 'FOB');
  const [currency, setCurrency] = useState<'USD' | 'EUR'>(savedDraft?.preferredCurrency ?? 'USD');
  const [approvalMode, setApprovalMode] = useState<ApprovalWorkflowMode>(
    savedDraft?.approvalWorkflowMode ?? 'agent_decides',
  );
  const [selectedPlanId, setSelectedPlanId] = useState(
    initialPlan.preselected ? initialPlan.planId : (savedDraft?.selectedPlanId ?? initialPlan.planId),
  );
  const [billingCycle, setBillingCycle] = useState<SubscriptionBillingCycle>(
    initialPlan.preselected ? initialPlan.billingCycle : (savedDraft?.selectedBillingCycle ?? initialPlan.billingCycle),
  );
  const [showPlanPicker, setShowPlanPicker] = useState(!initialPlan.preselected);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    saveOnboardingDraft({
      currentStep: step,
      fullName,
      role,
      companyName,
      brokerLicense,
      defaultJurisdictionId: jurisdictionId,
      defaultIncoterm: incoterm,
      preferredCurrency: currency,
      approvalWorkflowMode: approvalMode,
      selectedPlanId,
      selectedBillingCycle: billingCycle,
      updatedAt: new Date().toISOString(),
    });
  }, [
    step, fullName, role, companyName, brokerLicense,
    jurisdictionId, incoterm, currency, approvalMode,
    selectedPlanId, billingCycle,
  ]);

  const matchedPlan = plans.find((p) => p.planId === selectedPlanId) ?? plans[0];
  const isOneTime = matchedPlan ? isPlanOneTime(matchedPlan) : false;
  const isPaidPlan = matchedPlan ? !isPlanFree(matchedPlan) && !matchedPlan.customPricing : true;
  const effectiveCycle: SubscriptionBillingCycle = isOneTime
    ? 'monthly'
    : matchedPlan && isPlanAnnualOnly(matchedPlan)
      ? 'annual'
      : billingCycle;

  const handleNextStep = () => {
    if (step === 1 && (fullName.trim().length < 2 || companyName.trim().length < 2)) {
      setError('Ingresa tu nombre completo y el nombre de tu empresa o agencia.');
      return;
    }
    setError(null);
    setStep((prev) => (prev === 1 ? 2 : 3));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      handleNextStep();
      return;
    }
    if (fullName.trim().length < 2 || companyName.trim().length < 2) {
      setStep(1);
      setError('Ingresa tu nombre completo y el nombre de tu empresa o agencia.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await persistOnboardingProfile(
        {
          fullName: fullName.trim(),
          role,
          brokerLicense: brokerLicense.trim(),
          companyName: companyName.trim(),
          defaultJurisdictionId: jurisdictionId,
          defaultIncoterm: incoterm,
          preferredCurrency: currency,
          approvalWorkflowMode: approvalMode,
          selectedPlanId,
          selectedBillingCycle: effectiveCycle,
          onboardingCompleted: true,
        },
        isCloud,
      );
      if (!result.ok) return setError(result.error);
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

  return (
    <FunnelCard padding="p-6" className="space-y-5 shadow-xs">
      <div className="space-y-1.5">
        <FunnelBadge variant="accent">Configuración inicial</FunnelBadge>
        <h1 className="text-xl font-bold tracking-tight text-ink-primary">
          Prepara tu estación arancelaria
        </h1>
        <p className="text-xs text-ink-muted">
          Completa estos 3 pasos rápidos. Tu progreso queda guardado si necesitas continuar luego.
        </p>
      </div>

      <OnboardingStepper currentStep={step} onSelectStep={(next) => { setError(null); setStep(next); }} />

      <form onSubmit={handleSubmit} className="space-y-5">
        {step === 1 ? (
          <OnboardingStepIdentity
            fullName={fullName}
            role={role}
            brokerLicense={brokerLicense}
            companyName={companyName}
            onChangeFullName={setFullName}
            onChangeRole={setRole}
            onChangeBrokerLicense={setBrokerLicense}
            onChangeCompanyName={setCompanyName}
          />
        ) : null}

        {step === 2 ? (
          <OnboardingStepOperation
            isCloud={isCloud}
            jurisdictionId={jurisdictionId}
            incoterm={incoterm}
            currency={currency}
            approvalMode={approvalMode}
            onChangeJurisdiction={setJurisdictionId}
            onChangeIncoterm={setIncoterm}
            onChangeCurrency={setCurrency}
            onChangeApprovalMode={setApprovalMode}
          />
        ) : null}

        {step === 3 ? (
          <div className="space-y-4">
            {!showPlanPicker && matchedPlan ? (
              <div className="flex items-center justify-between gap-2 rounded-xl border border-accent-border bg-accent-soft/50 px-3.5 py-2.5 text-xs">
                <div className="flex items-center gap-2 text-ink-primary">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-accent-ink" />
                  <span>
                    Plan preseleccionado: <strong>{matchedPlan.name}</strong>
                    {isOneTime
                      ? ` ($${matchedPlan.monthlyPriceUsd} · Pago único)`
                      : isPaidPlan
                        ? ` (${effectiveCycle === 'annual' ? 'Anual' : 'Mensual'})`
                        : ''}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPlanPicker(true)}
                  className="cursor-pointer text-[11px] font-semibold text-accent-ink hover:underline"
                >
                  Cambiar
                </button>
              </div>
            ) : (
              <OnboardingPlanPicker
                plans={plans}
                selectedPlanId={selectedPlanId}
                billingCycle={billingCycle}
                onChangeCycle={setBillingCycle}
                onSelect={(planId, cycle) => {
                  setSelectedPlanId(planId);
                  if (cycle) setBillingCycle(cycle);
                }}
              />
            )}
          </div>
        ) : null}

        {error ? <p role="alert" className="text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p> : null}

        <div className="flex items-center justify-between gap-3 pt-1">
          {step > 1 ? (
            <FunnelButton
              type="button"
              variant="outline"
              size="lg"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              onClick={() => { setError(null); setStep((prev) => (prev === 3 ? 2 : 1)); }}
            >
              Anterior
            </FunnelButton>
          ) : (
            <span />
          )}

          {step < 3 ? (
            <FunnelButton
              type="button"
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight className="h-4 w-4" />}
              onClick={handleNextStep}
            >
              Siguiente
            </FunnelButton>
          ) : (
            <FunnelButton
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              {isPaidPlan ? 'Continuar a activación de plan' : 'Entrar al workspace'}
            </FunnelButton>
          )}
        </div>
      </form>
    </FunnelCard>
  );
}
