import {
  A2UICalculatorComponentSchema,
  A2UIEnvelopeSchema,
  AgentReviewTriggerSchema,
  type A2UICalculatorComponent,
  type A2UIEnvelope,
} from '@tariffos/shared-types';
import type { WorkspaceMessage } from './types';

export { getEveToolActivity, getEveToolLabel } from './eve-tool-labels';

interface UnknownToolCallPart {
  type: 'tool-call';
  toolCallId?: string;
  toolName?: string;
  args?: unknown;
  result?: unknown;
  isError?: boolean;
  isPreliminary?: boolean;
}

function toRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

function asToolCallPart(part: unknown): UnknownToolCallPart | null {
  const record = toRecord(part);
  if (!record || record.type !== 'tool-call') return null;
  return record as unknown as UnknownToolCallPart;
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

function mergeCalculatorIntoEnvelope(
  envelope: A2UIEnvelope | null,
  calculator: A2UICalculatorComponent | null,
): A2UIEnvelope | null {
  if (!calculator) return envelope;
  if (!envelope) {
    return A2UIEnvelopeSchema.parse({
      assistantMessage: `Liquidación CIF calculada para ${calculator.hsCode}`,
      classificationStatus: 'classified',
      inlineComponents: [],
      canvasComponents: [calculator],
    });
  }
  const rest = envelope.canvasComponents.filter((c) => c.type !== 'calculator');
  return { ...envelope, canvasComponents: [...rest, calculator] };
}

function patchEnvelopeWithDossierReview(
  envelope: A2UIEnvelope,
  content: readonly unknown[],
): A2UIEnvelope {
  let reviewResult: Record<string, unknown> | null = null;
  for (const part of content) {
    const tc = asToolCallPart(part);
    if (tc?.toolName === 'request_dossier_review' && !tc.isError && !tc.isPreliminary) {
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
 * Extracts and validates the latest `A2UIEnvelope` and `calculatorComponent` produced by
 * Eve tools (`classify_item`, `request_technical_clarification`, `analyze_invoice_manifest`,
 * `calculate_duties`), patching `reviewStatus` when `request_dossier_review` ran.
 */
export function extractEnvelopeFromToolParts(content: readonly unknown[]): A2UIEnvelope | null {
  let latestEnvelope: A2UIEnvelope | null = null;
  let latestCalculator: A2UICalculatorComponent | null = null;
  let latestBatchManifest: A2UIEnvelope['canvasComponents'][number] | null = null;
  let latestDocSummary: A2UIEnvelope['inlineComponents'][number] | null = null;

  for (const part of content) {
    const tc = asToolCallPart(part);
    if (!tc || tc.isError || tc.isPreliminary || !tc.result) continue;
    const result = toRecord(tc.result);
    if (!result) continue;

    if (result.envelope) {
      const parsed = A2UIEnvelopeSchema.safeParse(result.envelope);
      if (parsed.success) {
        const batchComp = parsed.data.canvasComponents.find((c) => c.type === 'batch_manifest');
        if (batchComp) latestBatchManifest = batchComp;
        const docComp = parsed.data.inlineComponents.find((c) => c.type === 'document_summary');
        if (docComp) latestDocSummary = docComp;
        latestEnvelope = parsed.data;
      }
    }
    if (result.calculatorComponent) {
      const parsedCalc = A2UICalculatorComponentSchema.safeParse(result.calculatorComponent);
      if (parsedCalc.success) latestCalculator = parsedCalc.data;
    }
  }

  if (latestEnvelope && latestBatchManifest) {
    const hasBatch = latestEnvelope.canvasComponents.some((c) => c.type === 'batch_manifest');
    const hasDoc = latestEnvelope.inlineComponents.some((c) => c.type === 'document_summary');
    latestEnvelope = {
      ...latestEnvelope,
      inlineComponents:
        !hasDoc && latestDocSummary
          ? [latestDocSummary, ...latestEnvelope.inlineComponents]
          : latestEnvelope.inlineComponents,
      canvasComponents: hasBatch
        ? latestEnvelope.canvasComponents
        : [latestBatchManifest, ...latestEnvelope.canvasComponents],
    };
  }

  const withCalc = mergeCalculatorIntoEnvelope(latestEnvelope, latestCalculator);
  return withCalc ? patchEnvelopeWithDossierReview(withCalc, content) : null;
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
  const plainText = extractMessagePlainText(params.content);
  const text =
    plainText ||
    (envelope?.workflowState === 'needs_input' ? envelope.assistantMessage : '');

  return {
    id: params.id,
    role: params.role,
    text,
    createdAt: (params.createdAt ?? new Date()).toISOString(),
    jurisdictionId: params.jurisdictionId,
    ...(envelope ? { envelope } : {}),
  };
}
