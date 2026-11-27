import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { prisma } from '@tariffos/database';
import type { SubscriptionBillingCycle } from '@tariffos/shared-types';
import { PlanActivationTemplate } from '@/components/funnel/templates/PlanActivationTemplate';
import { loadPublicPlans } from '@/lib/funnel/public-plans';
import { resolveCloudFunnelGateRedirect } from '@/lib/funnel/server-account-gate';
import { isCloudModeEnabled } from '@/lib/runtime-config';
import { getAuthenticatedUser } from '@/lib/supabase/server';

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
  const user = isCloudModeEnabled() ? await getAuthenticatedUser().catch(() => null) : null;
  const membership = user
    ? await prisma.membership
        .findFirst({
          where: { userId: user.id },
          select: { name: true, tenant: { select: { name: true } } },
        })
        .catch(() => null)
    : null;
  const initialPayerEmail = user?.email ?? undefined;
  const metaName = user?.user_metadata?.full_name;
  const initialPayerName =
    membership?.tenant?.name?.trim() ||
    membership?.name?.trim() ||
    (typeof metaName === 'string' && metaName.trim() ? metaName.trim() : undefined);

  const cycle: SubscriptionBillingCycle =
    params.cycle === 'annual' ? 'annual' : 'monthly';

  return (
    <PlanActivationTemplate
      plans={plans}
      initialPlanId={params.plan}
      initialCycle={cycle}
      initialPayerName={initialPayerName}
      initialPayerEmail={initialPayerEmail}
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
