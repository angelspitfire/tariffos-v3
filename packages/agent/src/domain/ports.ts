import type { DescentStep } from './route.js';
import type { GoodsSheet } from './sheet.js';

/**
 * Output ports (adapters): Prisma, Laya/Jev, national AST, Country table,
 * restriction rules, ClassificationSession. The core knows nothing of them.
 */

/** Tariff tree: children, leaves, descriptions, levels. */
export interface TariffTree {
  children(code: string): Promise<string[]>;
  isLeaf(code: string): boolean;
  description(code: string): Promise<string>;
  level(code: string): DescentStep['level'];
}

/** Legal corpus: exclusion notes, parts/accessories, jurisprudence. */
export interface LegalCorpus {
  /** Section and chapter exclusion notes (veto / prune). */
  exclusions(code: string): Promise<string[]>;
  /** Parts and accessories notes (redirect). */
  redirects(code: string): Promise<string[]>;
  /** Jurisprudence: OMA, CROSS/EBTI, NESA. */
  precedents(code: string): Promise<string[]>;
}

/** Result of comparing siblings: the winner, the runner-up, and the structural margin (0..1). */
export interface CompareResult {
  winner: string;
  /** Second-best sibling, when one exists. */
  runnerUp: string | undefined;
  /** Margin between winner and runner-up, 0 (tied) to 1 (dominant). */
  margin: number;
}

/** Decision engine: split among siblings (RGI 3(b)), comparison by level. */
export interface DecisionEngine {
  /** Split among siblings using RGI 3(b) essential character. */
  split(candidates: string[], sheet: GoodsSheet): Promise<string[]>;
  /** Comparison by level: never compare one level against another. */
  compare(siblings: string[], sheet: GoodsSheet): Promise<CompareResult>;
}

/** Verdict rules: clear / requires-permit / prohibited by code. */
export interface VerdictRules {
  verdict(code: string): Promise<'clear' | 'requires-permit' | 'prohibited'>;
}

/** Case log: case, model, hash. */
export interface CaseLog {
  log(entry: {
    caseId: string;
    model: string;
    hash: string;
    route: DescentStep[];
  }): Promise<void>;
}
