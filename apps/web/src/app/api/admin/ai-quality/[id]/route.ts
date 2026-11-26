import { prisma } from '@tariffos/database';
import {
  createOfflineDecisionArtifacts,
  mapArtifactToDetail,
} from '@/lib/admin/ai-quality-mapper';
import { requireAdmin } from '@/lib/admin/http-helpers';
import { isCloudModeEnabled } from '@/lib/runtime-config';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const guard = await requireAdmin('ai_quality:read');
  if (!guard.ok) return guard.response;

  const { id } = await context.params;

  if (!isCloudModeEnabled()) {
    const found = createOfflineDecisionArtifacts().find((a) => a.id === id);
    if (!found) return Response.json({ error: 'Artifact not found' }, { status: 404 });
    return Response.json({ artifact: found }, { status: 200 });
  }

  const row = await prisma.decisionArtifact.findUnique({
    where: { id },
    include: { tenant: { select: { name: true } } },
  });
  if (!row) {
    return Response.json({ error: 'Artifact not found' }, { status: 404 });
  }

  return Response.json({ artifact: mapArtifactToDetail(row) }, { status: 200 });
}
