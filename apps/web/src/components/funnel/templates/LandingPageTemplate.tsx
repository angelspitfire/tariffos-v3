import { SAAS_PLANS, type SubscriptionPlanConfig } from '@tariffos/shared-types';
import {
  GLOBAL_LANDING_CONFIG,
  type LandingEditionConfig,
} from '@/lib/funnel/country-landings';
import { CometSectionDivider } from '../atoms/CometSectionDivider';
import { ScrollReveal } from '../atoms/ScrollReveal';
import { GeoCountrySuggestionBanner } from '../molecules/GeoCountrySuggestionBanner';
import { PublicMarketingShell } from '../organisms/PublicMarketingShell';
import { LandingHero } from '../organisms/LandingHero';
import { LandingShowcaseCarousel } from '../organisms/LandingShowcaseCarousel';
import { LandingWorkflowSection } from '../organisms/LandingWorkflowSection';
import { PricingSection } from '../organisms/PricingSection';
import { LandingLeadCaptureSection } from '../organisms/LandingLeadCaptureSection';
import { LandingFaqFooter } from '../organisms/LandingFaqFooter';

export interface LandingPageTemplateProps {
  plans?: readonly SubscriptionPlanConfig[];
  config?: LandingEditionConfig;
  detectedCountryCode?: string | null;
}

export function LandingPageTemplate({
  plans = SAAS_PLANS,
  config = GLOBAL_LANDING_CONFIG,
  detectedCountryCode,
}: LandingPageTemplateProps) {
  return (
    <PublicMarketingShell hideFooter activeEditionSlug={config.slug}>
      {config.slug === 'global' ? (
        <GeoCountrySuggestionBanner detectedCountryCode={detectedCountryCode} />
      ) : null}
      <LandingHero config={config} />
      <CometSectionDivider />
      <ScrollReveal>
        <LandingShowcaseCarousel />
      </ScrollReveal>
      <CometSectionDivider />
      <ScrollReveal>
        <LandingWorkflowSection />
      </ScrollReveal>
      <CometSectionDivider />
      <ScrollReveal>
        <PricingSection plans={plans} />
      </ScrollReveal>
      <CometSectionDivider />
      <ScrollReveal>
        <LandingLeadCaptureSection
          defaultCountry={config.countryCode ?? 'VE'}
          landingPath={config.canonicalPath}
        />
      </ScrollReveal>
      <LandingFaqFooter config={config} />
    </PublicMarketingShell>
  );
}
