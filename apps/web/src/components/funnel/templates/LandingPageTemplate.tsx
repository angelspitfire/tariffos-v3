import { SAAS_PLANS } from '@tariffos/shared-types';
import { PublicMarketingShell } from '../organisms/PublicMarketingShell';
import { LandingHero } from '../organisms/LandingHero';
import { LandingShowcaseCarousel } from '../organisms/LandingShowcaseCarousel';
import { LandingWorkflowSection } from '../organisms/LandingWorkflowSection';
import { PricingSection } from '../organisms/PricingSection';
import { LandingFaqFooter } from '../organisms/LandingFaqFooter';

export function LandingPageTemplate() {
  return (
    <PublicMarketingShell hideFooter>
      <LandingHero />
      <LandingShowcaseCarousel />
      <LandingWorkflowSection />
      <PricingSection plans={SAAS_PLANS} />
      <LandingFaqFooter />
    </PublicMarketingShell>
  );
}
