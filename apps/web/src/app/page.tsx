import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { LandingPageTemplate } from '@/components/funnel/templates/LandingPageTemplate';
import {
  getDefaultLandingCountryFlag,
  isCountrySwitcherFlagEnabled,
} from '@/lib/flags';
import {
  buildLandingAlternates,
  getCountryLandingBySlug,
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
    alternates: buildLandingAlternates(config.canonicalPath),
  };
}

export default async function HomePage() {
  const defaultCountry = await getDefaultLandingCountryFlag();
  const pinnedCountry =
    defaultCountry !== 'global' ? getCountryLandingBySlug(defaultCountry) : null;
  if (pinnedCountry) {
    redirect(pinnedCountry.canonicalPath);
  }

  const [plans, reqHeaders, showCountrySwitcher] = await Promise.all([
    loadPublicPlans(),
    headers(),
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
