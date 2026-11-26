import { defineTool } from 'eve/tools';
import { z } from 'zod';
import {
  AgentReviewTriggerSchema,
  type AgentReviewTrigger,
  type DossierReviewStatus,
} from '@tariffos/shared-types';

export const RequestDossierReviewInputSchema = z.object({
  hsCode: z.string().trim().min(4),
  invokedBySkill: z.string().trim().optional(),
  reason: z.string().trim().min(1),
  missingFields: z.array(z.string().trim().min(1)).optional(),
});

export type RequestDossierReviewInput = z.infer<typeof RequestDossierReviewInputSchema>;

export interface RequestDossierReviewResult extends AgentReviewTrigger {
  hsCode: string;
  reviewStatus: DossierReviewStatus;
}

export async function executeRequestDossierReview(
  input: RequestDossierReviewInput,
): Promise<RequestDossierReviewResult> {
  const trigger = AgentReviewTriggerSchema.parse({
    invokedBySkill: input.invokedBySkill,
    reason: input.reason,
    missingFields: input.missingFields,
  });

  return {
    ...trigger,
    hsCode: input.hsCode,
    reviewStatus: 'in_review',
  };
}

export default defineTool({
  description:
    'Escalate a classification dossier to broker review (reviewStatus: in_review) when technical evidence is incomplete, confidence is below threshold, or compliance/OGA risk exists.',
  inputSchema: RequestDossierReviewInputSchema,
  execute: executeRequestDossierReview,
});
