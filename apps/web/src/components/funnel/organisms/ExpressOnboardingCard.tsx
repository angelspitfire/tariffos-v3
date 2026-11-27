'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import {
  SAAS_PLANS,
  type SubscriptionBillingCycle,
  type SubscriptionPlanConfig,
} from '@tariffos/shared-types';
import { isCloudModeEnabled } from '@/lib/runtime-config';
import { useOnboardingWizard } from '@/lib/funnel/use-onboarding-wizard';
import { FunnelBadge } from '../atoms/FunnelBadge';
import { FunnelButton } from '../atoms/FunnelButton';
import { FunnelCard } from '../atoms/FunnelCard';
import { LoginContextBanners } from '../molecules/LoginContextBanners';
import { OnboardingAdvancedAccordion } from '../molecules/OnboardingAdvancedAccordion';
import { OnboardingStepIdentity } from '../molecules/OnboardingStepIdentity';
import { OnboardingStepPlan } from '../molecules/OnboardingStepPlan';
import { OnboardingStepper } from '../molecules/OnboardingStepper';

export interface ExpressOnboardingCardProps {
  cloudMode?: boolean;
  userId?: string;
  plans?: readonly SubscriptionPlanConfig[];
  preselectedPlanId?: string;
  preselectedCycle?: SubscriptionBillingCycle;
  initialFullName?: string;
}

export function ExpressOnboardingCard({
  cloudMode,
  userId,
  plans = SAAS_PLANS,
  preselectedPlanId,
  preselectedCycle,
  initialFullName,
}: ExpressOnboardingCardProps) {
  const isCloud = cloudMode ?? isCloudModeEnabled();
  const w = useOnboardingWizard({
    isCloud,
    userId,
    plans,
    preselectedPlanId,
    preselectedCycle,
    initialFullName,
  });

  return (
    <FunnelCard padding="p-6" className="space-y-5 shadow-xs">
      <div className="space-y-1.5">
        <FunnelBadge variant="accent">Configuración inicial</FunnelBadge>
        <h1 className="text-xl font-bold tracking-tight text-ink-primary">
          Prepara tu estación arancelaria
        </h1>
        <p className="text-xs text-ink-muted">
          Completa estos 2 pasos rápidos. Tu progreso queda guardado si necesitas continuar luego.
        </p>
      </div>

      <LoginContextBanners pendingQuery={w.pendingQuery} />

      <OnboardingStepper
        currentStep={w.step}
        onSelectStep={(next) => {
          w.setSubmitError(null);
          w.setStep(next);
        }}
      />

      <form onSubmit={(e) => void w.handleSubmit(e)} noValidate className="space-y-5">
        {w.step === 1 ? (
          <div className="space-y-4">
            <OnboardingStepIdentity
              fullName={w.fullName}
              role={w.role}
              brokerLicense={w.brokerLicense}
              taxId={w.taxId}
              companyName={w.companyName}
              fullNameError={w.fullNameError}
              companyNameError={w.companyNameError}
              fullNameRef={w.fullNameRef}
              companyNameRef={w.companyNameRef}
              onChangeFullName={(val) => {
                w.setFullName(val);
                if (w.fullNameError && val.trim().length >= 2) w.setFullNameError(null);
              }}
              onChangeRole={w.setRole}
              onChangeBrokerLicense={w.setBrokerLicense}
              onChangeTaxId={w.setTaxId}
              onChangeCompanyName={(val) => {
                w.setCompanyName(val);
                if (w.companyNameError && val.trim().length >= 2) w.setCompanyNameError(null);
              }}
            />

            <OnboardingAdvancedAccordion
              isCloud={isCloud}
              jurisdictionId={w.jurisdictionId}
              customsOffice={w.customsOffice}
              defaultIncoterm={w.incoterm}
              preferredCurrency={w.currency}
              approvalWorkflowMode={w.approvalMode}
              onChange={(patch) => {
                if (patch.jurisdictionId) w.setJurisdictionId(patch.jurisdictionId);
                if (patch.customsOffice) w.setCustomsOffice(patch.customsOffice);
                if (patch.defaultIncoterm) w.setIncoterm(patch.defaultIncoterm);
                if (patch.preferredCurrency) w.setCurrency(patch.preferredCurrency);
                if (patch.approvalWorkflowMode) w.setApprovalMode(patch.approvalWorkflowMode);
              }}
            />
          </div>
        ) : (
          <OnboardingStepPlan
            plans={plans}
            matchedPlan={w.matchedPlan}
            selectedPlanId={w.selectedPlanId}
            billingCycle={w.billingCycle}
            effectiveCycle={w.effectiveCycle}
            isOneTime={w.isOneTime}
            isPaidPlan={w.isPaidPlan}
            showPlanPicker={w.showPlanPicker}
            onShowPlanPicker={() => w.setShowPlanPicker(true)}
            onChangeCycle={w.setBillingCycle}
            onSelectPlan={(planId, cycle) => {
              w.setSelectedPlanId(planId);
              if (cycle) w.setBillingCycle(cycle);
            }}
          />
        )}

        {w.submitError ? (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/35 dark:text-rose-300"
          >
            <span>{w.submitError}</span>
            {w.requiresReauth ? (
              <Link
                href="/login?next=/onboarding"
                className="font-semibold text-accent-ink underline"
              >
                Iniciar sesión
              </Link>
            ) : null}
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-3 pt-1">
          {w.step > 1 ? (
            <FunnelButton
              type="button"
              variant="outline"
              size="lg"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              onClick={() => {
                w.setSubmitError(null);
                w.setStep(1);
              }}
            >
              Anterior
            </FunnelButton>
          ) : (
            <span />
          )}

          {w.step < 2 ? (
            <FunnelButton
              type="button"
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight className="h-4 w-4" />}
              onClick={w.handleNextStep}
            >
              Siguiente
            </FunnelButton>
          ) : (
            <FunnelButton
              type="submit"
              variant="primary"
              size="lg"
              isLoading={w.isSubmitting}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              {w.isPaidPlan ? 'Continuar a activación de plan' : 'Entrar al workspace'}
            </FunnelButton>
          )}
        </div>
      </form>
    </FunnelCard>
  );
}
