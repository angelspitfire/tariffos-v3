export {
  calculateDeterministicDuties,
  calculateFullDuties,
  type DutyEngineInput,
  type DutyEngineResult,
} from './lib/pipeline/duties.js';
export { inferTradeParamsFromContext } from './lib/pipeline/trade-context.js';
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
  LOW_CONFIDENCE_REVIEW_THRESHOLD,
  createAgentReviewTrigger,
  resolveInitialDossierReview,
  applyApprovalPolicyToEnvelope,
} from './lib/pipeline/dossier-approval-policy.js';
export {
  AUTO_APPROVE_CONFIDENCE_THRESHOLD,
  HIGH_CONFIDENCE_THRESHOLD,
  MEDIUM_CONFIDENCE_THRESHOLD,
  REVIEW_CONFIDENCE_THRESHOLD,
  SUPPORTED_LIVE_COUNTRIES,
  isSupportedLiveCountry,
  type SupportedLiveCountry,
} from './lib/pipeline/thresholds.js';
