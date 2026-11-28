import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LandingPageTemplate } from '@/components/funnel/templates/LandingPageTemplate';
import { isCountrySwitcherFlagEnabled } from '@/lib/flags';
import {
  buildLandingAlternates,
  COUNTRY_LANDINGS_BY_SLUG,
  getCountryLandingBySlug,
} from '@/lib/funnel/country-landings';
import { loadPublicPlans } from '@/lib/funnel/public-plans';

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return Object.keys(COUNTRY_LANDINGS_BY_SLUG).map((country) => ({ country }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country } = await params;
  const config = getCountryLandingBySlug(country);
  if (!config) {
    return {};
  }
  return {
    title: config.seoTitle,
    description: config.seoDescription,
    alternates: buildLandingAlternates(config.canonicalPath),
  };
}

export default async function CountryLandingPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const config = getCountryLandingBySlug(country);
  if (!config) {
    notFound();
  }

  const [plans, showCountrySwitcher] = await Promise.all([
    loadPublicPlans(),
    isCountrySwitcherFlagEnabled(),
  ]);
  return (
    <LandingPageTemplate
      plans={plans}
      config={config}
      showCountrySwitcher={showCountrySwitcher}
    />
  );
}
