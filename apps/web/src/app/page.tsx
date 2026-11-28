import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { LandingPageTemplate } from '@/components/funnel/templates/LandingPageTemplate';
import {
  buildLandingAlternates,
  GLOBAL_LANDING_CONFIG,
} from '@/lib/funnel/country-landings';
import { loadPublicPlans } from '@/lib/funnel/public-plans';

export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  return {
    title: GLOBAL_LANDING_CONFIG.seoTitle,
    description: GLOBAL_LANDING_CONFIG.seoDescription,
    alternates: buildLandingAlternates('/'),
  };
}

export default async function HomePage() {
  const [plans, reqHeaders] = await Promise.all([loadPublicPlans(), headers()]);
  const detectedCountryCode = reqHeaders.get('x-vercel-ip-country');

  return (
    <LandingPageTemplate
      plans={plans}
      config={GLOBAL_LANDING_CONFIG}
      detectedCountryCode={detectedCountryCode}
    />
  );
}
