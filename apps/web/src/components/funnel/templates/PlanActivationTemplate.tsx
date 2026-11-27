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
import { computeEligiblePilotCredit } from '@/lib/funnel/pilot-credit';
import {
  isPlanAnnualOnly,
  isPlanCustomPricing,
  isPlanOneTime,
  type PlanRecommendation,
} from '@/lib/funnel/plan-recommender';
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
        .filter(
          (p) =>
            p.published &&
            !isPlanCustomPricing(p) &&
            (p.monthlyPriceUsd > 0 || p.annualPriceUsd > 0),
        )
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
      .then((rows) => {
        if (active) setPayments(rows);
      })
      .catch((err: unknown) => {
        if (active) {
          setErrorMessage(err instanceof Error ? err.message : 'No pudimos cargar tus pagos reportados.');
        }
      });
    return () => {
      active = false;
    };
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
  const appliedPilotCredit =
    activePlan?.planId === 'agencia' && pilotCredit ? pilotCredit : null;
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
      setErrorMessage(
        err instanceof Error ? err.message : 'No se pudo registrar el reporte de pago.',
      );
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

          <Link
            href="/app"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-strong bg-surface-panel hover:bg-surface-hover text-xs font-semibold text-ink-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver a TariffOS
          </Link>
        </div>

        {errorMessage ? (
          <div
            role="alert"
            className="flex items-center justify-between gap-3 rounded-xl border border-rose-300 bg-rose-50 px-4 py-2.5 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200"
          >
            <span>{errorMessage}</span>
            <button type="button" onClick={() => setErrorMessage(null)} className="font-semibold underline cursor-pointer">
              Cerrar
            </button>
          </div>
        ) : null}

        {lastSubmitted ? (
          <FunnelCard padding="p-5" className="border-emerald-300 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/25 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <div className="text-sm font-bold text-ink-primary">Solicitud de activación recibida</div>
                <p className="text-xs text-ink-secondary">
                  Registramos tu reporte para el plan <strong>{lastSubmitted.planName}</strong> (Ref.{' '}
                  <span className="font-mono font-semibold">{lastSubmitted.referenceCode}</span>). Verificaremos el pago en menos de 24h hábiles y recibirás confirmación por correo.
                </p>
                <p className="text-[11px] text-ink-muted">
                  Tu espacio permanecerá en modo lectura mientras verificamos tu pago (menos de 24h hábiles). ¿Urgente? Escríbenos a{' '}
                  <a href="mailto:soporte@tariffos.app" className="font-medium text-accent-ink hover:underline">
                    soporte@tariffos.app
                  </a>{' '}
                  indicando tu referencia.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <FunnelBadge variant="warning">Pendiente de verificación</FunnelBadge>
              <Link
                href="/app"
                className="px-3 py-1.5 rounded-lg bg-ink-primary text-ink-on-inverted text-xs font-semibold hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                Ir al workspace
              </Link>
            </div>
          </FunnelCard>
        ) : null}

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
