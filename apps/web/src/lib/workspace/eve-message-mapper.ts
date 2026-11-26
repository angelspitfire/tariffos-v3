import {
  A2UIEnvelopeSchema,
  AgentReviewTriggerSchema,
  type A2UIEnvelope,
} from '@tariffos/shared-types';
import type { WorkspaceMessage } from './types';

interface UnknownToolCallPart {
  type: 'tool-call';
  toolCallId?: string;
  toolName?: string;
  args?: unknown;
  result?: unknown;
  isError?: boolean;
}

const TOOL_LABELS: Record<string, { running: string; done: string }> = {
  classify_item: {
    running: 'Clasificando mercancía (RGI 1→6)…',
    done: 'Clasificación completada',
  },
  web_search: {
    running: 'Buscando especificaciones en web (Parallel Fast)…',
    done: 'Especificaciones web consultadas (Parallel Fast)',
  },
  search_tariff: {
    running: 'Consultando Arancel de Aduanas…',
    done: 'Arancel consultado',
  },
  verify_hs_code: {
    running: 'Verificando código HS en base oficial…',
    done: 'Código HS verificado',
  },
  calculate_duties: {
    running: 'Calculando tributos y valor CIF…',
    done: 'Tributos recalculados',
  },
  request_dossier_review: {
    running: 'Marcando dictamen para revisión…',
    done: 'Enviado a revisión técnica',
  },
};

function toRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

function asToolCallPart(part: unknown): UnknownToolCallPart | null {
  const record = toRecord(part);
  if (!record || record.type !== 'tool-call') return null;
  return record as unknown as UnknownToolCallPart;
}

/** Returns a concise Spanish progress or completion label for an Eve tool call. */
export function getEveToolLabel(toolName: string, completed: boolean): string {
  const known = TOOL_LABELS[toolName];
  if (known) return completed ? known.done : known.running;
  return completed ? `Herramienta ${toolName} completada` : `Ejecutando ${toolName}…`;
}

/** Extracts plain visible text from assistant-ui message content parts. */
export function extractMessagePlainText(content: readonly unknown[]): string {
  const chunks: string[] = [];
  for (const part of content) {
    const record = toRecord(part);
    if (record?.type === 'text' && typeof record.text === 'string') {
      chunks.push(record.text);
    }
  }
  return chunks.join('\n').trim();
}

function patchEnvelopeWithDossierReview(
  envelope: A2UIEnvelope,
  content: readonly unknown[],
): A2UIEnvelope {
  let reviewResult: Record<string, unknown> | null = null;
  for (const part of content) {
    const tc = asToolCallPart(part);
    if (tc?.toolName === 'request_dossier_review' && !tc.isError) {
      const rec = toRecord(tc.result);
      if (rec?.reviewStatus === 'in_review') reviewResult = rec;
    }
  }
  if (!reviewResult) return envelope;

  const parsedTrigger = AgentReviewTriggerSchema.safeParse({
    invokedBySkill: reviewResult.invokedBySkill,
    reason: reviewResult.reason,
    missingFields: reviewResult.missingFields,
  });

  return {
    ...envelope,
    canvasComponents: envelope.canvasComponents.map((comp) =>
      comp.type === 'dossier'
        ? {
            ...comp,
            reviewStatus: 'in_review',
            ...(parsedTrigger.success ? { agentReviewTrigger: parsedTrigger.data } : {}),
          }
        : comp,
    ),
  };
}

/**
 * Extracts and validates the latest `A2UIEnvelope` produced by `classify_item`
 * inside an Eve assistant message, patching `reviewStatus` when `request_dossier_review` ran.
 */
export function extractEnvelopeFromToolParts(content: readonly unknown[]): A2UIEnvelope | null {
  let latestEnvelope: A2UIEnvelope | null = null;
  for (const part of content) {
    const tc = asToolCallPart(part);
    if (!tc || tc.toolName !== 'classify_item' || tc.isError) continue;
    const result = toRecord(tc.result);
    if (!result?.envelope) continue;
    const parsed = A2UIEnvelopeSchema.safeParse(result.envelope);
    if (parsed.success) {
      latestEnvelope = parsed.data;
    }
  }

  return latestEnvelope ? patchEnvelopeWithDossierReview(latestEnvelope, content) : null;
}

/** Converts an assistant-ui/Eve message into a TariffOS `WorkspaceMessage`. */
export function toWorkspaceMessageFromEve(params: {
  id: string;
  role: 'user' | 'assistant';
  createdAt?: Date;
  content: readonly unknown[];
  jurisdictionId: string;
}): WorkspaceMessage {
  const envelope =
    params.role === 'assistant' ? extractEnvelopeFromToolParts(params.content) : null;
  return {
    id: params.id,
    role: params.role,
    text: extractMessagePlainText(params.content),
    createdAt: (params.createdAt ?? new Date()).toISOString(),
    jurisdictionId: params.jurisdictionId,
    ...(envelope ? { envelope } : {}),
  };
}
