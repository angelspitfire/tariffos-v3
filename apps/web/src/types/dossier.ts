import { z } from 'zod';

export const LegalBasisClauseSchema = z.object({
  rule: z.string(),
  title: z.string(),
  text: z.string(),
});

export type LegalBasisClause = z.infer<typeof LegalBasisClauseSchema>;

export const CustomsDossierPayloadSchema = z.object({
  filingId: z.string(),
  dossierNumber: z.string(),
  issueDate: z.string(),
  customsDistrict: z.string(),
  importerName: z.string(),
  importerRuc: z.string(),
  customsBroker: z.string(),
  regimeApplied: z.string(),
  totalCifUsd: z.number(),
  totalDutiesUsd: z.number(),
  totalSavingsUsd: z.number(),
  verificationStatus: z.enum(['ready_to_transmit', 'under_review', 'blocked']),
  conclusiveOpinion: z.string(),
  items: z.array(
    z.object({
      itemNumber: z.number(),
      hsCode: z.string(),
      description: z.string(),
      quantity: z.number(),
      cifValue: z.number(),
      dutyRate: z.number(),
      confidence: z.number(),
    })
  ),
  legalClauses: z.array(LegalBasisClauseSchema),
  permitsCount: z.number(),
  requiredPreClearanceDocs: z.array(z.string()),
});

export type CustomsDossierPayload = z.infer<typeof CustomsDossierPayloadSchema>;
