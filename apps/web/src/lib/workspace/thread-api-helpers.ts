import type { Prisma } from '@tariffos/database';
import {
  ApprovalWorkflowModeSchema,
  OperationalStatusSchema,
  ProcessActivityEventSchema,
  ProcessItemProgressSchema,
  ProcessKindSchema,
  ProcessScopeFilterSchema,
  type ProcessActivityEvent,
} from '@tariffos/shared-types';
import { z } from 'zod';
import type { WorkspaceMessage, WorkspaceThread } from '@/lib/workspace/types';

export const MAX_PROCESS_EVENTS = 20;

export const ThreadPayloadSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  jurisdictionId: z.string().min(1).default('ve-seniat'),
  status: z.enum(['regular', 'archived']).default('regular'),
  eveSessionId: z.string().trim().min(1).optional(),
  processKind: ProcessKindSchema.optional(),
  operationalStatus: OperationalStatusSchema.optional(),
  clientRef: z.string().trim().max(120).nullable().optional(),
  primaryHsCode: z.string().trim().max(24).nullable().optional(),
  itemProgress: ProcessItemProgressSchema.nullable().optional(),
  assignedToUserId: z.string().trim().min(1).nullable().optional(),
  messages: z.array(z.record(z.string(), z.unknown())),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ThreadPatchSchema = z.object({
  title: z.string().trim().min(1).max(160).optional(),
  status: z.enum(['regular', 'archived']).optional(),
  processKind: ProcessKindSchema.optional(),
  operationalStatus: OperationalStatusSchema.optional(),
  clientRef: z.string().trim().max(120).nullable().optional(),
  assignedToUserId: z.string().trim().min(1).nullable().optional(),
  workflowMode: ApprovalWorkflowModeSchema.optional(),
  note: z.string().trim().max(300).optional(),
  actorName: z.string().trim().max(120).optional(),
  targetName: z.string().trim().max(120).optional(),
});

export function parseSessionMeta(description: string | null): {
  jurisdictionId: string;
  status: 'regular' | 'archived';
  eveSessionId?: string;
  events?: ProcessActivityEvent[];
} {
  if (!description) return { jurisdictionId: 've-seniat', status: 'regular' };
  try {
    const parsed = JSON.parse(description) as {
      jurisdictionId?: string;
      status?: string;
      eveSessionId?: string;
      events?: unknown;
    };
    const eventsParsed = Array.isArray(parsed.events)
      ? parsed.events
          .map((item) => ProcessActivityEventSchema.safeParse(item))
          .filter((r) => r.success)
          .map((r) => r.data)
      : undefined;
    return {
      jurisdictionId: parsed.jurisdictionId || 've-seniat',
      status: parsed.status === 'archived' ? 'archived' : 'regular',
      ...(typeof parsed.eveSessionId === 'string' && parsed.eveSessionId.trim()
        ? { eveSessionId: parsed.eveSessionId.trim() }
        : {}),
      ...(eventsParsed && eventsParsed.length > 0 ? { events: eventsParsed } : {}),
    };
  } catch {
    return { jurisdictionId: 've-seniat', status: 'regular' };
  }
}

export function parseChatMessage(
  row: { id: string; role: string; content: string; createdAt: Date },
  fallbackJurisdiction: string,
): WorkspaceMessage {
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

export interface SessionRowLike {
  id: string;
  title: string;
  description: string | null;
  processKind?: string | null;
  operationalStatus?: string | null;
  clientRef?: string | null;
  primaryHsCode?: string | null;
  itemProgressJson?: unknown;
  createdByUserId?: string | null;
  assignedToUserId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  messages?: Array<{ id: string; role: string; content: string; createdAt: Date }>;
}

export function mapSessionRowToWorkspaceThread(
  row: SessionRowLike,
  messagesLoaded: boolean,
): WorkspaceThread {
  const meta = parseSessionMeta(row.description);
  const parsedKind = ProcessKindSchema.safeParse(row.processKind);
  const parsedStatus = OperationalStatusSchema.safeParse(row.operationalStatus);
  const parsedProgress = ProcessItemProgressSchema.safeParse(row.itemProgressJson);

  return {
    id: row.id,
    title: row.title,
    jurisdictionId: meta.jurisdictionId,
    status: meta.status,
    ...(meta.eveSessionId ? { eveSessionId: meta.eveSessionId } : {}),
    processKind: parsedKind.success ? parsedKind.data : 'single_ruling',
    operationalStatus: parsedStatus.success ? parsedStatus.data : 'processing',
    clientRef: row.clientRef ?? null,
    primaryHsCode: row.primaryHsCode ?? null,
    itemProgress: parsedProgress.success ? parsedProgress.data : null,
    createdByUserId: row.createdByUserId ?? null,
    assignedToUserId: row.assignedToUserId ?? null,
    ...(meta.events ? { processEvents: meta.events } : {}),
    messagesLoaded,
    messages:
      messagesLoaded && Array.isArray(row.messages)
        ? row.messages.map((m) => parseChatMessage(m, meta.jurisdictionId))
        : [],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function buildSummaryQuerySpec(
  params: URLSearchParams,
  tenantId: string,
  userId: string,
): { where: Prisma.ClassificationSessionWhereInput; limit: number; cursor: string | null } {
  const rawLimit = Number(params.get('limit') ?? 30);
  const limit = Number.isFinite(rawLimit) ? Math.min(60, Math.max(1, Math.trunc(rawLimit))) : 30;
  const cursor = params.get('cursor')?.trim() || null;
  const q = params.get('q')?.trim() || '';
  const statusParam = OperationalStatusSchema.safeParse(params.get('status'));
  const kindParam = ProcessKindSchema.safeParse(params.get('kind'));
  const scopeParam = ProcessScopeFilterSchema.safeParse(params.get('scope'));
  const scope = scopeParam.success ? scopeParam.data : 'agency';

  const where: Prisma.ClassificationSessionWhereInput = {
    tenantId,
    ...(statusParam.success ? { operationalStatus: statusParam.data } : {}),
    ...(kindParam.success ? { processKind: kindParam.data } : {}),
    ...(scope === 'mine' ? { createdByUserId: userId } : {}),
    ...(scope === 'assigned' ? { assignedToUserId: userId } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { primaryHsCode: { contains: q, mode: 'insensitive' } },
            { clientRef: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  return { where, limit, cursor };
}
