import { describe, expect, it } from 'vitest';
import {
  CountryConfigInputSchema,
  CountryIngestionSummarySchema,
  IngestionSourceFormatSchema,
  LegalDocumentStatusSchema,
  LegalDocumentTypeSchema,
  LegalDocumentUploadInputSchema,
  LegalDraftDiffSchema,
  LegalDraftSummarySchema,
  PublishDraftResultSchema,
  SignedUploadRequestSchema,
  SignedUploadResponseSchema,
  TariffRowChangeSchema,
} from '../legal-ingestion.js';

describe('legal-ingestion contracts', () => {
  it('validates legal document types, statuses, and source formats', () => {
    expect(LegalDocumentTypeSchema.parse('LEGAL_NOTE')).toBe('LEGAL_NOTE');
    expect(LegalDocumentTypeSchema.parse('TARIFF_SCHEDULE')).toBe('TARIFF_SCHEDULE');
    expect(LegalDocumentStatusSchema.parse('DRAFT')).toBe('DRAFT');
    expect(IngestionSourceFormatSchema.parse('tariff_csv')).toBe('tariff_csv');
    expect(() => IngestionSourceFormatSchema.parse('docx')).toThrow();
  });

  it('validates CountryConfigInputSchema and checks codeGrouping digit sum', () => {
    const validVe = CountryConfigInputSchema.parse({
      code: 've',
      name: 'Venezuela',
      legislation: 'Decreto N° 4.944 / GOE N° 6.804',
      nomenclatureDigits: 10,
      codeGrouping: '4.2.2.2',
    });
    expect(validVe.code).toBe('VE');
    expect(validVe.isActive).toBe(true);

    expect(() =>
      CountryConfigInputSchema.parse({
        code: 'VE',
        name: 'Venezuela',
        legislation: 'Decreto',
        nomenclatureDigits: 10,
        codeGrouping: '4.2.2',
      }),
    ).toThrow();

    expect(() =>
      CountryConfigInputSchema.parse({
        code: 'VEN',
        name: 'Venezuela',
        legislation: 'Decreto',
        nomenclatureDigits: 10,
        codeGrouping: '4.2.2.2',
      }),
    ).toThrow();
  });

  it('defaults LegalDocumentUploadInputSchema to VE and requires content or storageKey', () => {
    const valid = LegalDocumentUploadInputSchema.parse({
      legalType: 'LEGAL_NOTE',
      hierarchyPath: 'loa',
      title: 'Ley Orgánica de Aduanas',
      sourceFormat: 'markdown',
      validFromDate: '2020-01-29',
      content: 'Artículo 1. Objeto.',
    });
    expect(valid.countryCode).toBe('VE');
    expect(valid.replaceSameDate).toBe(false);

    const validStorage = LegalDocumentUploadInputSchema.parse({
      legalType: 'CHAPTER',
      hierarchyPath: '85',
      title: 'Capítulo 85',
      sourceFormat: 'pdf',
      validFromDate: '2024-04-25T00:00:00.000Z',
      storageKey: 'VE/123-cap85.pdf',
    });
    expect(validStorage.storageKey).toBe('VE/123-cap85.pdf');

    expect(() =>
      LegalDocumentUploadInputSchema.parse({
        legalType: 'LEGAL_NOTE',
        hierarchyPath: 'loa',
        title: 'Sin cuerpo',
        sourceFormat: 'txt',
        validFromDate: '2024-04-25',
      }),
    ).toThrow();
  });

  it('validates summary, signed upload, diff, and publish schemas', () => {
    const countrySummary = CountryIngestionSummarySchema.parse({
      code: 'VE',
      name: 'Venezuela',
      legislation: 'Decreto 4.944',
      nomenclatureDigits: 10,
      codeGrouping: '4.2.2.2',
      datasetVersion: '2026.1',
      isActive: true,
      publishedDocuments: 4,
      draftDocuments: 1,
      derogatedDocuments: 2,
      activeTariffs: 9800,
      embeddedTariffs: 9800,
    });
    expect(countrySummary.activeTariffs).toBe(9800);

    expect(
      SignedUploadRequestSchema.parse({
        countryCode: 'VE',
        fileName: 'gaceta-6804.pdf',
        contentType: 'application/pdf',
        fileSizeBytes: 12_000_000,
      }).countryCode,
    ).toBe('VE');

    expect(
      SignedUploadResponseSchema.parse({
        mode: 'cloud',
        directInline: false,
        storageKey: 'VE/gaceta-6804.pdf',
        signedUrl: 'https://example.supabase.co/upload',
      }).storageKey,
    ).toBe('VE/gaceta-6804.pdf');

    const draft = LegalDraftSummarySchema.parse({
      id: 'doc-1',
      countryCode: 'VE',
      legalType: 'LEGAL_NOTE',
      hierarchyPath: 'loa',
      title: 'LOA 2020',
      sourceFile: 'loa.pdf',
      officialDocumentNumber: 'GOE 6.507',
      decreeNumber: 'Decreto 1',
      validFromDate: '2020-01-29T00:00:00.000Z',
      validToDate: null,
      isDerogated: false,
      status: 'DRAFT',
      chunkCount: 12,
      embeddedChunkCount: 0,
      createdAt: '2026-11-26T00:00:00.000Z',
    });
    expect(draft.status).toBe('DRAFT');

    const tariffChange = TariffRowChangeSchema.parse({
      hsCode: '8504.40.90.00',
      changeType: 'modified',
      description: 'Inversores',
      fieldsChanged: ['adValorem'],
      beforeAdValorem: 10,
      afterAdValorem: 14,
    });
    expect(tariffChange.fieldsChanged).toEqual(['adValorem']);

    const diff = LegalDraftDiffSchema.parse({
      draftId: 'doc-1',
      countryCode: 'VE',
      legalType: 'LEGAL_NOTE',
      hierarchyPath: 'loa',
      kind: 'legal',
      overlappingPublished: [],
      addedChunks: 2,
      modifiedChunks: 1,
      removedChunks: 0,
      affectedHsCodes: ['8504.40'],
      sampleChanges: [{ status: 'added', heading: 'Art. 1', ruleNumber: '1', preview: 'Texto', scope: ['8504.40'] }],
    });
    expect(diff.addedChunks).toBe(2);

    expect(
      PublishDraftResultSchema.parse({
        publishedId: 'doc-1',
        countryCode: 'VE',
        legalType: 'LEGAL_NOTE',
        hierarchyPath: 'loa',
        status: 'PUBLISHED',
        derogatedCount: 1,
        derogatedIds: ['doc-0'],
        indexingEnqueued: true,
      }).derogatedCount,
    ).toBe(1);
  });
});
