import { prisma } from '@tariffos/database';
import {
  aggregateModelStats,
  createOfflineDecisionArtifacts,
  mapArtifactToSummary,
} from '@/lib/admin/ai-quality-mapper';
import { requireAdmin } from '@/lib/admin/http-helpers';
import { isCloudModeEnabled } from '@/lib/runtime-config';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

function parseBoundedLimit(raw: string | null): number {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_LIMIT;
  return Math.min(Math.floor(parsed), MAX_LIMIT);
}

export async function GET(request: Request): Promise<Response> {
  const guard = await requireAdmin('ai_quality:read');
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get('tenantId')?.trim() || '';
  const modelFilter = searchParams.get('model')?.trim().toLowerCase() || '';
  const q = searchParams.get('q')?.trim().toLowerCase() || '';
  const maxConfidenceRaw = searchParams.get('maxConfidence');
  const maxConfidence =
    maxConfidenceRaw && Number.isFinite(Number(maxConfidenceRaw))
      ? Number(maxConfidenceRaw)
      : null;
  const limit = parseBoundedLimit(searchParams.get('limit'));

  const summaries = !isCloudModeEnabled()
    ? createOfflineDecisionArtifacts()
    : (
        await prisma.decisionArtifact.findMany({
          where: tenantId ? { tenantId } : undefined,
          orderBy: { createdAt: 'desc' },
          take: Math.max(limit * 2, 100),
          include: { tenant: { select: { name: true } } },
        })
      ).map(mapArtifactToSummary);

  const filtered = summaries.filter((item) => {
    if (tenantId && item.tenantId !== tenantId) return false;
    if (modelFilter && !item.modelUsed.toLowerCase().includes(modelFilter)) return false;
    if (maxConfidence !== null && item.confidencePct > maxConfidence) return false;
    if (q) {
      const hay = `${item.hsCode} ${item.query} ${item.tenantName} ${item.modelUsed}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const modelStats = aggregateModelStats(filtered);
  return Response.json(
    {
      artifacts: filtered.slice(0, limit),
      total: filtered.length,
      modelStats,
    },
    { status: 200 },
  );
}
