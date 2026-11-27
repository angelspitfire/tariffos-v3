import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import type { SubscriptionBillingCycle } from '@tariffos/shared-types';
import { BrandMark } from '@/components/funnel/atoms/BrandMark';
import { ExpressOnboardingCard } from '@/components/funnel/organisms/ExpressOnboardingCard';
import { loadPublicPlans } from '@/lib/funnel/public-plans';
import { resolveCloudFunnelGateRedirect } from '@/lib/funnel/server-account-gate';
import { isCloudModeEnabled } from '@/lib/runtime-config';
import { getAuthenticatedUser } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

interface OnboardingPageProps {
  searchParams: Promise<{
    plan?: string;
    cycle?: string;
  }>;
}

async function OnboardingContent({ searchParams }: OnboardingPageProps) {
  const params = await searchParams;
  const redirectTarget = await resolveCloudFunnelGateRedirect({
    route: 'onboarding',
    hasFunnelPlanParam: Boolean(params.plan),
    plan: params.plan,
    cycle: params.cycle,
  });
  if (redirectTarget) {
    redirect(redirectTarget);
  }
  const plans = await loadPublicPlans();
  const user = isCloudModeEnabled() ? await getAuthenticatedUser().catch(() => null) : null;
  const metaName = user?.user_metadata?.full_name;
  const initialFullName = typeof metaName === 'string' && metaName.trim() ? metaName.trim() : undefined;
  const cycle: SubscriptionBillingCycle | undefined =
    params.cycle === 'annual' || params.cycle === 'monthly' ? params.cycle : undefined;

  return (
    <ExpressOnboardingCard
      plans={plans}
      userId={user?.id}
      preselectedPlanId={params.plan}
      preselectedCycle={cycle}
      initialFullName={initialFullName}
    />
  );
}

export default function OnboardingPage(props: OnboardingPageProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface-app px-4 py-10">
      <div className="w-full max-w-3xl space-y-6">
        <div className="flex justify-center">
          <BrandMark />
        </div>
        <Suspense
          fallback={
            <div className="flex h-64 items-center justify-center rounded-2xl border border-border-subtle bg-surface-panel text-xs text-ink-muted">
              Preparando configuración...
            </div>
          }
        >
          <OnboardingContent {...props} />
        </Suspense>
      </div>
    </main>
  );
}
