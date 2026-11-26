import { z } from 'zod';
import {
  ApprovalWorkflowModeSchema,
  IncotermCodeSchema,
} from '@tariffos/shared-types';

const JURISDICTION_TO_COUNTRY: Record<string, string> = {
  've-seniat': 'VE',
  'co-dian': 'CO',
  'mx-tigie': 'MX',
  'us-htsus': 'US',
  'eu-taric': 'EU',
  'oma-hs': 'WO',
};

const RawClassifyStreamRequestSchema = z.object({
  query: z.string().trim().min(2, 'Describe el producto con al menos 2 caracteres.'),
  jurisdictionId: z.string().trim().min(2).default('ve-seniat'),
  countryCode: z.string().trim().length(2).optional(),
  approvalWorkflowMode: ApprovalWorkflowModeSchema.default('agent_decides'),
  incoterm: IncotermCodeSchema.default('FOB'),
  cifValue: z.number().nonnegative().default(0),
  originCountry: z.string().trim().min(2).max(3).default('CN'),
  hitlAnswers: z.record(z.string(), z.string()).optional(),
  attachmentsText: z.string().trim().max(20_000).optional(),
  imageDataUrls: z.array(z.string().max(4_000_000)).max(2).optional(),
  isBatchHint: z.boolean().default(false),
  deepMode: z.boolean().default(false),
  sku: z.string().trim().optional(),
});

export const ClassifyStreamRequestSchema = RawClassifyStreamRequestSchema.transform((data) => {
  const mappedCountry = JURISDICTION_TO_COUNTRY[data.jurisdictionId.toLowerCase()];
  const countryCode = (data.countryCode ?? mappedCountry ?? 'VE').toUpperCase();
  return {
    ...data,
    countryCode,
  };
});

export type ClassifyStreamRequest = z.output<typeof ClassifyStreamRequestSchema>;
