/**
 * Shortlist: lista de candidatos con veredicto y confianza.
 * Invariantes: al menos 3 candidatos salvo que el árbol tenga menos hojas
 * alcanzables (entonces question explica por qué); una shortlist dual no
 * tiene candidato recomendado en ninguno de sus socios.
 */

import { z } from 'zod';
import { RouteSchema, type Route } from './route.js';

export type Verdict = 'clear' | 'requires-permit' | 'prohibited' | 'no-special-regime';

export type ConfidenceLevel = 'firm' | 'arguable' | 'weak';

export interface Candidate {
  code: string;
  route: Route;
  verdict: Verdict;
  confidence: ConfidenceLevel;
  recommended: boolean;
  dualPartner?: Candidate;
}

export interface Shortlist {
  candidates: Candidate[];
  dual: boolean;
  question?: string;
}

export const VerdictSchema = z.enum([
  'clear',
  'requires-permit',
  'prohibited',
  'no-special-regime',
]);

export const ConfidenceLevelSchema = z.enum(['firm', 'arguable', 'weak']);

export const CandidateSchema: z.ZodType<Candidate> = z.lazy(() =>
  z.object({
    code: z.string().min(1),
    route: RouteSchema,
    verdict: VerdictSchema,
    confidence: ConfidenceLevelSchema,
    recommended: z.boolean(),
    dualPartner: z.lazy(() => CandidateSchema).optional(),
  })
);

export const ShortlistSchema = z.object({
  candidates: z.array(CandidateSchema),
  dual: z.boolean(),
  question: z.string().min(1).optional(),
}).superRefine((list, ctx) => {
  if (list.candidates.length < 3 && (!list.question || list.question.trim().length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'menos de 3 candidatos requiere una pregunta',
      path: ['question'],
    });
  }
  if (list.dual && list.candidates.some((candidate) => candidate.recommended)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'una shortlist dual no tiene candidato recomendado',
      path: ['candidates'],
    });
  }
});
