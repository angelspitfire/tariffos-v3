import { z } from 'zod';
import { MerceologicalSheetSchema } from '@tariffos/shared-types';

/**
 * M0 contracts for apps/filings (demo-that-sells plan).
 * Mirror of the Prisma FilingLine model + list aggregates.
 * Frontend mocks these shapes; backend implements them.
 */

export const FilingLineStatusSchema = z.enum(['DRAFT', 'AUTO', 'CONFIRM', 'BLOCKED', 'NEEDS_INFO']);
export type FilingLineStatusDTO = z.infer<typeof FilingLineStatusSchema>;

export const LineCandidateSchema = z.object({
  code: z.string().min(1),
  prob: z.number().min(0).max(1),
  /** The tariff row's description — lets the UI label evaluated options. */
  description: z.string().optional(),
});
export type LineCandidate = z.infer<typeof LineCandidateSchema>;

export const TaxBreakdownSchema = z.object({
  adv: z.number().nonnegative(),
  iva: z.number().nonnegative(),
  fee: z.number().nonnegative().default(0),
  total: z.number().nonnegative(),
  currency: z.string().default('USD'),
});
export type TaxBreakdown = z.infer<typeof TaxBreakdownSchema>;

export const PermitFlagSchema = z.object({
  agency: z.string().min(1),
  status: z.enum(['verified', 'pending', 'blocked', 'na']),
  prob: z.number().min(0).max(1).optional(),
});
export type PermitFlag = z.infer<typeof PermitFlagSchema>;

export const RgiStepSchema = z.object({
  rule: z.string().min(1),
  text: z.string().optional().default(''),
});
export type RgiStep = z.infer<typeof RgiStepSchema>;

export const LineJustificationSchema = z.object({
  technical: z.string().optional().default(''),
  colloquial: z.string().optional().default(''),
  alerts: z.array(z.string()).optional().default([]),
  clarifications: z.array(z.string()).optional().default([]),
  /**
   * Every question this line has ever asked, across runs. The repeat guard:
   * the writer drops re-asks of anything in here so a re-run moves to new
   * ground instead of spinning the same NEEDS_INFO loop forever.
   */
  askedQuestions: z.array(z.string()).optional(),
  /**
   * Full definition of every disambiguation pair this line has answered:
   * the question text and all branch options with their tariff consequences.
   * The repeat guard stops the pair from being re-OFFERED, but this keeps it
   * RE-EDITABLE: "Cambiar" on a resolved answer reopens the stored options
   * so the broker can pick a different branch and re-run classification.
   */
  questionBank: z
    .record(
      z.string().min(1),
      z.object({
        question: z.string().min(1),
        hint: z.string().optional(),
        answers: z
          .array(
            z.object({
              label: z.string().min(1),
              keeps: z.array(z.string().min(1)),
              codes: z.array(z.string()).optional().default([]),
              adValorem: z.number().nullable().optional(),
              iva: z.number().nullable().optional(),
              agencies: z.array(z.string()).optional().default([]),
            }),
          )
          .min(2),
      }),
    )
    .optional(),
  /** Documents the importer must still present (refinement-plan §4.5). */
  missingDocuments: z.array(z.string()).optional().default([]),
  /** Normalization-layer merceological sheet, validated by schema (§4.1). */
  ficha: MerceologicalSheetSchema.optional(),
  /** True when a broker answer settled this line (the ballot was vetoed). */
  humanResolved: z.boolean().optional(),
  /**
   * An open structured disambiguation: the Socratic question the classifier
   * asked, and per-answer the ballot rule (`keeps` prefixes) the broker's
   * answer will veto with, plus the codes that rule kept live at ask time and
   * their tariff consequences. The UI reads it to render answer chips; the
   * classifier reads pairId + answerIndex back on re-run. Optional: absence
   * means the line carries no askable pair.
   */
  disambiguation: z
    .object({
      pairId: z.string().min(1),
      question: z.string().min(1),
      /** How to tell the options apart — for a non-expert classifier. */
      hint: z.string().optional(),
      answers: z
        .array(
          z.object({
            label: z.string().min(1),
            keeps: z.array(z.string().min(1)),
            codes: z.array(z.string()).optional().default([]),
            adValorem: z.number().nullable().optional(),
            iva: z.number().nullable().optional(),
            agencies: z.array(z.string()).optional().default([]),
          }),
        )
        .min(2),
    })
    .optional(),
  /**
   * Stage-3 national refinement counters, forwarded verbatim from the thin
   * pipeline (`ThinClassification['stage3']`): pool size, whether the pick
   * changed, refined confidence, and M1 grouping-hop details.
   */
  stage3: z
    .object({
      ran: z.boolean(),
      changed: z.boolean(),
      poolSize: z.number().int().nonnegative(),
      rootHsCode: z.string().min(1),
      confidence: z.number().nullable(),
      groupingOffered: z.number().int().nonnegative(),
      groupingPick: z.string(),
      groupingConfidence: z.number().nullable(),
    })
    .nullable()
    .optional(),
  /**
   * The answers the broker gave, oldest first. A choice is not final: the
   * card lists them so a wrong pick can be re-applied (the veto runs again
   * with the other branch) — the audit trail of what was chosen, in order.
   */
  answerHistory: z
    .array(
      z.object({
        pairId: z.string().min(1),
        answerIndex: z.number().int().nonnegative(),
        label: z.string().optional(),
        at: z.string().optional(),
      }),
    )
    .optional(),
  /**
   * The answer the broker gave that the classifier has not consumed yet.
   *
   * It travels with the line so ANY re-run path applies it — the single-line
   * re-classification and the filing-wide batch alike. Without it a batch
   * pass silently overwrote an answered line, and the broker's click looked
   * like it had been ignored.
   */
  pendingAnswer: z
    .object({
      pairId: z.string().min(1),
      answerIndex: z.number().int().nonnegative(),
      label: z.string().optional(),
      at: z.string().optional(),
    })
    .optional(),
});
export type LineJustification = z.infer<typeof LineJustificationSchema>;

