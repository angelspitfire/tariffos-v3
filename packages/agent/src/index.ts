export {
  classifyInvoiceBatch,
  type GroundingBudget,
} from './lib/pipeline/orchestrator.js';
export {
  calculateDeterministicDuties,
} from './lib/pipeline/duties.js';
export {
  deduplicateInvoiceItems,
  buildItemKey,
  type DeduplicatedGroup,
} from './lib/pipeline/dedup.js';
export {
  runCompliancePreGate,
  type PreGateResult,
} from './lib/pipeline/pre-gate.js';
export {
  DEFAULT_MAX_WEB_GROUNDING_STANDARD,
  SHORT_DESCRIPTION_WORD_THRESHOLD,
  HIGH_CONFIDENCE_THRESHOLD,
  MEDIUM_CONFIDENCE_THRESHOLD,
  type InvoiceItemInput,
  type TariffCandidateRecord,
  type LegalNoteRecord,
  type SkuPrecedentRecord,
  type RgiModelOutput,
  type PipelinePorts,
  type PipelineRunOptions,
  type BatchPipelineResult,
} from './lib/pipeline/types.js';
export {
  defaultProvider,
  type DecisionProvider,
  type SystemOneFn,
  type SystemOneBatchFn,
} from './lib/decision/provider.js';
export { typesafeProvider } from './lib/decision/typesafe-adapter.js';
export { runRgiWithLlm } from './adapters/rgi-llm-adapter.js';
