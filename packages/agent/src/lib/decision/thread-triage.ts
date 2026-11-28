import type {
  DossierReviewStatus,
  OperationalStatus,
  ProcessKind,
  ThreadTriageDecision,
  ThreadUrgency,
} from '@tariffos/shared-types';
import type { DecisionProvider } from './provider.js';

export interface ThreadTriageInput {
  firstMessage: string;
  hasAttachments: boolean;
  toolNames: readonly string[];
  hasVerdict: boolean;
  hasDossier: boolean;
  hasBatchManifest: boolean;
  hasCalculator: boolean;
  hasQuestionnaireOrDisambiguation: boolean;
  hasCriticalOgaOrPreGate: boolean;
  dossierReviewStatus?: DossierReviewStatus;
  batchTotalItems?: number;
  batchCompletedItems?: number;
  batchNeedsInfoItems?: number;
  previousProcessKind?: ProcessKind;
}

const PROCESS_KIND_CATEGORIES: Record<ProcessKind, string> = {
  quick_lookup:
    'General customs question, concept lookup, duty percentage question, or greeting without formal item classification or file attachment.',
  single_ruling:
    'Formal tariff classification ruling or technical product description to classify under an HS code.',
  invoice_batch:
    'Multi-item commercial invoice, packing list, spreadsheet, or bulk manifest classification.',
  oga_escalation:
    'Controlled chemical, medical, telecom, dual-use, or permit-heavy import requiring technical OGA legal review.',
  cif_simulation:
    'Customs duty, CIF valuation, Incoterm, or landed tax calculation request without formal tariff ruling.',
};

const QUICK_QUESTION_RE = /^\s*(?:¿|que\b|qué\b|cual\b|cuál\b|como\b|cómo\b|cuanto\b|cuánto\b|hola\b)/i;

function resolveRetentionPolicy(kind: ProcessKind) {
  return kind === 'quick_lookup' ? ('ephemeral_48h' as const) : ('track_until_approved' as const);
}

function resolveUrgency(kind: ProcessKind, status: OperationalStatus): ThreadUrgency {
  if (kind === 'oga_escalation' || status === 'in_review') return 'compliance_sensitive';
  if (status === 'needs_input') return 'needs_client_info';
  return 'routine';
}

function preserveNonDemotedKind(
  candidate: ProcessKind,
  previous?: ProcessKind,
): ProcessKind {
  if (previous && previous !== 'quick_lookup' && candidate === 'quick_lookup') {
    return previous;
  }
  return candidate;
}

function buildDecision(
  kind: ProcessKind,
  operationalStatus: OperationalStatus,
  confidence: number,
  source: ThreadTriageDecision['source'],
  previous?: ProcessKind,
): ThreadTriageDecision {
  const processKind = preserveNonDemotedKind(kind, previous);
  return {
    processKind,
    operationalStatus,
    urgency: resolveUrgency(processKind, operationalStatus),
    retentionPolicy: resolveRetentionPolicy(processKind),
    confidence,
    source,
  };
}

/** Deterministic zero-cost triage for clear structural tool/envelope signals. */
export function deriveDeterministicThreadTriage(
  input: ThreadTriageInput,
): ThreadTriageDecision | null {
  const hasBatch =
    input.hasBatchManifest || input.toolNames.includes('analyze_invoice_manifest');
  if (hasBatch) {
    const needsInfo = (input.batchNeedsInfoItems ?? 0) > 0;
    const total = input.batchTotalItems ?? 0;
    const completed = input.batchCompletedItems ?? 0;
    const status: OperationalStatus = needsInfo
      ? 'needs_input'
      : total > 0 && completed >= total
        ? 'approved'
        : 'processing';
    return buildDecision('invoice_batch', status, 1, 'deterministic', input.previousProcessKind);
  }

  if (input.hasCriticalOgaOrPreGate || input.dossierReviewStatus === 'in_review') {
    return buildDecision('oga_escalation', 'in_review', 1, 'deterministic', input.previousProcessKind);
  }

  const hasCifOnly =
    (input.hasCalculator || input.toolNames.includes('calculate_duties')) &&
    !input.hasVerdict &&
    !input.hasDossier;
  if (hasCifOnly) {
    return buildDecision('cif_simulation', 'processing', 1, 'deterministic', input.previousProcessKind);
  }

  if (input.hasVerdict || input.hasDossier || input.hasQuestionnaireOrDisambiguation) {
    const status: OperationalStatus =
      input.dossierReviewStatus === 'approved'
        ? 'approved'
        : input.hasQuestionnaireOrDisambiguation
          ? 'needs_input'
          : 'processing';
    return buildDecision('single_ruling', status, 1, 'deterministic', input.previousProcessKind);
  }

  return null;
}

function fallbackFreeTextKind(input: ThreadTriageInput): ProcessKind {
  if (input.hasAttachments) return 'single_ruling';
  const trimmed = input.firstMessage.trim();
  if (QUICK_QUESTION_RE.test(trimmed)) return 'quick_lookup';
  return trimmed.length > 0 ? 'single_ruling' : 'quick_lookup';
}

function parseProcessKind(raw: string): ProcessKind | null {
  const key = raw.trim() as ProcessKind;
  return key in PROCESS_KIND_CATEGORIES ? key : null;
}

/**
 * Classifies an operator workspace thread into an operational process lifecycle
 * using zero-cost deterministic tool signals first and `DecisionProvider` (Jev)
 * for ambiguous free-text turns.
 */
export async function classifyThreadIntent(
  input: ThreadTriageInput,
  provider?: DecisionProvider,
): Promise<ThreadTriageDecision> {
  const deterministic = deriveDeterministicThreadTriage(input);
  if (deterministic) return deterministic;

  if (input.previousProcessKind && input.previousProcessKind !== 'quick_lookup') {
    return buildDecision(input.previousProcessKind, 'processing', 1, 'deterministic', input.previousProcessKind);
  }

  if (provider) {
    try {
      const answer = await provider.classifyChoice({
        state: {
          message: input.firstMessage.slice(0, 400),
          hasAttachments: input.hasAttachments,
          tools: input.toolNames.join(',') || 'none',
        },
        prompt:
          'Classify this customs broker chat thread into the operational process kind that best governs its sidebar lifecycle.',
        categories: PROCESS_KIND_CATEGORIES,
      });
      const parsedKind = parseProcessKind(answer.choice);
      if (parsedKind) {
        return buildDecision(parsedKind, 'processing', answer.confidence, 'system_one', input.previousProcessKind);
      }
    } catch {
      // Safe fallback when SYSTEM_ONE provider is unreachable or unconfigured.
    }
  }

  return buildDecision(fallbackFreeTextKind(input), 'processing', 0.5, 'fallback', input.previousProcessKind);
}