/**
 * Parsed empty justification. Zod 4's `.default()` takes the *output* type,
 * so the default must already include the schema's own defaults; `.prefault()`
 * is not an option because it keeps `undefined` in the inferred DTO.
 */
const EMPTY_JUSTIFICATION: LineJustification = LineJustificationSchema.parse({});

export const FilingLineSchema = z.object({
  id: z.string().min(1),
  filingId: z.string().min(1),
  lineNumber: z.number().int().positive(),
  description: z.string().min(1),
  hsCode: z.string().nullable().optional(),
  omaCode: z.string().nullable().optional(),
  confidence: z.number().min(0).max(1).nullable().optional(),
  candidates: z.array(LineCandidateSchema).default([]),
  status: FilingLineStatusSchema,
  cifValue: z.number().nonnegative().nullable().optional(),
  taxBreakdown: TaxBreakdownSchema.nullable().optional(),
  permits: z.array(PermitFlagSchema).default([]),
  rgiSteps: z.array(RgiStepSchema).default([]),
  justification: LineJustificationSchema.optional().default(EMPTY_JUSTIFICATION),
  engineName: z.string().nullable().optional(),
  engineVersion: z.string().nullable().optional(),
  corpusVersion: z.string().nullable().optional(),
});
export type FilingLineDTO = z.infer<typeof FilingLineSchema>;

export const FilingLineInputSchema = FilingLineSchema.omit({ id: true }).extend({
  candidates: z.array(LineCandidateSchema).optional().default([]),
  permits: z.array(PermitFlagSchema).optional().default([]),
  rgiSteps: z.array(RgiStepSchema).optional().default([]),
});
export type FilingLineInput = z.infer<typeof FilingLineInputSchema>;

export const LineCountsSchema = z.object({
  total: z.number().int().nonnegative(),
  auto: z.number().int().nonnegative(),
  confirm: z.number().int().nonnegative(),
  blocked: z.number().int().nonnegative(),
});
export type LineCounts = z.infer<typeof LineCountsSchema>;

export const FilingsListItemSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  clientName: z.string(),
  customsOffice: z.string().nullable().optional(),
  counts: LineCountsSchema,
  triage: z.enum(['ready', 'action', 'draft']),
  estimatedTax: z.number().nonnegative().nullable().optional(),
  updatedAt: z.string().min(1),
});
export type FilingsListItem = z.infer<typeof FilingsListItemSchema>;

/** Triage rollup for the Filings list filters (All / Needs action / Ready). */
export function rollupLineCounts(
  lines: Array<Pick<FilingLineDTO, 'status'>>,
): { counts: LineCounts; triage: FilingsListItem['triage'] } {
  const counts: LineCounts = { total: lines.length, auto: 0, confirm: 0, blocked: 0 };
  for (const line of lines) {
    if (line.status === 'AUTO') counts.auto += 1;
    // NEEDS_INFO needs human action like CONFIRM — bucket it for triage/badges.
    else if (line.status === 'CONFIRM' || line.status === 'NEEDS_INFO') counts.confirm += 1;
    else if (line.status === 'BLOCKED') counts.blocked += 1;
  }
  const needsAction = counts.confirm + counts.blocked;
  const triage =
    counts.total === 0 || lines.some((l) => l.status === 'DRAFT')
      ? 'draft'
      : needsAction > 0
        ? 'action'
        : 'ready';
  return { counts, triage };
}
