import { getLatestExchangeRates } from '@/lib/bcv/sync-service';

export async function GET(): Promise<Response> {
  const rates = await getLatestExchangeRates();
  return Response.json(
    {
      rates,
      fetchedAt: new Date().toISOString(),
    },
    { status: 200 },
  );
}
