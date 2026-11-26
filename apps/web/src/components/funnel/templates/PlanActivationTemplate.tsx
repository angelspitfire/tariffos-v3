'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, CreditCard } from 'lucide-react';
import {
  SAAS_PLANS,
  type ManualPaymentRecord,
  type SubscriptionBillingCycle,
  type SubscriptionPlanConfig,
} from '@tariffos/shared-types';
import {
  createBillingActivationAdapter,
  type IBillingActivationPort,
  type SubmitManualPaymentPayload,
} from '@/lib/funnel/billing-port';
import { readMockProfile, readMockSession } from '@/lib/funnel/funnel-storage';
import { isPlanAnnualOnly, type PlanRecommendation } from '@/lib/funnel/plan-recommender';
import { FunnelBadge } from '../atoms/FunnelBadge';
import { FunnelCard } from '../atoms/FunnelCard';
import { PlanActivationSummary } from '../molecules/PlanActivationSummary';
import { SubmittedPaymentsList } from '../molecules/SubmittedPaymentsList';
import { PlanActivationForm } from '../organisms/PlanActivationForm';
import { PlanRecommender } from '../organisms/PlanRecommender';

export interface PlanActivationTemplateProps {
  plans?: readonly SubscriptionPlanConfig[];
  initialPlanId?: string;
  initialCycle?: SubscriptionBillingCycle;
  billingPort?: IBillingActivationPort;
}

export function PlanActivationTemplate({
  plans = SAAS_PLANS,
  initialPlanId,
  initialCycle = 'monthly',
  billingPort,
}: PlanActivationTemplateProps) {
  const port = useMemo(() => billingPort ?? createBillingActivationAdapter(), [billingPort]);
  const paidPlans = useMemo(
    () =>
      [...plans]
        .filter((p) => p.published && (p.monthlyPriceUsd > 0 || p.annualPriceUsd > 0))
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [plans],
  );

  const fallbackPlanId =
    paidPlans.find((p) => p.planId === initialPlanId)?.planId ?? paidPlans[0]?.planId ?? 'pro';
  const initialPlanObj = paidPlans.find((p) => p.planId === fallbackPlanId);

  const [planId, setPlanId] = useState(fallbackPlanId);
  const [recommendedPlanId, setRecommendedPlanId] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<SubscriptionBillingCycle>(
    initialPlanObj && isPlanAnnualOnly(initialPlanObj) ? 'annual' : initialCycle,
  );
  const [payments, setPayments] = useState<ManualPaymentRecord[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmitted, setLastSubmitted] = useState<ManualPaymentRecord | null>(null);

  const session = readMockSession();
  const profile = readMockProfile();

  useEffect(() => {
    void port.listPayments().then(setPayments);
  }, [port]);

  const activePlan = paidPlans.find((p) => p.planId === planId) ?? paidPlans[0];
  const activeAnnualOnly = activePlan ? isPlanAnnualOnly(activePlan) : false;
  const effectiveCycle: SubscriptionBillingCycle = activeAnnualOnly ? 'annual' : billingCycle;
  const expectedAmount = activePlan
    ? effectiveCycle === 'annual'
      ? activePlan.annualPriceUsd
      : activePlan.monthlyPriceUsd
    : 0;

  const handleSelectPlan = (plan: SubscriptionPlanConfig) => {
    setPlanId(plan.planId);
    if (isPlanAnnualOnly(plan)) setBillingCycle('annual');
  };

  const handleApplyRecommendation = (rec: PlanRecommendation) => {
    setRecommendedPlanId(rec.planId);
    setPlanId(rec.planId);
    setBillingCycle(rec.recommendedCycle);
  };

  const handleSubmitPayment = async (payload: SubmitManualPaymentPayload) => {
    setIsSubmitting(true);
    try {
      const created = await port.submitPayment(payload);
      setLastSubmitted(created);
      setPayments((prev) => [created, ...prev]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-app py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-surface-inverted text-ink-on-inverted flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-ink-primary">Activar plan comercial</h1>
              <p className="text-xs text-ink-muted">
                Facturación manual asistida: selecciona tu plan, realiza el pago y reporta la referencia.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/admin/billing" className="px-3 py-1.5 rounded-lg border border-border-subtle bg-surface-panel hover:bg-surface-hover text-xs font-medium text-ink-secondary transition-colors">
              Cola Admin
            </Link>
            <Link href="/app" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-strong bg-surface-panel hover:bg-surface-hover text-xs font-semibold text-ink-primary transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              Volver a TariffOS
            </Link>
          </div>
        </div>

        {lastSubmitted ? (
          <FunnelCard padding="p-5" className="border-emerald-300 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/25 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="text-sm font-bold text-ink-primary">Solicitud de activación recibida</div>
                <p className="text-xs text-ink-secondary">
                  Registramos tu reporte para el plan <strong>{lastSubmitted.planName}</strong> (Ref.{' '}
                  <span className="font-mono font-semibold">{lastSubmitted.referenceCode}</span>). Activación en menos de 24h hábiles.
                </p>
              </div>
            </div>
            <FunnelBadge variant="warning">Pendiente de verificación</FunnelBadge>
          </FunnelCard>
        ) : null}

        <PlanRecommender plans={paidPlans} paidOnly onApplyRecommendation={handleApplyRecommendation} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <PlanActivationSummary
            paidPlans={paidPlans}
            selectedPlanId={planId}
            recommendedPlanId={recommendedPlanId}
            effectiveCycle={effectiveCycle}
            activeAnnualOnly={activeAnnualOnly}
            activePlan={activePlan}
            onSelectPlan={handleSelectPlan}
            onChangeCycle={setBillingCycle}
          />
          <PlanActivationForm
            key={`${planId}-${effectiveCycle}`}
            activePlan={activePlan}
            effectiveCycle={effectiveCycle}
            expectedAmount={expectedAmount}
            defaultPayerName={profile?.companyName || profile?.fullName || session?.fullName}
            defaultPayerEmail={session?.email}
            isSubmitting={isSubmitting}
            onSubmitPayment={handleSubmitPayment}
          />
        </div>

        <SubmittedPaymentsList payments={payments} />
      </div>
    </div>
  );
}
