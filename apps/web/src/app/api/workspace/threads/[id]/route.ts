import { prisma } from '@tariffos/database';
import { resolveCloudTenantContext } from '@/lib/agent/cloud-session';
import {
  mapSessionRowToWorkspaceThread,
  parseSessionMeta,
  ThreadPatchSchema,
} from '@/lib/workspace/thread-api-helpers';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const auth = await resolveCloudTenantContext();
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

  const { id } = await context.params;
  const session = await prisma.classificationSession.findUnique({
    where: { id },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  });

  if (!session) return Response.json({ error: 'Session not found' }, { status: 404 });
  if (session.tenantId !== auth.context.tenantId) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  return Response.json({ thread: mapSessionRowToWorkspaceThread(session, true) });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const auth = await resolveCloudTenantContext();
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

  const { id } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const parsed = ThreadPatchSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 400 });
  }

  const existing = await prisma.classificationSession.findUnique({
    where: { id },
    select: { id: true, tenantId: true, description: true },
  });
  if (!existing) return Response.json({ error: 'Session not found' }, { status: 404 });
  if (existing.tenantId !== auth.context.tenantId) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const patch = parsed.data;
  const nextStatus = patch.status;
  const existingMeta = parseSessionMeta(existing.description);
  const updatedDescription =
    nextStatus !== undefined
      ? JSON.stringify({
          jurisdictionId: existingMeta.jurisdictionId,
          status: nextStatus,
          ...(existingMeta.eveSessionId ? { eveSessionId: existingMeta.eveSessionId } : {}),
        })
      : undefined;

  const updated = await prisma.classificationSession.update({
    where: { id },
    data: {
      ...(patch.title !== undefined ? { title: patch.title } : {}),
      ...(patch.processKind !== undefined ? { processKind: patch.processKind } : {}),
      ...(patch.operationalStatus !== undefined
        ? { operationalStatus: patch.operationalStatus }
        : {}),
      ...(patch.clientRef !== undefined ? { clientRef: patch.clientRef } : {}),
      ...(patch.assignedToUserId !== undefined
        ? { assignedToUserId: patch.assignedToUserId }
        : {}),
      ...(nextStatus !== undefined
        ? {
            status: nextStatus === 'archived' ? 'ARCHIVED' : 'ACTIVE',
            description: updatedDescription,
          }
        : {}),
    },
  });

  return Response.json({ ok: true, thread: mapSessionRowToWorkspaceThread(updated, false) });
}
