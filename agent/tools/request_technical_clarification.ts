import { defineTool } from 'eve/tools';
import { z } from 'zod';
import { A2UIEnvelopeSchema, type A2UIEnvelope } from '@tariffos/shared-types';

const ClarificationQuestionSchema = z.object({
  id: z.string().trim().min(1),
  label: z.string().trim().min(2),
  fieldType: z.enum(['select', 'text', 'number']).default('text'),
  options: z.array(z.string().trim().min(1)).optional(),
  placeholder: z.string().optional(),
  unit: z.string().optional(),
});

const DisambiguationOptionSchema = z.object({
  id: z.string().trim().min(1),
  label: z.string().trim().min(2),
  technicalDetail: z.string().trim().min(2),
  suggestedHsHint: z.string().trim().optional(),
});

export const RequestTechnicalClarificationInputSchema = z.object({
  message: z.string().trim().min(4),
  title: z.string().trim().default('Especificaciones requeridas'),
  mode: z.enum(['questionnaire', 'disambiguation']).default('questionnaire'),
  contextHint: z.string().trim().optional(),
  questions: z.array(ClarificationQuestionSchema).optional(),
  options: z.array(DisambiguationOptionSchema).optional(),
});

export type RequestTechnicalClarificationInput = z.infer<
  typeof RequestTechnicalClarificationInputSchema
>;

export interface RequestTechnicalClarificationResult {
  status: 'needs_input';
  mode: 'questionnaire' | 'disambiguation';
  title: string;
  envelope: A2UIEnvelope;
}

export async function executeRequestTechnicalClarification(
  input: RequestTechnicalClarificationInput,
): Promise<RequestTechnicalClarificationResult> {
  const now = Date.now();
  const isDisambiguation = input.mode === 'disambiguation' && (input.options?.length ?? 0) > 0;

  const inlineComponents = isDisambiguation
    ? [
        {
          type: 'disambiguation' as const,
          id: `dis-${now}`,
          question: input.title,
          ...(input.contextHint ? { contextHint: input.contextHint } : {}),
          options: input.options ?? [],
        },
      ]
    : [
        {
          type: 'questionnaire' as const,
          id: `q-${now}`,
          title: input.title,
          fields: (input.questions ?? []).map((q) => ({
            id: q.id,
            label: q.label,
            fieldType: q.fieldType,
            ...(q.options ? { options: q.options } : {}),
            ...(q.placeholder ? { placeholder: q.placeholder } : {}),
            ...(q.unit ? { unit: q.unit } : {}),
          })),
        },
      ];

  const envelope = A2UIEnvelopeSchema.parse({
    assistantMessage: input.message,
    classificationStatus: isDisambiguation ? 'needs_disambiguation' : 'needs_details',
    workflowState: 'needs_input',
    inlineComponents,
    canvasComponents: [],
  });

  return {
    status: 'needs_input',
    mode: isDisambiguation ? 'disambiguation' : 'questionnaire',
    title: input.title,
    envelope,
  };
}

export default defineTool({
  description:
    'Request decisive technical specifications from the user via an interactive 1-click questionnaire or numbered disambiguation card before classifying. Use when critical attributes that change the HS subheading (power, voltage, material composition, capacity, CAS number) are missing.',
  inputSchema: RequestTechnicalClarificationInputSchema,
  endsTurn: true,
  label: {
    start: ({ title }) => `Preparando validación técnica: ${title}`,
    complete: ({ title }) => `Validación solicitada: ${title}`,
  },
  execute: executeRequestTechnicalClarification,
  toModelOutput(output) {
    return {
      type: 'json',
      value: {
        status: output.status,
        mode: output.mode,
        title: output.title,
        message: output.envelope.assistantMessage,
      },
    };
  },
});
