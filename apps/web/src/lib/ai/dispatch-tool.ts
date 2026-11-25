/**
 * Synchronous keyword-based tool dispatcher for mock chat streaming.
 * Maps user queries in Spanish/English to domain tools with mock payloads.
 */

import {
  INITIAL_MANIFEST,
  INITIAL_TAX_DATA,
  INITIAL_DISCREPANCY,
  SINGLE_ITEM_MOCK,
  INITIAL_DISAMBIGUATION,
  INITIAL_PERMITS_DATA,
  INITIAL_EXONERATION_DATA,
  INITIAL_DOSSIER_DATA,
  MOCK_TOTAL_CIF,
  MOCK_TOTAL_DUTIES,
  MOCK_DELTA_USD,
  MOCK_EXONERATION_SAVINGS,
  SINGLE_ITEM_CONFIDENCE_PERCENT,
  DISCREPANCY_COUNT,
  FAVORABLE_DUTY_RATE_PERCENT,
  GENERIC_DUTY_RATE_PERCENT,
  DUTY_RELIEF_PERCENT,
  BATCH_ITEM_COUNT,
  DELTA_USD_DECIMALS,
  FILING_ID,
} from '@/__mocks__';
import { PresentDisplaySchema, PresentToolSchema } from './tools';

export interface IncomingPart {
  type: string;
  text?: string;
}

export interface IncomingMessage {
  role: string;
  content: string | IncomingPart[];
}

export interface ToolDispatchResult {
  toolName: string | null;
  toolArgs: Record<string, unknown>;
  toolResult: unknown;
  textResponse: string;
  artifactKind: string;
}

export function dispatchTool(userText: string): ToolDispatchResult {
  const q = userText.toLowerCase();
  let textResponse = 'He analizado tu consulta sobre el trámite aduanero TR-2024-8849-VE.';
  let toolName: string | null = null;
  let toolArgs: Record<string, unknown> = {};
  let toolResult: unknown = null;
  let artifactKind = 'batch-manifest';

  if (q.includes('present') || q.includes('display as') || q.includes('render') ||
      ((q.includes('grid') || q.includes('stack') || q.includes('card')) && !q.includes('tax') && !q.includes('tribut'))) {
    toolName = 'present';
    artifactKind = 'present';
    const display = PresentDisplaySchema.parse({
      type: 'grid',
      title: 'Resumen de Despacho Aduanero',
      props: { filingId: FILING_ID },
    });
    toolResult = PresentToolSchema.parse({ display });
    textResponse = 'Estructura de visualización generada para el despacho aduanero:';
  } else if (q.includes('individual') || q.includes('single') || q.includes('power supply') || q.includes('fuente') || q.includes('servidor') || q.includes('ficha')) {
    toolName = 'classify_single_item';
    artifactKind = 'single-item';
    toolArgs = { description: 'Fuentes conmutadas 220V 500W para servidores' };
    toolResult = SINGLE_ITEM_MOCK;
    textResponse = `Clasificación arancelaria individual: Subpartida 8504.40.90.00 asignada con ${SINGLE_ITEM_CONFIDENCE_PERCENT}% de certeza conforme a RGI 1.`;
  } else if (q.includes('tax') || q.includes('tribut') || q.includes('liquidac') || q.includes('duty') || q.includes('arancel')) {
    toolName = 'calculate_taxes';
    artifactKind = 'tax-breakdown';
    toolArgs = { filingId: FILING_ID };
    toolResult = INITIAL_TAX_DATA;
    textResponse = 'Liquidación de tributos en cascada calculada según las subpartidas arancelarias activas:';
  } else if (q.includes('discrep') || q.includes('bol') || q.includes('audit') || q.includes('factura') || q.includes('invoice')) {
    toolName = 'audit_discrepancies';
    artifactKind = 'discrepancy-audit';
    toolArgs = { filingId: FILING_ID };
    toolResult = INITIAL_DISCREPANCY;
    textResponse = `He detectado ${DISCREPANCY_COUNT} discrepancias documentales entre la factura comercial y el conocimiento de embarque (BoL):`;
  } else if (q.includes('arbitra') || q.includes('doubt') || q.includes('arbitration') || q.includes('conflic') || q.includes('compar') || q.includes('alternat') || q.includes('8504.40') || q.includes('adaptador') || q.includes('adapter')) {
    toolName = 'resolve_disambiguation';
    artifactKind = 'disambiguation';
    toolArgs = { lineItemId: 'item-3' };
    toolResult = INITIAL_DISAMBIGUATION;
    textResponse = `He analizado el conflicto arancelario en Línea #3 (Adaptadores). Existe opción favorable al ${FAVORABLE_DUTY_RATE_PERCENT}% con un diferencial de $${MOCK_DELTA_USD.toFixed(DELTA_USD_DECIMALS)} USD frente a la tarifa genérica del ${GENERIC_DUTY_RATE_PERCENT}%.`;
  } else if (q.includes('permit') || q.includes('vistos buenos') || q.includes('visto bueno') || q.includes('approval') || q.includes('regul') || q.includes('inen') || q.includes('arcotel') || q.includes('arcsa') || q.includes('mipro') || q.includes('conatel') || q.includes('canal rojo')) {
    toolName = 'verify_permits_compliance';
    artifactKind = 'permits-matrix';
    toolArgs = { filingId: FILING_ID };
    toolResult = INITIAL_PERMITS_DATA;
    textResponse = 'Verificación de requisitos no arancelarios en Ventanilla Única: 1 requisito bloqueante de CONATEL en Línea #3 suspende la nacionalización.';
  } else if (q.includes('exoner') || q.includes('acuerdo') || q.includes('tlc') || q.includes('simulador') || q.includes('fta') || q.includes('desgravac') || q.includes('relief')) {
    toolName = 'simulate_exonerations';
    artifactKind = 'exoneration-simulator';
    toolArgs = { filingId: FILING_ID };
    toolResult = INITIAL_EXONERATION_DATA;
    textResponse = `Proyección de liquidación con acuerdos comerciales (TLC UE / CAN): ${DUTY_RELIEF_PERCENT}% de desgravación Ad-Valorem con ahorro de $${MOCK_EXONERATION_SAVINGS.toFixed(DELTA_USD_DECIMALS)} USD.`;
  } else if (q.includes('dossier') || q.includes('expediente') || q.includes('dictamen') || q.includes('informe') || q.includes('opinion') || q.includes('report') || q.includes('document')) {
    toolName = 'generate_customs_dossier';
    artifactKind = 'customs-dossier';
    toolArgs = { filingId: FILING_ID };
    toolResult = INITIAL_DOSSIER_DATA;
    textResponse = 'Expediente Oficial de Clasificación Arancelaria (EXP-SENIAT-2024-8849-CL) consolidado con dictamen técnico-legal, vistos buenos y liquidación final.';
  } else {
    toolName = 'classify_batch_manifest';
    artifactKind = 'batch-manifest';
    toolArgs = { filingId: FILING_ID };
    toolResult = {
      filingId: FILING_ID,
      mode: 'batch',
      items: INITIAL_MANIFEST,
      totalCif: MOCK_TOTAL_CIF,
      totalDuties: MOCK_TOTAL_DUTIES,
    };
    textResponse = `Resumen completo del lote (${BATCH_ITEM_COUNT} partidas) del manifiesto de carga:`;
  }

  return { toolName, toolArgs, toolResult, textResponse, artifactKind };
}
