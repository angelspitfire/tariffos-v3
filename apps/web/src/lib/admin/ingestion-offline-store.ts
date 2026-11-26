import type { LegalChunkDraft } from '@tariffos/database';
import type {
  CountryConfigInput,
  CountryIngestionSummary,
  LegalDocumentStatus,
  LegalDocumentType,
  LegalDraftSummary,
} from '@tariffos/shared-types';
import {
  createInitialOfflineIngestionState,
  type OfflineIngestionDoc,
  type OfflineIngestionState,
} from './ingestion-offline-seed';

export {
  computeOfflineDraftDiff,
  discardOfflineDraft,
  publishOfflineDraft,
} from './ingestion-offline-lifecycle';

const globalForIngestion = globalThis as unknown as {
  __tariffosOfflineIngestionState?: OfflineIngestionState;
};

export function getOfflineIngestionState(): OfflineIngestionState {
  if (!globalForIngestion.__tariffosOfflineIngestionState) {
    globalForIngestion.__tariffosOfflineIngestionState = createInitialOfflineIngestionState();
  }
  return globalForIngestion.__tariffosOfflineIngestionState;
}

export function resetOfflineIngestionState(): OfflineIngestionState {
  globalForIngestion.__tariffosOfflineIngestionState = createInitialOfflineIngestionState();
  return globalForIngestion.__tariffosOfflineIngestionState;
}

export function toOfflineDraftSummary(doc: OfflineIngestionDoc): LegalDraftSummary {
  return {
    id: doc.id,
    countryCode: doc.countryCode,
    legalType: doc.legalType,
    hierarchyPath: doc.hierarchyPath,
    title: doc.title,
    sourceFile: doc.sourceFile,
    officialDocumentNumber: doc.officialDocumentNumber,
    decreeNumber: doc.decreeNumber,
    validFromDate: doc.validFromDate,
    validToDate: doc.validToDate,
    isDerogated: doc.isDerogated,
    status: doc.status,
    chunkCount: doc.chunks.length,
    embeddedChunkCount: doc.status === 'PUBLISHED' ? doc.chunks.length : 0,
    createdAt: doc.createdAt,
  };
}

export function listOfflineCountriesSummary(): CountryIngestionSummary[] {
  const state = getOfflineIngestionState();
  return [...state.countries]
    .sort((a, b) => (a.code === 'VE' ? -1 : b.code === 'VE' ? 1 : a.code.localeCompare(b.code)))
    .map((country) => {
      const docs = state.documents.filter((d) => d.countryCode === country.code);
      const activeTariffs = state.activeTariffsByCountry[country.code] ?? 0;
      return {
        code: country.code,
        name: country.name,
        legislation: country.legislation,
        nomenclatureDigits: country.nomenclatureDigits,
        codeGrouping: country.codeGrouping,
        datasetVersion: country.datasetVersion ?? null,
        isActive: country.isActive,
        publishedDocuments: docs.filter((d) => d.status === 'PUBLISHED').length,
        draftDocuments: docs.filter((d) => d.status === 'DRAFT').length,
        derogatedDocuments: docs.filter((d) => d.status === 'DEROGATED').length,
        activeTariffs,
        embeddedTariffs: activeTariffs,
      };
    });
}

export function upsertOfflineCountry(input: CountryConfigInput): CountryConfigInput {
  const state = getOfflineIngestionState();
  const idx = state.countries.findIndex((c) => c.code === input.code);
  if (idx >= 0) {
    state.countries[idx] = input;
  } else {
    state.countries.push(input);
  }
  return input;
}

export function stageOfflineDocument(input: {
  countryCode: string;
  legalType: LegalDocumentType;
  hierarchyPath: string;
  title: string;
  content: string;
  sourceFile: string | null;
  officialDocumentNumber: string | null;
  decreeNumber: string | null;
  validFromDate: string;
  chunks: LegalChunkDraft[];
}): OfflineIngestionDoc {
  const state = getOfflineIngestionState();
  const doc: OfflineIngestionDoc = {
    id: `offline-doc-${Date.now()}-${state.documents.length + 1}`,
    countryCode: input.countryCode,
    legalType: input.legalType,
    hierarchyPath: input.hierarchyPath,
    title: input.title,
    content: input.content,
    sourceFile: input.sourceFile,
    officialDocumentNumber: input.officialDocumentNumber,
    decreeNumber: input.decreeNumber,
    validFromDate: new Date(input.validFromDate).toISOString(),
    validToDate: null,
    isDerogated: false,
    status: 'DRAFT',
    chunks: input.chunks,
    createdAt: new Date().toISOString(),
  };
  state.documents.unshift(doc);
  return doc;
}

export function listOfflineDocuments(
  countryCode: string,
  status?: LegalDocumentStatus,
): LegalDraftSummary[] {
  return getOfflineIngestionState()
    .documents.filter((d) => d.countryCode === countryCode && (!status || d.status === status))
    .map(toOfflineDraftSummary);
}
