import { Suspense } from 'react';
import type { SubscriptionBillingCycle } from '@tariffos/shared-types';
import { PlanActivationTemplate } from '@/components/funnel/templates/PlanActivationTemplate';

interface ActivatePlanPageProps {
  searchParams: Promise<{
    plan?: string;
    cycle?: string;
  }>;
}

async function ActivatePlanContent({ searchParams }: ActivatePlanPageProps) {
  const params = await searchParams;
  const cycle: SubscriptionBillingCycle =
    params.cycle === 'annual' ? 'annual' : 'monthly';

  return (
    <PlanActivationTemplate
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
