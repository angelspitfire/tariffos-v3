import type {
  DossierReviewStatus,
  OperationalStatus,
  ProcessItemProgress,
  ProcessKind,
  ThreadTriageDecision,
} from '@tariffos/shared-types';
import type { ThreadTriageInput } from '@tariffos/agent';

export function buildTriageInputFromRawMessages(
  messages: ReadonlyArray<Record<string, unknown>>,
  previousProcessKind?: ProcessKind,
): {
  triageInput: ThreadTriageInput;
  primaryHsCode: string | null;
  itemProgress: ProcessItemProgress | null;
} {
  let firstMessage = '';
  let hasAttachments = false;
  let hasVerdict = false;
  let hasDossier = false;
  let hasBatchManifest = false;
  let hasCalculator = false;
  let hasQuestionnaire = false;
  let hasCriticalOga = false;
  let dossierReviewStatus: DossierReviewStatus | undefined;
  let primaryHsCode: string | null = null;
  let itemProgress: ProcessItemProgress | null = null;
  const toolNames = new Set<string>();

  for (const raw of messages) {
    const role = typeof raw.role === 'string' ? raw.role : '';
    const text = typeof raw.text === 'string' ? raw.text : '';
    if (!firstMessage && role === 'user' && text.trim()) firstMessage = text.trim();
    if (Array.isArray(raw.attachments) && raw.attachments.length > 0) hasAttachments = true;

    const env = raw.envelope as
      | {
          classificationStatus?: string;
          inlineComponents?: Array<Record<string, unknown>>;
          canvasComponents?: Array<Record<string, unknown>>;
          toolEvents?: Array<{ name?: string }>;
        }
      | undefined;
    if (!env) continue;
    for (const te of env.toolEvents ?? []) {
      if (typeof te.name === 'string') toolNames.add(te.name);
    }
    if (env.classificationStatus === 'pre_gate_blocked') hasCriticalOga = true;
    for (const inline of env.inlineComponents ?? []) {
      if (inline.type === 'verdict') {
        hasVerdict = true;
        if (typeof inline.hsCode === 'string') primaryHsCode = inline.hsCode;
      } else if (inline.type === 'questionnaire' || inline.type === 'disambiguation') {
        hasQuestionnaire = true;
      }
    }
    for (const canvas of env.canvasComponents ?? []) {
      if (canvas.type === 'dossier') {
        hasDossier = true;
        if (typeof canvas.hsCode === 'string' && !primaryHsCode) primaryHsCode = canvas.hsCode;
        if (typeof canvas.reviewStatus === 'string') {
          dossierReviewStatus = canvas.reviewStatus as DossierReviewStatus;
          if (dossierReviewStatus === 'in_review') hasCriticalOga = true;
        }
      } else if (canvas.type === 'calculator') {
        hasCalculator = true;
      } else if (canvas.type === 'batch_manifest' && Array.isArray(canvas.items)) {
        hasBatchManifest = true;
        const items = canvas.items as Array<{ status?: string; workflowItemState?: string }>;
        const total = items.length;
        const completed = items.filter((i) => i.status === 'classified').length;
        const needsInfo = items.filter(
          (i) =>
            i.status === 'needs_review' ||
            i.workflowItemState === 'needs_info' ||
            i.workflowItemState === 'blocked',
        ).length;
        itemProgress = { total, completed, needsInfo };
        primaryHsCode = `Lote · ${total} ítems`;
      }
    }
  }

  return {
    primaryHsCode,
    itemProgress,
    triageInput: {
      firstMessage,
      hasAttachments,
      toolNames: Array.from(toolNames),
      hasVerdict,
      hasDossier,
      hasBatchManifest,
      hasCalculator,
      hasQuestionnaireOrDisambiguation: hasQuestionnaire,
      hasCriticalOgaOrPreGate: hasCriticalOga,
      dossierReviewStatus,
      batchTotalItems: itemProgress?.total,
      batchCompletedItems: itemProgress?.completed,
      batchNeedsInfoItems: itemProgress?.needsInfo,
      previousProcessKind,
    },
  };
}

export function resolveEffectiveOperationalStatus(
  explicitStatus: OperationalStatus | undefined,
  triage: ThreadTriageDecision | null,
  archived: boolean,
): OperationalStatus {
  if (archived) return 'archived';
  if (explicitStatus) return explicitStatus;
  return triage?.operationalStatus ?? 'processing';
}
