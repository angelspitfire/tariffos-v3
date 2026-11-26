import { z } from 'zod';
import {
  ApprovalWorkflowModeSchema,
  IncotermCodeSchema,
} from '@tariffos/shared-types';

export const ClassifyStreamRequestSchema = z.object({
  query: z.string().trim().min(2, 'Describe el producto con al menos 2 caracteres.'),
  jurisdictionId: z.string().trim().min(2).default('ve-seniat'),
  countryCode: z.string().trim().length(2).default('VE'),
  approvalWorkflowMode: ApprovalWorkflowModeSchema.default('agent_decides'),
  incoterm: IncotermCodeSchema.default('FOB'),
  cifValue: z.number().nonnegative().default(0),
  originCountry: z.string().trim().min(2).max(3).default('CN'),
  hitlAnswers: z.record(z.string(), z.string()).optional(),
  deepMode: z.boolean().default(false),
  sku: z.string().trim().optional(),
});

export type ClassifyStreamRequest = z.infer<typeof ClassifyStreamRequestSchema>;
