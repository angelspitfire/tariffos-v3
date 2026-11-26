import type { A2UIEnvelope, JurisdictionConfig } from '@tariffos/shared-types';
import { buildIndustrialBatchItems, buildSolarBatchItems } from './offline-batch-data';

export function buildOfflineBatchEnvelope(
  query: string,
  jurisdiction: JurisdictionConfig,
  documentName?: string,
): A2UIEnvelope {
  const isIndustrial = /bomba|v[aá]lvula|packing|industrial/i.test(
    `${query} ${documentName ?? ''}`,
  );
  const vat = jurisdiction.defaultVatPercent;
  const currency = jurisdiction.currencyCode;
  const items = isIndustrial
    ? buildIndustrialBatchItems(currency, vat)
    : buildSolarBatchItems(currency, vat);

  const pendingCount = items.filter((i) => i.status === 'needs_review').length;
  const docRef =
    documentName ?? (isIndustrial ? 'PL-2026-4410' : 'INV-2026-0918 / MSCU-VE-884210');

  return {
    assistantMessage: `Procesé el manifiesto con ${items.length} ítems para ${jurisdiction.country} (${jurisdiction.authority}). ${items.length - pendingCount} ítems quedaron clasificados con alta confianza y ${pendingCount} requieren confirmación rápida en el triage del Canvas.`,
    classificationStatus: 'classified',
    workflowState: pendingCount > 0 ? 'proposed_review' : 'classified',
    decision: {
      mode: 'batch',
      outcome: pendingCount > 0 ? 'proposed_review' : 'classified',
      confidencePct: 84,
      reason: `${pendingCount} ítems requieren validación puntual de atributos críticos.`,
      missingCriticalFields: [],
      clarifyingQuestions: [],
      autoClassifiedCount: items.length - pendingCount,
      proposedReviewCount: pendingCount,
    },
    inlineComponents: [
      {
        type: 'document_summary',
        id: `doc-sum-${Date.now()}`,
        docTypesDetected: isIndustrial
          ? ['Packing List', 'Ficha Técnica']
          : ['Bill of Lading', 'Factura Comercial'],
        documentReference: docRef,
        shipper: isIndustrial ? 'EUROFLOW GMBH (GERMANY)' : 'SHENZHEN SOLARGRID TECH CO., LTD',
        consignee: isIndustrial ? 'MANUFACTURAS VALENCIA C.A.' : 'ENERGÍA ANDINA C.A.',
        routeOrIncoterm: isIndustrial ? 'FOB Hamburgo' : 'CIF Puerto Cabello',
        totalPackages: isIndustrial ? '6 Wooden Crates' : '42 Pallets',
        grossWeight: isIndustrial ? '1,140 KG' : '4,820 KG',
        totalDeclaredValue: `${currency} ${items.reduce((s, i) => s + i.fobValue, 0).toLocaleString('en-US')}`,
        itemsCount: items.length,
        isBatch: true,
      },
    ],
    canvasComponents: [
      {
        type: 'batch_manifest',
        id: `batch-${Date.now()}`,
        title: isIndustrial
          ? 'Manifiesto Industrial · Packing List PL-2026-4410'
          : 'Manifiesto Kit Solar · Factura INV-2026-0918',
        documentReference: docRef,
        currencyCode: currency,
        items,
      },
    ],
  };
}
