'use client';

import { useEffect, useMemo, useState } from 'react';
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
import { computeEligiblePilotCredit } from '@/lib/funnel/pilot-credit';
import {
  isPlanAnnualOnly,
  isPlanCustomPricing,
  isPlanOneTime,
  type PlanRecommendation,
} from '@/lib/funnel/plan-recommender';
import { PaymentSubmittedBanner } from '../molecules/PaymentSubmittedBanner';
import { PlanActivationHeader } from '../molecules/PlanActivationHeader';
import { PlanActivationSummary } from '../molecules/PlanActivationSummary';
import { SubmittedPaymentsList } from '../molecules/SubmittedPaymentsList';
import { PlanActivationForm } from '../organisms/PlanActivationForm';
import { PlanRecommender } from '../organisms/PlanRecommender';

export interface PlanActivationTemplateProps {
  plans?: readonly SubscriptionPlanConfig[];
  initialPlanId?: string;
  initialCycle?: SubscriptionBillingCycle;
  initialPayerName?: string;
  initialPayerEmail?: string;
  billingPort?: IBillingActivationPort;
}

export function PlanActivationTemplate({
  plans = SAAS_PLANS,
  initialPlanId,
  initialCycle = 'monthly',
  initialPayerName,
  initialPayerEmail,
  billingPort,
}: PlanActivationTemplateProps) {
  const port = useMemo(() => billingPort ?? createBillingActivationAdapter(), [billingPort]);
  const paidPlans = useMemo(
    () =>
      [...plans]
        .filter((p) => p.published && !isPlanCustomPricing(p) && (p.monthlyPriceUsd > 0 || p.annualPriceUsd > 0))
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [plans],
  );

  const fallbackPlanId =
    paidPlans.find((p) => p.planId === initialPlanId)?.planId ?? paidPlans[0]?.planId ?? 'pilot';
  const initialPlanObj = paidPlans.find((p) => p.planId === fallbackPlanId);

  const [planId, setPlanId] = useState(fallbackPlanId);
  const [recommendedPlanId, setRecommendedPlanId] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<SubscriptionBillingCycle>(
    initialPlanObj && isPlanAnnualOnly(initialPlanObj)
      ? 'annual'
      : initialPlanObj && isPlanOneTime(initialPlanObj)
        ? 'monthly'
        : initialCycle,
  );
  const [payments, setPayments] = useState<ManualPaymentRecord[]>([]);
  const [showRecommender, setShowRecommender] = useState(!initialPlanId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmitted, setLastSubmitted] = useState<ManualPaymentRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const session = readMockSession();
  const profile = readMockProfile();

  useEffect(() => {
    let active = true;
    void port
      .listPayments()
      .then((rows) => { if (active) setPayments(rows); })
      .catch((err: unknown) => {
        if (active) setErrorMessage(err instanceof Error ? err.message : 'No pudimos cargar tus pagos reportados.');
      });
    return () => { active = false; };
  }, [port]);

  const activePlan = paidPlans.find((p) => p.planId === planId) ?? paidPlans[0];
  const activeAnnualOnly = activePlan ? isPlanAnnualOnly(activePlan) : false;
  const activeOneTime = activePlan ? isPlanOneTime(activePlan) : false;
  const effectiveCycle: SubscriptionBillingCycle = activeOneTime
    ? 'monthly'
    : activeAnnualOnly
      ? 'annual'
      : billingCycle;
  const rawExpectedAmount = activePlan
    ? activeOneTime
      ? activePlan.monthlyPriceUsd
      : effectiveCycle === 'annual'
        ? activePlan.annualPriceUsd
        : activePlan.monthlyPriceUsd
    : 0;
  const pilotCredit = useMemo(() => computeEligiblePilotCredit(payments), [payments]);
  const appliedPilotCredit = activePlan?.planId === 'agencia' && pilotCredit ? pilotCredit : null;
  const expectedAmount = appliedPilotCredit
    ? Math.max(0, rawExpectedAmount - appliedPilotCredit.amountUsd)
    : rawExpectedAmount;

  const handleSelectPlan = (plan: SubscriptionPlanConfig) => {
    setPlanId(plan.planId);
    if (isPlanAnnualOnly(plan)) setBillingCycle('annual');
    else if (isPlanOneTime(plan)) setBillingCycle('monthly');
  };

  const handleApplyRecommendation = (rec: PlanRecommendation) => {
    setRecommendedPlanId(rec.planId);
    if (rec.planId === 'enterprise') return;
    setPlanId(rec.planId);
    setBillingCycle(rec.recommendedCycle);
  };

  const handleSubmitPayment = async (payload: SubmitManualPaymentPayload) => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const created = await port.submitPayment(payload);
      setLastSubmitted(created);
      setPayments((prev) => [created, ...prev]);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'No se pudo registrar el reporte de pago.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-app py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-5">
        <PlanActivationHeader errorMessage={errorMessage} onDismissError={() => setErrorMessage(null)} />
        {lastSubmitted ? <PaymentSubmittedBanner payment={lastSubmitted} /> : null}
        {showRecommender ? (
          <PlanRecommender plans={paidPlans} paidOnly onApplyRecommendation={handleApplyRecommendation} />
        ) : (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowRecommender(true)}
              className="text-xs font-medium text-accent-ink hover:underline cursor-pointer"
            >
              ¿Dudas entre Piloto y Agencia? Comparar planes
            </button>
          </div>
        )}
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
            rawAmount={rawExpectedAmount}
            expectedAmount={expectedAmount}
            appliedPilotCredit={appliedPilotCredit}
            defaultPayerName={initialPayerName || profile?.companyName || profile?.fullName || session?.fullName}
            defaultPayerEmail={initialPayerEmail || session?.email}
            isSubmitting={isSubmitting}
            onSubmitPayment={handleSubmitPayment}
          />
        </div>
        <SubmittedPaymentsList payments={payments} />
      </div>
    </div>
  );
}
