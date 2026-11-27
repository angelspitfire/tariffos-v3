import { getCachedBcvRates } from '@/lib/bcv/cached-rates';

export async function GET(request: Request): Promise<Response> {
  const refreshParam = new URL(request.url).searchParams.get('refresh');
  const forceRefresh = refreshParam === '1' || refreshParam === 'true';
  const result = await getCachedBcvRates({ forceRefresh });

  return Response.json(result, {
    status: 200,
    headers: {
      'Cache-Control': forceRefresh
        ? 'no-store'
        : 'public, s-maxage=300, stale-while-revalidate=900',
    },
  });
}
