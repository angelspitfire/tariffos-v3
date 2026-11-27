import { prisma } from '@tariffos/database';
import { z } from 'zod';
import { resolveCloudTenantContext } from '@/lib/agent/cloud-session';
import type { WorkspaceMessage, WorkspaceThread } from '@/lib/workspace/types';

const ThreadPayloadSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  jurisdictionId: z.string().min(1).default('ve-seniat'),
  status: z.enum(['regular', 'archived']).default('regular'),
  eveSessionId: z.string().trim().min(1).optional(),
  messages: z.array(z.record(z.string(), z.unknown())),
  createdAt: z.string(),
  updatedAt: z.string(),
});

function parseSessionMeta(description: string | null): {
  jurisdictionId: string;
  status: 'regular' | 'archived';
  eveSessionId?: string;
} {
  if (!description) return { jurisdictionId: 've-seniat', status: 'regular' };
  try {
    const parsed = JSON.parse(description) as {
      jurisdictionId?: string;
      status?: string;
      eveSessionId?: string;
    };
    return {
      jurisdictionId: parsed.jurisdictionId || 've-seniat',
      status: parsed.status === 'archived' ? 'archived' : 'regular',
      ...(typeof parsed.eveSessionId === 'string' && parsed.eveSessionId.trim()
        ? { eveSessionId: parsed.eveSessionId.trim() }
        : {}),
    };
  } catch {
    return { jurisdictionId: 've-seniat', status: 'regular' };
  }
}

function parseChatMessage(row: {
  id: string;
  role: string;
  content: string;
  createdAt: Date;
}, fallbackJurisdiction: string): WorkspaceMessage {
  try {
    const parsed = JSON.parse(row.content) as WorkspaceMessage;
    if (parsed && parsed.id && parsed.role) return parsed;
  } catch {
    // Plain-text legacy message row
  }
  return {
    id: row.id,
    role: row.role === 'assistant' ? 'assistant' : 'user',
    text: row.content,
    createdAt: row.createdAt.toISOString(),
    jurisdictionId: fallbackJurisdiction,
  };
}

export async function GET(): Promise<Response> {
  const auth = await resolveCloudTenantContext();
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

  const sessions = await prisma.classificationSession.findMany({
    where: { tenantId: auth.context.tenantId },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
    orderBy: { updatedAt: 'desc' },
    take: 25,
  });

  const threads: WorkspaceThread[] = sessions.map((s) => {
    const meta = parseSessionMeta(s.description);
    return {
      id: s.id,
      title: s.title,
      jurisdictionId: meta.jurisdictionId,
      status: meta.status,
      ...(meta.eveSessionId ? { eveSessionId: meta.eveSessionId } : {}),
      messages: s.messages.map((m) => parseChatMessage(m, meta.jurisdictionId)),
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    };
  });

  return Response.json({ threads });
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
    select: { tenantId: true },
  });
  if (existing && existing.tenantId !== tenantId) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const sessionMeta = JSON.stringify({
    jurisdictionId: thread.jurisdictionId,
    status: thread.status,
    ...(thread.eveSessionId ? { eveSessionId: thread.eveSessionId } : {}),
  });

  await prisma.$transaction(async (tx) => {
    await tx.classificationSession.upsert({
      where: { id: thread.id },
      update: {
        title: thread.title,
        description: sessionMeta,
        status: thread.status === 'archived' ? 'ARCHIVED' : 'ACTIVE',
      },
      create: {
        id: thread.id,
        tenantId,
        title: thread.title,
        description: sessionMeta,
        status: thread.status === 'archived' ? 'ARCHIVED' : 'ACTIVE',
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

  return Response.json({ ok: true, id: thread.id });
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
