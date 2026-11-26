import { Suspense } from 'react';
import type { SubscriptionBillingCycle } from '@tariffos/shared-types';
import { BrandMark } from '@/components/funnel/atoms/BrandMark';
import { ExpressOnboardingCard } from '@/components/funnel/organisms/ExpressOnboardingCard';

interface OnboardingPageProps {
  searchParams: Promise<{
    plan?: string;
    cycle?: string;
  }>;
}

async function OnboardingContent({ searchParams }: OnboardingPageProps) {
  const params = await searchParams;
  const cycle: SubscriptionBillingCycle | undefined =
    params.cycle === 'annual' || params.cycle === 'monthly' ? params.cycle : undefined;

  return (
    <ExpressOnboardingCard
      preselectedPlanId={params.plan}
      preselectedCycle={cycle}
    />
  );
}

export default function OnboardingPage(props: OnboardingPageProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface-app px-4 py-10">
      <div className="w-full max-w-lg space-y-6">
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
