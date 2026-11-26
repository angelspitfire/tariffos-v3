import type {
  CountryConfigInput,
  LegalDocumentStatus,
  LegalDocumentType,
} from '@tariffos/shared-types';
import type { LegalChunkDraft } from '@tariffos/database';

export interface OfflineIngestionDoc {
  id: string;
  countryCode: string;
  legalType: LegalDocumentType;
  hierarchyPath: string;
  title: string;
  content: string;
  sourceFile: string | null;
  officialDocumentNumber: string | null;
  decreeNumber: string | null;
  validFromDate: string;
  validToDate: string | null;
  isDerogated: boolean;
  status: LegalDocumentStatus;
  chunks: LegalChunkDraft[];
  createdAt: string;
}

export interface OfflineIngestionState {
  countries: CountryConfigInput[];
  documents: OfflineIngestionDoc[];
  activeTariffsByCountry: Record<string, number>;
}

export function createInitialOfflineIngestionState(): OfflineIngestionState {
  return {
    countries: [
      {
        code: 'VE',
        name: 'Venezuela',
        legislation: 'Decreto N° 4.944 (Gaceta Oficial Extraordinaria N° 6.804)',
        nomenclatureDigits: 10,
        codeGrouping: '4.2.2.2',
        datasetVersion: 'Consolidado 2026',
        isActive: true,
      },
    ],
    activeTariffsByCountry: { VE: 9800 },
    documents: [
      {
        id: 've-loa-published',
        countryCode: 'VE',
        legalType: 'LEGAL_NOTE',
        hierarchyPath: 'loa',
        title: 'Ley Orgánica de Aduanas (Vigente)',
        content: 'Artículo 1. Derechos y obligaciones aduaneras en la partida 8504.40.',
        sourceFile: 'loa-2020.pdf',
        officialDocumentNumber: 'Gaceta Oficial 6.507',
        decreeNumber: 'Decreto Constituyente',
        validFromDate: '2020-01-29T00:00:00.000Z',
        validToDate: null,
        isDerogated: false,
        status: 'PUBLISHED',
        chunks: [
          {
            heading: 'Ley Orgánica de Aduanas (Vigente)',
            ruleNumber: '1',
            content: 'Artículo 1. Derechos y obligaciones aduaneras en la partida 8504.40.',
            scope: ['8504.40'],
            chunkIndex: 0,
          },
        ],
        createdAt: '2026-11-25T10:00:00.000Z',
      },
      {
        id: 've-cap85-draft',
        countryCode: 'VE',
        legalType: 'CHAPTER',
        hierarchyPath: '85',
        title: 'Capítulo 85 — Notas Actualizadas 2026',
        content: '1. Este Capítulo comprende las máquinas y aparatos eléctricos de la partida 85.04.',
        sourceFile: 'cap-85-2026.md',
        officialDocumentNumber: 'GOE 6.804',
        decreeNumber: 'Decreto N° 4.944',
        validFromDate: '2026-01-15T00:00:00.000Z',
        validToDate: null,
        isDerogated: false,
        status: 'DRAFT',
        chunks: [
          {
            heading: 'Capítulo 85 — Notas Actualizadas 2026',
            ruleNumber: '1',
            content: '1. Este Capítulo comprende las máquinas y aparatos eléctricos de la partida 85.04.',
            scope: ['85.04'],
            chunkIndex: 0,
          },
        ],
        createdAt: '2026-11-26T12:00:00.000Z',
      },
    ],
  };
}
