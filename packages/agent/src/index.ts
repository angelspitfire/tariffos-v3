export {
  classifyInvoiceBatch,
  type GroundingBudget,
} from './lib/pipeline/orchestrator.js';
export {
  calculateDeterministicDuties,
  calculateFullDuties,
  inferTradeParamsFromContext,
  type DutyEngineInput,
  type DutyEngineResult,
} from './lib/pipeline/duties.js';
export {
  ORIGIN_COUNTRIES,
  INCOTERM_RULES,
  resolvePreferentialTreatment,
  detectOriginCodeFromText,
  detectIncotermFromText,
  type OriginCountryOption,
  type IncotermRule,
  type PreferentialAgreementResult,
} from './lib/pipeline/trade-preferences.js';
export {
  evaluateTradeRemedies,
  type TradeRemedyFlag,
} from './lib/pipeline/trade-remedies.js';
export {
  auditTariffAgainstOfficialSchedule,
  type TariffAuditInput,
  type TariffAuditResult,
  type TariffAuditDiscrepancy,
} from './lib/pipeline/tariff-validator.js';
export {
  RRF_K,
  DEFAULT_HYBRID_LIMIT,
  fuseHybridTariffCandidates,
  filterLegalNotesByChapter,
  retrieveHybridCandidates,
  type HybridFusionOptions,
} from './lib/pipeline/hybrid-retrieval.js';
export {
  LOW_CONFIDENCE_REVIEW_THRESHOLD,
  createAgentReviewTrigger,
  resolveInitialDossierReview,
  applyApprovalPolicyToEnvelope,
} from './lib/pipeline/dossier-approval-policy.js';
export {
  CANONICAL_MERCEOLOGICAL_ATTRIBUTES,
  HITL_CONFIDENCE_THRESHOLD,
  computeMerceologicalConfidence,
  buildMerceologicalSheet,
  evaluateHitlGate,
  type BuildMerceologicalSheetInput,
  type HitlGateInput,
  type HitlGateResult,
} from './lib/pipeline/merceological-hitl.js';
export {
  mapPayloadToA2UIEnvelope,
  type MapPayloadToA2UIOptions,
} from './lib/pipeline/a2ui-mapper.js';
export {
  mapBatchToA2UIManifest,
  mapBatchToA2UIEnvelope,
  type MapBatchToA2UIOptions,
} from './lib/pipeline/a2ui-batch-mapper.js';
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
export {
  AUTO_APPROVE_CONFIDENCE_THRESHOLD,
  REVIEW_CONFIDENCE_THRESHOLD,
  SUPPORTED_LIVE_COUNTRIES,
  isSupportedLiveCountry,
  type SupportedLiveCountry,
} from './lib/pipeline/thresholds.js';
export {
  canRunLiveLlm,
  canRunLiveLlmForProvider,
  getLlmProvider,
  listConfiguredLlmProviders,
  resolveEmbeddingDims,
  resolveEmbeddingModel,
  resolveMaxRpm,
  resolveProvider,
  type LlmProvider,
  type LlmProviderAvailability,
} from '@tariffos/ai-client';
export { rgiModel } from '@tariffos/env';
export {
  createRgiLlmRunner,
  runRgiWithLlm,
  type RgiLlmRuntimeOverride,
} from './adapters/rgi-llm-adapter.js';
