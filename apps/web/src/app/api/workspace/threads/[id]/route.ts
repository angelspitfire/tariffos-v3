import { prisma } from '@tariffos/database';
import {
  canSealDossier,
  normalizeAgencyRole,
  type ProcessActivityAction,
  type ProcessActivityEvent,
} from '@tariffos/shared-types';
import { resolveCloudTenantContext } from '@/lib/agent/cloud-session';
import {
  mapSessionRowToWorkspaceThread,
  MAX_PROCESS_EVENTS,
  parseSessionMeta,
  ThreadPatchSchema,
} from '@/lib/workspace/thread-api-helpers';

function resolvePatchAction(patch: {
  operationalStatus?: string;
  assignedToUserId?: string | null;
  status?: string;
}): ProcessActivityAction | null {
  if (patch.operationalStatus === 'approved') return 'approved';
  if (patch.operationalStatus === 'in_review') return 'review_requested';
  if (patch.status === 'archived' || patch.operationalStatus === 'archived') return 'archived';
  if (patch.assignedToUserId) return 'assigned';
  return null;
}

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

  const patch = parsed.data;
  if (patch.operationalStatus === 'approved') {
    const role = normalizeAgencyRole(auth.context.role);
    if (!canSealDossier(role, patch.workflowMode ?? 'agent_decides')) {
      return Response.json(
        { error: 'Analysts cannot seal dossiers when always_review mode is active.' },
        { status: 403 },
      );
    }
  }

  const existing = await prisma.classificationSession.findUnique({
    where: { id },
    select: { id: true, tenantId: true, description: true },
  });
  if (!existing) return Response.json({ error: 'Session not found' }, { status: 404 });
  if (existing.tenantId !== auth.context.tenantId) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const existingMeta = parseSessionMeta(existing.description);
  const action = resolvePatchAction(patch);
  const nextEvents: ProcessActivityEvent[] = [...(existingMeta.events ?? [])];
  if (action) {
    nextEvents.push({
      id: `evt-${Date.now()}`,
      action,
      actorName: patch.actorName ?? auth.context.userEmail?.split('@')[0] ?? 'Operador',
      actorUserId: auth.context.userId,
      ...(patch.targetName ? { targetName: patch.targetName } : {}),
      ...(patch.note ? { note: patch.note } : {}),
      createdAt: new Date().toISOString(),
    });
  }
  const boundedEvents = nextEvents.slice(-MAX_PROCESS_EVENTS);
  const nextStatus = patch.status ?? existingMeta.status;
  const shouldWriteMeta = patch.status !== undefined || Boolean(action);
  const updatedDescription = shouldWriteMeta
    ? JSON.stringify({
        jurisdictionId: existingMeta.jurisdictionId,
        status: nextStatus,
        ...(existingMeta.eveSessionId ? { eveSessionId: existingMeta.eveSessionId } : {}),
        ...(boundedEvents.length > 0 ? { events: boundedEvents } : {}),
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
      ...(patch.status !== undefined
        ? { status: patch.status === 'archived' ? 'ARCHIVED' : 'ACTIVE' }
        : {}),
      ...(updatedDescription !== undefined ? { description: updatedDescription } : {}),
    },
  });

  return Response.json({ ok: true, thread: mapSessionRowToWorkspaceThread(updated, false) });
}
