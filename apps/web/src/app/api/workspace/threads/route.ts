import { classifyThreadIntent, defaultProvider } from '@tariffos/agent';
import { prisma, type Prisma } from '@tariffos/database';
import {
  ProcessKindSchema,
  type ProcessKind,
  type ThreadTriageDecision,
} from '@tariffos/shared-types';
import { resolveCloudTenantContext } from '@/lib/agent/cloud-session';
import {
  buildSummaryQuerySpec,
  mapSessionRowToWorkspaceThread,
  parseSessionMeta,
  ThreadPayloadSchema,
} from '@/lib/workspace/thread-api-helpers';
import {
  buildTriageInputFromRawMessages,
  resolveEffectiveOperationalStatus,
} from '@/lib/workspace/thread-api-triage';

const DEFAULT_FULL_TAKE = 50;

export async function GET(request: Request): Promise<Response> {
  const auth = await resolveCloudTenantContext();
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

  const params = new URL(request.url).searchParams;
  if (params.get('view') === 'summary') {
    const { where, limit, cursor } = buildSummaryQuerySpec(
      params,
      auth.context.tenantId,
      auth.context.userId,
    );
    const [rows, grouped] = await Promise.all([
      prisma.classificationSession.findMany({
        where,
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      }),
      prisma.classificationSession.groupBy({
        by: ['operationalStatus'],
        where: { tenantId: auth.context.tenantId, processKind: { not: 'quick_lookup' } },
        _count: { _all: true },
      }),
    ]);

    const hasMore = rows.length > limit;
    const pageRows = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? (pageRows[pageRows.length - 1]?.id ?? null) : null;
    const counts: Record<string, number> = {
      needs_input: 0,
      processing: 0,
      in_review: 0,
      approved: 0,
      archived: 0,
    };
    for (const g of grouped) counts[g.operationalStatus] = g._count._all;

    return Response.json({
      threads: pageRows.map((row) => mapSessionRowToWorkspaceThread(row, false)),
      nextCursor,
      counts,
    });
  }

  const sessions = await prisma.classificationSession.findMany({
    where: { tenantId: auth.context.tenantId },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
    orderBy: { updatedAt: 'desc' },
    take: DEFAULT_FULL_TAKE,
  });

  return Response.json({
    threads: sessions.map((s) => mapSessionRowToWorkspaceThread(s, true)),
  });
}

export async function PUT(request: Request): Promise<Response> {
  const auth = await resolveCloudTenantContext();
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const parsed = ThreadPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 400 });
  }

  const thread = parsed.data;
  const tenantId = auth.context.tenantId;
  const existing = await prisma.classificationSession.findUnique({
    where: { id: thread.id },
    select: { tenantId: true, processKind: true, clientRef: true, description: true },
  });
  if (existing && existing.tenantId !== tenantId) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const existingKind = ProcessKindSchema.safeParse(existing?.processKind);
  const previousKind: ProcessKind | undefined = existingKind.success ? existingKind.data : undefined;
  const { triageInput, primaryHsCode: derivedHs, itemProgress: derivedProgress } =
    buildTriageInputFromRawMessages(thread.messages, previousKind);

  let triage: ThreadTriageDecision | null = null;
  if (!thread.processKind) {
    triage = await classifyThreadIntent(triageInput, defaultProvider());
  }

  const effectiveKind = thread.processKind ?? triage?.processKind ?? previousKind ?? 'single_ruling';
  const effectiveStatus = resolveEffectiveOperationalStatus(
    thread.operationalStatus,
    triage,
    thread.status === 'archived',
  );
  const existingMeta = parseSessionMeta(existing?.description ?? null);
  const sessionMeta = JSON.stringify({
    jurisdictionId: thread.jurisdictionId,
    status: thread.status,
    ...(thread.eveSessionId ?? existingMeta.eveSessionId
      ? { eveSessionId: thread.eveSessionId ?? existingMeta.eveSessionId }
      : {}),
  });
  const effectiveClientRef =
    thread.clientRef !== undefined ? thread.clientRef : (existing?.clientRef ?? null);
  const effectiveHsCode = thread.primaryHsCode !== undefined ? thread.primaryHsCode : derivedHs;
  const effectiveProgress = (
    thread.itemProgress !== undefined ? thread.itemProgress : derivedProgress
  ) as Prisma.InputJsonValue | undefined;

  await prisma.$transaction(async (tx) => {
    await tx.classificationSession.upsert({
      where: { id: thread.id },
      update: {
        title: thread.title,
        description: sessionMeta,
        status: thread.status === 'archived' ? 'ARCHIVED' : 'ACTIVE',
        processKind: effectiveKind,
        operationalStatus: effectiveStatus,
        ...(effectiveClientRef !== undefined ? { clientRef: effectiveClientRef } : {}),
        ...(effectiveHsCode !== undefined ? { primaryHsCode: effectiveHsCode } : {}),
        ...(effectiveProgress !== undefined ? { itemProgressJson: effectiveProgress } : {}),
        ...(thread.assignedToUserId !== undefined ? { assignedToUserId: thread.assignedToUserId } : {}),
      },
      create: {
        id: thread.id,
        tenantId,
        title: thread.title,
        description: sessionMeta,
        status: thread.status === 'archived' ? 'ARCHIVED' : 'ACTIVE',
        processKind: effectiveKind,
        operationalStatus: effectiveStatus,
        clientRef: effectiveClientRef,
        primaryHsCode: effectiveHsCode,
        ...(effectiveProgress !== undefined ? { itemProgressJson: effectiveProgress } : {}),
        createdByUserId: auth.context.userId,
        assignedToUserId: thread.assignedToUserId ?? null,
      },
    });

    await tx.chatMessage.deleteMany({ where: { sessionId: thread.id, tenantId } });
    if (thread.messages.length > 0) {
      await tx.chatMessage.createMany({
        data: thread.messages.map((m, idx) => ({
          id: `${thread.id}_msg_${typeof m.id === 'string' ? m.id : idx}`,
          sessionId: thread.id,
          tenantId,
          role: typeof m.role === 'string' ? m.role : 'user',
          content: JSON.stringify(m),
        })),
      });
    }
  });

  return Response.json({ ok: true, id: thread.id, ...(triage ? { triage } : {}) });
}

export async function DELETE(request: Request): Promise<Response> {
  const auth = await resolveCloudTenantContext();
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

  const id = new URL(request.url).searchParams.get('id')?.trim();
  if (!id) return Response.json({ error: 'Missing id parameter' }, { status: 400 });

  await prisma.classificationSession.deleteMany({
    where: { id, tenantId: auth.context.tenantId },
  });
  return Response.json({ ok: true });
}
