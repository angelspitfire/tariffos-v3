import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type {
  CountryIngestionSummary,
  LegalDraftDiff,
  LegalDraftSummary,
} from '@tariffos/shared-types';
import type { IIngestionAdminPort } from '@/lib/admin/ingestion-port';
import { AdminIngestionWorkspace } from '../organisms/AdminIngestionWorkspace';

function createFakePort(): IIngestionAdminPort {
  const countries: CountryIngestionSummary[] = [
    {
      code: 'VE',
      name: 'Venezuela',
      legislation: 'Decreto N° 4.944 / GOE N° 6.804',
      nomenclatureDigits: 10,
      codeGrouping: '4.2.2.2',
      datasetVersion: 'Consolidado 2026',
      isActive: true,
      publishedDocuments: 1,
      draftDocuments: 0,
      derogatedDocuments: 0,
      activeTariffs: 9800,
      embeddedTariffs: 9800,
    },
  ];
  let docs: LegalDraftSummary[] = [
    {
      id: 'pub-loa',
      countryCode: 'VE',
      legalType: 'LEGAL_NOTE',
      hierarchyPath: 'loa',
      title: 'LOA Vigente 2020',
      sourceFile: 'loa.pdf',
      officialDocumentNumber: 'GOE 6.507',
      decreeNumber: 'Decreto 1',
      validFromDate: '2020-01-29T00:00:00.000Z',
      validToDate: null,
      isDerogated: false,
      status: 'PUBLISHED',
      chunkCount: 10,
      embeddedChunkCount: 10,
      createdAt: '2026-11-25T00:00:00.000Z',
    },
  ];

  const diffSample: LegalDraftDiff = {
    draftId: 'draft-loa-2026',
    countryCode: 'VE',
    legalType: 'LEGAL_NOTE',
    hierarchyPath: 'loa',
    kind: 'legal',
    overlappingPublished: [
      {
        id: 'pub-loa',
        title: 'LOA Vigente 2020',
        decreeNumber: 'Decreto 1',
        validFromDate: '2020-01-29T00:00:00.000Z',
      },
    ],
    addedChunks: 1,
    modifiedChunks: 0,
    removedChunks: 0,
    affectedHsCodes: ['8517.62'],
    sampleChanges: [
      {
        status: 'added',
        heading: 'LOA Reforma 2026',
        ruleNumber: '1',
        preview: 'Artículo 1. Regla para 8517.62.',
        scope: ['8517.62'],
      },
    ],
  };

  return {
    listCountries: vi.fn(async () => countries),
    createCountry: vi.fn(async (input) => ({
      ...input,
      datasetVersion: input.datasetVersion ?? null,
      publishedDocuments: 0,
      draftDocuments: 0,
      derogatedDocuments: 0,
      activeTariffs: 0,
      embeddedTariffs: 0,
    })),
    listDocuments: vi.fn(async () => docs),
    uploadDocument: vi.fn(async (input) => {
      const staged: LegalDraftSummary = {
        id: 'draft-loa-2026',
        countryCode: input.countryCode,
        legalType: input.legalType,
        hierarchyPath: input.hierarchyPath,
        title: input.title,
        sourceFile: input.sourceFile ?? null,
        officialDocumentNumber: input.officialDocumentNumber ?? null,
        decreeNumber: input.decreeNumber ?? null,
        validFromDate: '2026-06-01T00:00:00.000Z',
        validToDate: null,
        isDerogated: false,
        status: 'DRAFT',
        chunkCount: 1,
        embeddedChunkCount: 0,
        createdAt: '2026-11-26T00:00:00.000Z',
      };
      docs = [staged, ...docs];
      return { queued: false, document: staged };
    }),
    getDraftDiff: vi.fn(async () => diffSample),
    publishDraft: vi.fn(async (id: string) => {
      docs = docs.map((d) =>
        d.id === id
          ? { ...d, status: 'PUBLISHED', embeddedChunkCount: d.chunkCount }
          : d.id === 'pub-loa'
            ? { ...d, status: 'DEROGATED', isDerogated: true }
            : d,
      );
      return {
        publishedId: id,
        countryCode: 'VE',
        legalType: 'LEGAL_NOTE' as const,
        hierarchyPath: 'loa',
        status: 'PUBLISHED' as const,
        derogatedCount: 1,
        derogatedIds: ['pub-loa'],
        indexingEnqueued: true,
      };
    }),
    discardDraft: vi.fn(async (id) => {
      docs = docs.filter((d) => d.id !== id);
      return { deletedId: id };
    }),
  };
}

describe('AdminIngestionWorkspace', () => {
  it('defaults to VE, stages a markdown draft, opens diff preview, and publishes while derogating prior version', async () => {
    const user = userEvent.setup();
    const port = createFakePort();

    render(<AdminIngestionWorkspace ingestionPort={port} />);

    await waitFor(() => {
      expect(screen.getByText(/Venezuela/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/Título del instrumento/i), 'LOA Reforma 2026');
    await user.type(
      screen.getByLabelText(/Contenido legal/i),
      'Artículo 1. Nueva regla para la subpartida 8517.62.',
    );
    await user.click(screen.getByRole('button', { name: /Cargar borrador/i }));

    await waitFor(() => {
      expect(screen.getByText('LOA Reforma 2026')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /Ver Diff \/ Publicar/i }));

    await waitFor(() => {
      expect(screen.getByText(/LOA Vigente 2020/i)).toBeInTheDocument();
      expect(screen.getByText('8517.62')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /Publicar y derogar versión anterior/i }));

    await waitFor(() => {
      expect(port.publishDraft).toHaveBeenCalledWith('draft-loa-2026');
    });
    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent(/Publicados/i);
    expect(screen.getByText('LOA Reforma 2026')).toBeInTheDocument();
  });
});
