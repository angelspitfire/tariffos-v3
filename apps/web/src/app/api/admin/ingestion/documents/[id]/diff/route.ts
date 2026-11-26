import { computeDraftDiff, prisma } from '@tariffos/database';
import { requireAdmin } from '@/lib/admin/http-helpers';
import { computeOfflineDraftDiff } from '@/lib/admin/ingestion-offline-store';
import { isCloudModeEnabled } from '@/lib/runtime-config';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const guard = await requireAdmin('ingestion:read');
  if (!guard.ok) return guard.response;

  const { id } = await context.params;

  try {
    if (!isCloudModeEnabled()) {
      return Response.json(
        { mode: 'offline', diff: computeOfflineDraftDiff(id) },
        { status: 200 },
      );
    }

    const diff = await computeDraftDiff(prisma, id);
    return Response.json({ mode: 'cloud', diff }, { status: 200 });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Draft not found' },
      { status: 404 },
    );
  }
}
