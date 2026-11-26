import {
  chunkLegalDocument,
  extractPdfTextFromBuffer,
  getCountryByCode,
  parseTariffSchedule,
  prisma,
  stageLegalDocumentDraft,
} from '@tariffos/database';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { inngest } from './client';
import {
  LEGAL_DOCUMENTS_BUCKET,
  type LegalDocumentUploadedEventData,
} from './legal-ingestion-helpers';

const COUNTRY_CONCURRENCY = 2;

async function loadDocumentPayload(
  data: LegalDocumentUploadedEventData,
): Promise<{ text: string }> {
  if (data.content?.trim()) {
    return { text: data.content };
  }
  if (!data.storageKey) {
    throw new Error('Ni content ni storageKey fueron provistos para ingestLegalDocumentFn');
  }

  const supabase = createSupabaseAdminClient();
  const { data: blob, error } = await supabase.storage
    .from(LEGAL_DOCUMENTS_BUCKET)
    .download(data.storageKey);

  if (error || !blob) {
    throw new Error(`No se pudo descargar ${data.storageKey}: ${error?.message ?? 'archivo vacío'}`);
  }

  const bytes = new Uint8Array(await blob.arrayBuffer());
  if (data.sourceFormat === 'pdf') {
    const extracted = await extractPdfTextFromBuffer(bytes);
    return { text: extracted.text };
  }
  return { text: new TextDecoder('utf-8').decode(bytes) };
}

export const ingestLegalDocumentFn = inngest.createFunction(
  {
    id: 'ingest-legal-document',
    retries: 2,
    concurrency: [{ limit: COUNTRY_CONCURRENCY, key: 'event.data.countryCode' }],
    triggers: [{ event: 'legal/document.uploaded' }],
  },
  async ({ event, step }) => {
    const data = event.data as LegalDocumentUploadedEventData;

    const staged = await step.run('extract-and-stage-draft', async () => {
      const { text } = await loadDocumentPayload(data);
      const validFromDate = new Date(data.validFromDate);

      if (data.legalType === 'TARIFF_SCHEDULE') {
        const country = await getCountryByCode(data.countryCode, prisma);
        const format = data.sourceFormat === 'tariff_csv' ? 'tariff_csv' : 'tariff_json';
        const parsed = parseTariffSchedule(text, format, country);
        if (parsed.rows.length === 0) {
          throw new Error(parsed.errors[0] ?? 'Arancel sin filas válidas');
        }
        return stageLegalDocumentDraft(prisma, {
          countryCode: data.countryCode,
          legalType: 'TARIFF_SCHEDULE',
          hierarchyPath: data.hierarchyPath,
          title: data.title,
          content: JSON.stringify(parsed.rows),
          sourceFile: data.sourceFile ?? data.storageKey ?? null,
          officialDocumentNumber: data.officialDocumentNumber ?? null,
          decreeNumber: data.decreeNumber ?? null,
          validFromDate,
          replaceSameDate: data.replaceSameDate,
          chunks: [],
        });
      }

      const format = data.sourceFormat === 'pdf' || data.sourceFormat === 'markdown' ? data.sourceFormat : 'txt';
      const chunks = chunkLegalDocument({
        title: data.title,
        content: text,
        format,
      });

      return stageLegalDocumentDraft(prisma, {
        countryCode: data.countryCode,
        legalType: data.legalType,
        hierarchyPath: data.hierarchyPath,
        title: data.title,
        content: text,
        sourceFile: data.sourceFile ?? data.storageKey ?? null,
        officialDocumentNumber: data.officialDocumentNumber ?? null,
        decreeNumber: data.decreeNumber ?? null,
        validFromDate,
        replaceSameDate: data.replaceSameDate,
        chunks,
      });
    });

    return {
      parentId: staged.parentId,
      chunkCount: staged.chunkCount,
      status: 'DRAFT' as const,
    };
  },
);
