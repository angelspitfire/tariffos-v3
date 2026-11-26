import { LandingPageTemplate } from '@/components/funnel/templates/LandingPageTemplate';
import { loadPublicPlans } from '@/lib/funnel/public-plans';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const plans = await loadPublicPlans();
  return <LandingPageTemplate plans={plans} />;
}
