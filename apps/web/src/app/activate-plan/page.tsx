import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import type { SubscriptionBillingCycle } from '@tariffos/shared-types';
import { PlanActivationTemplate } from '@/components/funnel/templates/PlanActivationTemplate';
import { loadPublicPlans } from '@/lib/funnel/public-plans';
import { resolveCloudFunnelGateRedirect } from '@/lib/funnel/server-account-gate';

export const dynamic = 'force-dynamic';

interface ActivatePlanPageProps {
  searchParams: Promise<{
    plan?: string;
    cycle?: string;
  }>;
}

async function ActivatePlanContent({ searchParams }: ActivatePlanPageProps) {
  const params = await searchParams;
  const redirectTarget = await resolveCloudFunnelGateRedirect({
    route: 'activate-plan',
    hasFunnelPlanParam: Boolean(params.plan),
  });
  if (redirectTarget) {
    redirect(redirectTarget);
  }
  const plans = await loadPublicPlans();
  const cycle: SubscriptionBillingCycle =
    params.cycle === 'annual' ? 'annual' : 'monthly';

  return (
    <PlanActivationTemplate
      plans={plans}
      initialPlanId={params.plan}
      initialCycle={cycle}
    />
  );
}

export default function ActivatePlanPage(props: ActivatePlanPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface-app flex items-center justify-center text-xs text-ink-muted">
          Cargando planes...
        </div>
      }
    >
      <ActivatePlanContent {...props} />
    </Suspense>
  );
}
