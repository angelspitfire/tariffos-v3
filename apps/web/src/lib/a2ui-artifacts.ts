import {
  type A2UIArtifact,
  type OrganismPayload,
  type ManifestLineItem,
  type ManifestGridPayload,
  type TaxSummary,
  type DiscrepancyReport,
  type DisambiguationPayload,
} from '@/types/domain';
import {
  INITIAL_MANIFEST,
  INITIAL_TAX_DATA,
  INITIAL_DISCREPANCY,
  SINGLE_ITEM_MOCK,
} from '@/__mocks__';
import { INITIAL_DISAMBIGUATION } from '@/__mocks__';
import { INITIAL_PERMITS_DATA } from '@/__mocks__';
import { INITIAL_EXONERATION_DATA } from '@/__mocks__';
import { INITIAL_DOSSIER_DATA } from '@/__mocks__';
import {
  MOCK_TOTAL_CIF,
  MOCK_TOTAL_DUTIES,
  DELTA_USD_DECIMALS,
  BATCH_ITEM_COUNT,
  FILING_ID,
} from '@/__mocks__';
import { type PermitsMatrixPayload } from '@/types/permits';
import { type ExonerationSimulatorPayload } from '@/types/exoneration';
import { type CustomsDossierPayload } from '@/types/dossier';

export { DEFAULT_BATCH_ARTIFACT, INITIAL_CHAT_MESSAGES } from './initial-chat-state';

export interface ApiToolCallPart {
  type: string;
  text?: string;
  toolName?: string;
  artifactKind?: string;
  result?: unknown;
}

export function parseA2UIArtifact(part: ApiToolCallPart): {
  organism?: OrganismPayload;
  artifact?: A2UIArtifact;
  display?: unknown;
} {
  const kind = part.artifactKind;
  const now = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(new Date());

  if (kind === 'present') {
    // Generative UI "present" tool returns a display tree
    const result = part.result as { display?: unknown } | undefined;
    return {
      organism: undefined,
      artifact: undefined,
      display: result?.display,
    };
  }

  if (kind === 'single-item') {
    const singleData = (part.result as ManifestLineItem) ?? SINGLE_ITEM_MOCK;
    return {
      organism: { kind: 'single-item', data: singleData },
      artifact: {
        id: `art-single-${Date.now()}`,
        type: 'single-item',
        title: `Ficha Arancelaria ${singleData.hsCode}`,
        subtitle: singleData.description,
        badge: 'Partida',
        version: 1,
        timestamp: now,
        data: singleData,
      },
    };
  }

  if (kind === 'tax-breakdown') {
    const taxData = (part.result as TaxSummary) ?? INITIAL_TAX_DATA;
    return {
      organism: { kind: 'tax-summary', data: taxData },
      artifact: {
        id: `art-taxes-${Date.now()}`,
        type: 'tax-breakdown',
        title: 'Liquidación de Tributos',
        subtitle: `Total: $${taxData.totalAmount.toLocaleString()} USD`,
        badge: 'Tributos',
        version: 1,
        timestamp: now,
        data: taxData,
      },
    };
  }

  if (kind === 'discrepancy-audit') {
    const discData = (part.result as DiscrepancyReport) ?? INITIAL_DISCREPANCY;
    return {
      organism: { kind: 'discrepancy-report', data: discData },
      artifact: {
        id: `art-audit-${Date.now()}`,
        type: 'discrepancy-audit',
        title: 'Auditoría Factura vs BoL',
        subtitle: `${discData.discrepancies.length} discrepancias detectadas`,
        badge: 'Auditoría',
        version: 1,
        timestamp: now,
        data: discData,
      },
    };
  }

  if (kind === 'disambiguation') {
    const disamData = (part.result as DisambiguationPayload) ?? INITIAL_DISAMBIGUATION;
    return {
      organism: { kind: 'disambiguation', data: disamData },
      artifact: {
        id: `art-disam-${Date.now()}`,
        type: 'disambiguation',
        title: `Arbitraje Arancelario Línea #${disamData.itemNumber}`,
        subtitle: `Δ $${disamData.deltaUsd.toFixed(DELTA_USD_DECIMALS)} USD · ${disamData.recommendedHsCode}`,
        badge: 'Arbitraje',
        version: 1,
        timestamp: now,
        data: disamData,
      },
    };
  }

  if (kind === 'permits-matrix') {
    const permitsData = (part.result as PermitsMatrixPayload) ?? INITIAL_PERMITS_DATA;
    return {
      organism: { kind: 'permits-matrix', data: permitsData },
      artifact: {
        id: `art-permits-${Date.now()}`,
        type: 'permits-matrix',
        title: 'Matriz de Vistos Buenos',
        subtitle: `${permitsData.totalPermits} requisitos · ${permitsData.blockingCount} bloqueante(s)`,
        badge: 'Vistos Buenos',
        version: 1,
        timestamp: now,
        data: permitsData,
      },
    };
  }

  if (kind === 'exoneration-simulator') {
    const exonData = (part.result as ExonerationSimulatorPayload) ?? INITIAL_EXONERATION_DATA;
    return {
      organism: { kind: 'exoneration-simulator', data: exonData },
      artifact: {
        id: `art-exon-${Date.now()}`,
        type: 'exoneration-simulator',
        title: 'Simulador de Acuerdos TLC',
        subtitle: `Desgravación arancelaria · Base CIF $${exonData.cifUsd.toLocaleString()}`,
        badge: 'TLC / Alivio',
        version: 1,
        timestamp: now,
        data: exonData,
      },
    };
  }

  if (kind === 'customs-dossier') {
    const dossierData = (part.result as CustomsDossierPayload) ?? INITIAL_DOSSIER_DATA;
    return {
      organism: { kind: 'customs-dossier', data: dossierData },
      artifact: {
        id: `art-dossier-${Date.now()}`,
        type: 'customs-dossier',
        title: 'Expediente Oficial de Clasificación',
        subtitle: `${dossierData.dossierNumber} · ${dossierData.items.length} partidas`,
        badge: 'Dictamen Oficial',
        version: 1,
        timestamp: now,
        data: dossierData,
      },
    };
  }

  const batchData = (part.result as ManifestGridPayload) ?? {
    filingId: FILING_ID,
    mode: 'batch',
    items: INITIAL_MANIFEST,
    totalCif: MOCK_TOTAL_CIF,
    totalDuties: MOCK_TOTAL_DUTIES,
  };
  return {
    organism: { kind: 'manifest-grid', data: batchData },
    artifact: {
      id: `art-batch-${Date.now()}`,
      type: 'batch-manifest',
      title: 'Manifiesto de Carga (Lote)',
      subtitle: `${batchData.items.length} partidas procesadas`,
      badge: `Lote (${BATCH_ITEM_COUNT})`,
      version: 1,
      timestamp: now,
      data: batchData,
    },
  };
}
