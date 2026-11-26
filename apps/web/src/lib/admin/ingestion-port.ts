import type {
  CountryConfigInput,
  CountryIngestionSummary,
  LegalDocumentStatus,
  LegalDocumentUploadInput,
  LegalDraftDiff,
  LegalDraftSummary,
  PublishDraftResult,
  SignedUploadResponse,
} from '@tariffos/shared-types';

const LARGE_FILE_THRESHOLD_BYTES = 2 * 1024 * 1024;

export interface UploadDocumentClientInput extends LegalDocumentUploadInput {
  file?: File | null;
}

export interface UploadDocumentClientResult {
  queued: boolean;
  document?: LegalDraftSummary;
  parentId?: string;
}

export interface IIngestionAdminPort {
  listCountries(): Promise<CountryIngestionSummary[]>;
  createCountry(input: CountryConfigInput): Promise<CountryConfigInput>;
  listDocuments(countryCode: string, status?: LegalDocumentStatus): Promise<LegalDraftSummary[]>;
  uploadDocument(input: UploadDocumentClientInput): Promise<UploadDocumentClientResult>;
  getDraftDiff(draftId: string): Promise<LegalDraftDiff>;
  publishDraft(draftId: string): Promise<PublishDraftResult>;
  discardDraft(draftId: string): Promise<{ deletedId: string }>;
}

async function readApiError(res: Response, fallback: string): Promise<string> {
  try {
    const json = (await res.json()) as { error?: string };
    return json.error ?? fallback;
  } catch {
    return fallback;
  }
}

export function createHttpIngestionAdminPort(): IIngestionAdminPort {
  return {
    async listCountries() {
      const res = await fetch('/api/admin/ingestion/countries');
      if (!res.ok) throw new Error(await readApiError(res, 'Error cargando países'));
      const json = (await res.json()) as { countries: CountryIngestionSummary[] };
      return json.countries;
    },

    async createCountry(input) {
      const res = await fetch('/api/admin/ingestion/countries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error(await readApiError(res, 'Error guardando país'));
      const json = (await res.json()) as { country: CountryConfigInput };
      return json.country;
    },

    async listDocuments(countryCode, status) {
      const params = new URLSearchParams({ countryCode });
      if (status) params.set('status', status);
      const res = await fetch(`/api/admin/ingestion/documents?${params.toString()}`);
      if (!res.ok) throw new Error(await readApiError(res, 'Error listando documentos'));
      const json = (await res.json()) as { documents: LegalDraftSummary[] };
      return json.documents;
    },

    async uploadDocument({ file, ...metadata }) {
      let payload: LegalDocumentUploadInput = metadata;

      if (file && file.size > LARGE_FILE_THRESHOLD_BYTES) {
        const urlRes = await fetch('/api/admin/ingestion/upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            countryCode: metadata.countryCode,
            fileName: file.name,
            contentType: file.type || 'application/octet-stream',
            fileSizeBytes: file.size,
          }),
        });
        if (!urlRes.ok) throw new Error(await readApiError(urlRes, 'Error solicitando URL de subida'));
        const urlJson = (await urlRes.json()) as SignedUploadResponse;
        if (urlJson.signedUrl && urlJson.storageKey) {
          const putRes = await fetch(urlJson.signedUrl, {
            method: 'PUT',
            headers: { 'Content-Type': file.type || 'application/octet-stream' },
            body: file,
          });
          if (!putRes.ok) throw new Error('Error subiendo archivo al bucket privado');
          payload = { ...metadata, sourceFile: file.name, storageKey: urlJson.storageKey, content: undefined };
        }
      } else if (file) {
        const form = new FormData();
        form.set('file', file);
        form.set('countryCode', metadata.countryCode);
        form.set('legalType', metadata.legalType);
        form.set('hierarchyPath', metadata.hierarchyPath);
        form.set('title', metadata.title);
        form.set('sourceFormat', metadata.sourceFormat);
        form.set('validFromDate', metadata.validFromDate);
        form.set('replaceSameDate', String(metadata.replaceSameDate));
        if (metadata.officialDocumentNumber) form.set('officialDocumentNumber', metadata.officialDocumentNumber);
        if (metadata.decreeNumber) form.set('decreeNumber', metadata.decreeNumber);

        const res = await fetch('/api/admin/ingestion/documents', { method: 'POST', body: form });
        if (!res.ok) throw new Error(await readApiError(res, 'Error cargando archivo'));
        return (await res.json()) as UploadDocumentClientResult;
      }

      const res = await fetch('/api/admin/ingestion/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await readApiError(res, 'Error cargando borrador'));
      return (await res.json()) as UploadDocumentClientResult;
    },

    async getDraftDiff(draftId) {
      const res = await fetch(`/api/admin/ingestion/documents/${draftId}/diff`);
      if (!res.ok) throw new Error(await readApiError(res, 'Error calculando diff'));
      const json = (await res.json()) as { diff: LegalDraftDiff };
      return json.diff;
    },

    async publishDraft(draftId) {
      const res = await fetch(`/api/admin/ingestion/documents/${draftId}/publish`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error(await readApiError(res, 'Error publicando borrador'));
      const json = (await res.json()) as { result: PublishDraftResult };
      return json.result;
    },

    async discardDraft(draftId) {
      const res = await fetch(`/api/admin/ingestion/documents/${draftId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await readApiError(res, 'Error descartando borrador'));
      return (await res.json()) as { deletedId: string };
    },
  };
}
