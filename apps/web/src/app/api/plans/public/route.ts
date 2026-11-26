import { loadPublicPlans } from '@/lib/funnel/public-plans';

export async function GET(): Promise<Response> {
  const plans = await loadPublicPlans();
  return Response.json({ plans }, { status: 200 });
}
