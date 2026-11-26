'use client';

import { useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Building2, CheckCircle2, User } from 'lucide-react';
import {
  SAAS_PLANS,
  type ApprovalWorkflowMode,
  type IncotermCode,
  type SubscriptionBillingCycle,
} from '@tariffos/shared-types';
import { isCloudModeEnabled } from '@/lib/runtime-config';
import { FUNNEL_JURISDICTIONS, readMockSession } from '@/lib/funnel/funnel-storage';
import {
  persistOnboardingProfile,
  resolveInitialOnboardingPlan,
} from '@/lib/funnel/onboarding-actions';
import { isPlanAnnualOnly, isPlanFree } from '@/lib/funnel/plan-recommender';
import { FunnelBadge } from '../atoms/FunnelBadge';
import { FunnelButton } from '../atoms/FunnelButton';
import { FunnelCard } from '../atoms/FunnelCard';
import { FunnelInput, FunnelSelect } from '../atoms/FunnelField';
import { OnboardingAdvancedAccordion } from '../molecules/OnboardingAdvancedAccordion';
import { OnboardingPlanPicker } from '../molecules/OnboardingPlanPicker';

export interface ExpressOnboardingCardProps {
  cloudMode?: boolean;
  preselectedPlanId?: string;
  preselectedCycle?: SubscriptionBillingCycle;
}

export function ExpressOnboardingCard({
  cloudMode,
  preselectedPlanId,
  preselectedCycle,
}: ExpressOnboardingCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCloud = cloudMode ?? isCloudModeEnabled();

  const initialPlan = resolveInitialOnboardingPlan({
    urlPlan: preselectedPlanId ?? searchParams.get('plan'),
    urlCycle: preselectedCycle ?? searchParams.get('cycle'),
  });
  const mockSession = readMockSession();

  const [fullName, setFullName] = useState(mockSession?.fullName ?? '');
  const [companyName, setCompanyName] = useState('');
  const [jurisdictionId, setJurisdictionId] = useState(FUNNEL_JURISDICTIONS[0]?.id ?? 've-seniat');
  const [incoterm, setIncoterm] = useState<IncotermCode>('FOB');
  const [currency, setCurrency] = useState<'USD' | 'EUR'>('USD');
  const [approvalMode, setApprovalMode] = useState<ApprovalWorkflowMode>('agent_decides');
  const [selectedPlanId, setSelectedPlanId] = useState(initialPlan.planId);
  const [billingCycle, setBillingCycle] = useState<SubscriptionBillingCycle>(initialPlan.billingCycle);
  const [showPlanPicker, setShowPlanPicker] = useState(!initialPlan.preselected);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const matchedPlan = SAAS_PLANS.find((p) => p.planId === selectedPlanId) ?? SAAS_PLANS[0];
  const isPaidPlan = matchedPlan ? !isPlanFree(matchedPlan) : false;
  const effectiveCycle: SubscriptionBillingCycle =
    matchedPlan && isPlanAnnualOnly(matchedPlan) ? 'annual' : billingCycle;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (fullName.trim().length < 2 || companyName.trim().length < 2) {
      setError('Ingresa tu nombre completo y el nombre de tu empresa o agencia.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await persistOnboardingProfile(
        {
          fullName: fullName.trim(),
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
      router.push(
        isPaidPlan
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
        <FunnelBadge variant="accent">Configuración express · 1 paso</FunnelBadge>
        <h1 className="text-xl font-bold tracking-tight text-ink-primary">
          Prepara tu estación arancelaria
        </h1>
        <p className="text-xs text-ink-muted">
          Solo 3 datos esenciales para personalizar tus dictámenes. Sin pasos bloqueantes.
        </p>
      </div>

      {!showPlanPicker && matchedPlan ? (
        <div className="px-3.5 py-2.5 rounded-xl border border-accent-border bg-accent-soft/50 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-ink-primary">
            <CheckCircle2 className="w-4 h-4 text-accent-ink shrink-0" />
            <span>
              Plan preseleccionado: <strong>{matchedPlan.name}</strong>
              {isPaidPlan ? ` (${effectiveCycle === 'annual' ? 'Anual' : 'Mensual'})` : ' (Gratis)'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowPlanPicker(true)}
            className="text-[11px] font-semibold text-accent-ink hover:underline cursor-pointer"
          >
            Cambiar
          </button>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FunnelInput
          label="Nombre completo"
          placeholder="Ej. María González"
          leftIcon={<User className="w-4 h-4" />}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <FunnelInput
          label="Empresa o agencia"
          placeholder="Ej. Aduanas Bolívar C.A."
          leftIcon={<Building2 className="w-4 h-4" />}
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
        />
        <FunnelSelect
          label="Jurisdicción por defecto"
          value={jurisdictionId}
          onChange={(e) => setJurisdictionId(e.target.value)}
        >
          {FUNNEL_JURISDICTIONS.map((jur) => (
            <option key={jur.id} value={jur.id}>
              {jur.country} · {jur.authority} ({jur.nomenclature})
            </option>
          ))}
        </FunnelSelect>

        <OnboardingAdvancedAccordion
          defaultIncoterm={incoterm}
          preferredCurrency={currency}
          approvalWorkflowMode={approvalMode}
          onChange={(patch) => {
            if (patch.defaultIncoterm) setIncoterm(patch.defaultIncoterm);
            if (patch.preferredCurrency) setCurrency(patch.preferredCurrency);
            if (patch.approvalWorkflowMode) setApprovalMode(patch.approvalWorkflowMode);
          }}
        />

        {showPlanPicker ? (
          <OnboardingPlanPicker
            selectedPlanId={selectedPlanId}
            onSelect={(planId, cycle) => {
              setSelectedPlanId(planId);
              if (cycle) setBillingCycle(cycle);
            }}
          />
        ) : null}

        {error ? <p role="alert" className="text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p> : null}

        <FunnelButton type="submit" variant="primary" size="lg" className="w-full" isLoading={isSubmitting} rightIcon={<ArrowRight className="w-4 h-4" />}>
          {isPaidPlan ? 'Continuar a activación de plan' : 'Entrar al workspace'}
        </FunnelButton>

        <p className="text-[11px] text-center text-ink-muted">
          Podrás configurar tu patente y firma digital para dictámenes PDF más adelante en tu perfil.
        </p>
      </form>
    </FunnelCard>
  );
}
