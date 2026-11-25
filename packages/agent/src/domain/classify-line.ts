import type { GoodsSheet } from './sheet.js';
import type { CountryProfile } from './profile.js';
import type { DescentStep } from './route.js';
import type { Verdict } from './verdict.js';

export type { DescentStep } from './route.js';

/**
 * Stable input port. Typed input (GoodsSheet + CountryProfile),
 * shortlist output with justification. Verdict does NOT live in the core:
 * it lives in the output adapter (VerdictRules).
 */
export interface ClassifyLine {
  classify(sheet: GoodsSheet, profile: CountryProfile): Promise<ClassifyResult>;
}

export interface ClassifyCandidate {
  /** Terminal code (10 digits in VE, 8 in MX, 6 in pure SA). */
  code: string;
  recommended: boolean;
  confidence: 'firm' | 'arguable' | 'weak';
  /** Full descent trace for this candidate. */
  route: DescentStep[];
  /** Suggested verdict: not a decision, just a recommendation. */
  verdict: Verdict;
  /** When two routes are sustainable with different legal basis, presented as pair. */
  dualPartner?: string;
}

export interface ClassifyResult {
  /** At least 3 candidates, never truncated to decide. */
  candidates: ClassifyCandidate[];
  /** True when two routes are sustainable with different legal basis. */
  dual?: boolean;
  /** If sheet was incomplete, the question that should have been asked before descent. */
  askedQuestion?: string;
}
