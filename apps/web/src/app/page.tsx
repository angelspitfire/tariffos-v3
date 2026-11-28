import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { LandingPageTemplate } from '@/components/funnel/templates/LandingPageTemplate';
import {
  buildLandingAlternates,
  resolveRootLandingConfig,
} from '@/lib/funnel/country-landings';
import { loadPublicPlans } from '@/lib/funnel/public-plans';
import { isCountrySwitcherEnabled } from '@/lib/runtime-config';

export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  const config = resolveRootLandingConfig();
  return {
    title: config.seoTitle,
    description: config.seoDescription,
    alternates: buildLandingAlternates('/'),
  };
}

export default async function HomePage() {
  const [plans, reqHeaders] = await Promise.all([loadPublicPlans(), headers()]);
  const config = resolveRootLandingConfig();
  const showCountrySwitcher = isCountrySwitcherEnabled();
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
