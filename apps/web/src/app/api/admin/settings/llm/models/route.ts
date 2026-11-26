import { requireAdmin } from '@/lib/admin/http-helpers';
import {
  fetchOpenRouterQuota,
  fetchProviderModels,
  type InspectableLlmProvider,
} from '@/lib/admin/llm-provider-inspector';

const VALID_PROVIDERS = new Set<InspectableLlmProvider>(['openrouter', 'nvidia', 'google']);

function parseProvider(raw: string | null): InspectableLlmProvider {
  const normalized = (raw ?? 'openrouter').trim().toLowerCase();
  if (VALID_PROVIDERS.has(normalized as InspectableLlmProvider)) {
    return normalized as InspectableLlmProvider;
  }
  return 'openrouter';
}

export async function GET(request: Request): Promise<Response> {
  const guard = await requireAdmin('settings:manage');
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(request.url);
  const provider = parseProvider(searchParams.get('provider'));
  const freeOnly = searchParams.get('free') === 'true';
  const toolsOnly = searchParams.get('tools') === 'true';
  const includeQuota = searchParams.get('quota') === 'true' || provider === 'openrouter';
  const search = searchParams.get('search') ?? undefined;

  try {
    const [models, quota] = await Promise.all([
      fetchProviderModels({ provider, freeOnly, toolsOnly, search }),
      includeQuota && provider === 'openrouter' ? fetchOpenRouterQuota() : Promise.resolve(null),
    ]);

    return Response.json(
      {
        provider,
        total: models.length,
        freeCount: models.filter((m) => m.isFree).length,
        models,
        quota,
      },
      { status: 200 },
    );
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Failed to inspect provider models' },
      { status: 502 },
    );
  }
}
