import { SAAS_PLANS, type SubscriptionPlanConfig } from '@tariffos/shared-types';
import { PublicMarketingShell } from '../organisms/PublicMarketingShell';
import { LandingHero } from '../organisms/LandingHero';
import { LandingShowcaseCarousel } from '../organisms/LandingShowcaseCarousel';
import { LandingWorkflowSection } from '../organisms/LandingWorkflowSection';
import { PricingSection } from '../organisms/PricingSection';
import { LandingLeadCaptureSection } from '../organisms/LandingLeadCaptureSection';
import { LandingFaqFooter } from '../organisms/LandingFaqFooter';

export function LandingPageTemplate({
  plans = SAAS_PLANS,
}: {
  plans?: readonly SubscriptionPlanConfig[];
}) {
  return (
    <PublicMarketingShell hideFooter>
      <LandingHero />
      <LandingShowcaseCarousel />
      <LandingWorkflowSection />
      <PricingSection plans={plans} />
      <LandingLeadCaptureSection />
      <LandingFaqFooter />
    </PublicMarketingShell>
  );
}
