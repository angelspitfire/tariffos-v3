import type {
  ActiveExemption,
  ClassificationLinePayload,
  ComplianceFlag,
  RgiStep,
  ClassificationAlternative,
  RejectedAlternative,
  StreamProgressEvent,
  UnresolvedItem,
} from '@tariffos/shared-types';
import type { DecisionProvider } from '../decision/provider.js';
export { HIGH_CONFIDENCE_THRESHOLD, MEDIUM_CONFIDENCE_THRESHOLD } from './thresholds.js';

export const DEFAULT_MAX_WEB_GROUNDING_STANDARD = 12;
export const SHORT_DESCRIPTION_WORD_THRESHOLD = 4;

export interface InvoiceItemInput {
  lineId: string;
  sku?: string;
  description: string;
  originCountry: string;
  cifValue: number;
  quantity?: number;
  unit?: string;
  brokerNote?: string;
  imageDataUrls?: string[];
}

export interface TariffCandidateRecord {
  hsCode: string;
  description: string;
  adValoremRate: number;
  ivaRate: number;
  unit: string;
  legalRegime?: string | null;
  prohibited?: boolean;
  permits?: string[];
  score?: number;
  customsFeeRate?: number;
  baseAdValoremRate?: number;
  tariffExceptionCode?: string;
  isBK?: boolean;
  isBIT?: boolean;
  activeExemption?: ActiveExemption;
}

export interface LegalNoteRecord {
  ref: string;
  text: string;
  chapter?: string;
}

export interface SkuPrecedentRecord {
  hsCode: string;
  officialDescription: string;
  confidencePct: number;
  approvedByBroker: boolean;
}

export interface RgiModelOutput {
  hsCode: string;
  confidenceLevel: 'Alto' | 'Medio' | 'Bajo';
  confidencePct: number;
  confidenceReason: string;
  rgiSteps: RgiStep[];
  alternatives: ClassificationAlternative[];
  rejected: RejectedAlternative[];
  flags: ComplianceFlag[];
  unresolved: UnresolvedItem[];
  modelUsed: string;
  tokenUsage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

/** Hexagonal ports injected into the unified classification pipeline. */
export interface PipelinePorts {
  decisionProvider?: DecisionProvider;
  findSkuPrecedent: (tenantId: string, skuOrDesc: string) => Promise<SkuPrecedentRecord | null>;
  searchTariffCandidates: (countryCode: string, query: string) => Promise<TariffCandidateRecord[]>;
  searchVectorCandidates?: (countryCode: string, query: string) => Promise<TariffCandidateRecord[]>;
  expandSiblingSubheadings?: (
    countryCode: string,
    hsPrefixes: string[],
  ) => Promise<TariffCandidateRecord[]>;
  getLegalNotes: (countryCode: string, hsPrefix: string) => Promise<LegalNoteRecord[]>;
  verifyHsCode: (countryCode: string, hsCode: string) => Promise<TariffCandidateRecord | null>;
  runRgiReasoning: (input: {
    item: InvoiceItemInput;
    candidates: TariffCandidateRecord[];
    notes: LegalNoteRecord[];
    webContext?: string;
    deepMode: boolean;
    countryCode?: string;
  }) => Promise<RgiModelOutput>;
  fetchWebSpecs?: (query: string) => Promise<string | null>;
}

export interface PipelineRunOptions {
  tenantId: string;
  countryCode: string;
  deepMode?: boolean;
  maxWebGrounding?: number;
  onProgress?: (event: StreamProgressEvent) => void;
}

export interface BatchPipelineResult {
  lines: ClassificationLinePayload[];
  stats: {
    totalLines: number;
    uniqueItems: number;
    blockedByPreGate: number;
    tier0Hits: number;
    tier1Hits: number;
    tier2Hits: number;
    webGroundingUsed: number;
  };
}
