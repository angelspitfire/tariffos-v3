import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { LandingPageTemplate } from '@/components/funnel/templates/LandingPageTemplate';
import {
  getDefaultLandingCountryFlag,
  isCountrySwitcherFlagEnabled,
} from '@/lib/flags';
import {
  buildLandingAlternates,
  resolveRootLandingConfig,
} from '@/lib/funnel/country-landings';
import { loadPublicPlans } from '@/lib/funnel/public-plans';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const defaultCountry = await getDefaultLandingCountryFlag();
  const config = resolveRootLandingConfig(defaultCountry);
  return {
    title: config.seoTitle,
    description: config.seoDescription,
    alternates: buildLandingAlternates('/'),
  };
}

export default async function HomePage() {
  const [plans, reqHeaders, defaultCountry, showCountrySwitcher] = await Promise.all([
    loadPublicPlans(),
    headers(),
    getDefaultLandingCountryFlag(),
    isCountrySwitcherFlagEnabled(),
  ]);
  const config = resolveRootLandingConfig(defaultCountry);
  const detectedCountryCode = reqHeaders.get('x-vercel-ip-country');

  return (
    <LandingPageTemplate
      plans={plans}
      config={config}
      detectedCountryCode={detectedCountryCode}
      showCountrySwitcher={showCountrySwitcher}
    />
  );
}
