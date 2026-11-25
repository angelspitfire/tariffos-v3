/**
 * Tariff classification domain core.
 * Hexagonal architecture: no imports of Prisma, Laya, nor UI.
 * Everything goes in and out through a port.
 *
 * Dependencies point to the core. Verdict does NOT live here.
 */

export type { GoodsSheet, SheetField, SheetFieldName, Source, SheetFieldMethod } from './sheet.js';
export {
  SHEET_FIELD_NAMES,
  SourceSchema,
  SheetFieldSchema,
  GoodsSheetSchema,
  requireComplete,
  missingFields,
  type RequireCompleteResult,
} from './sheet.js';

export type { CountryProfile, ChapterConfig } from './profile.js';
export { createCountryProfile } from './profile.js';

export type { Confidence, Verdict, ConfidenceLevel } from './verdict.js';
export {
  CONFIDENCE_LEVELS,
  CLOSE_MARGIN_THRESHOLD,
  MIN_CANDIDATES,
  OPEN_CANDIDATES,
} from './verdict.js';

export type { Mechanism, MechanismResult } from './mechanisms.js';
export {
  MECHANISM_PRECEDENCE,
  mechanismRank,
  noApplies,
  applies,
} from './mechanisms.js';

export { veto, override, redirect, prune, split, cite, applyMechanisms, type MechanismEffect, type MechanismContext } from './mechanism-effects.js';

export type { ClassifyLine, ClassifyResult, ClassifyCandidate, DescentStep } from './classify-line.js';

export type { TariffTree, LegalCorpus, DecisionEngine, VerdictRules, CaseLog } from './ports.js';

export { BEAM_WIDTH, expand, type BeamContext, type Expansion } from './beam.js';

export {
  gateByImpact,
  type GateResult,
  type GateField,
  type Unlock,
  type Conflict,
} from './gate.js';

export { InMemoryCaseLog, createCaseLog, type CaseLogEntry } from './case-log.js';

export { combineDual, isDual, type Dual } from './dual.js';

export {
  CHAPTER_39,
  CHAPTER_87,
  CHAPTER_84,
  CHAPTER_98,
  FIXTURES,
  treeSlice,
  type TreeSlice,
} from './fixtures.js';
