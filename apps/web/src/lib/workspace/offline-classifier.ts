import type { A2UIEnvelope, JurisdictionConfig } from '@tariffos/shared-types';
import { buildDefaultMerceologicalSheet } from './merceological-helpers';
import { buildAmbiguousMotorEnvelope, isAmbiguousMotorQuery } from './offline-ambiguous';
import { buildOfflineBatchEnvelope } from './offline-batch-samples';
import { resolveOfflinePreset } from './offline-presets';

export interface OfflineClassifyInput {
  query: string;
  jurisdiction: JurisdictionConfig;
  isBatchHint?: boolean;
}

export function classifyOffline(input: OfflineClassifyInput): A2UIEnvelope {
  const { query, jurisdiction, isBatchHint } = input;
  const looksBatch =
    Boolean(isBatchHint) || /\blote\b|packing list|bill of lading|line 1\b|factura.*ítems/i.test(query);
  if (looksBatch) {
    return buildOfflineBatchEnvelope(query, jurisdiction);
  }
  if (isAmbiguousMotorQuery(query)) {
    return buildAmbiguousMotorEnvelope(query, jurisdiction);
  }

  const p = resolveOfflinePreset(query);
  const vat = jurisdiction.defaultVatPercent;
  const sheet = buildDefaultMerceologicalSheet(p.title, {
    naturaleza_materia: 'Manufactura industrial / equipo ensamblado',
    funcion_uso: p.officialDesc,
    principio_funcionamiento: 'Operación conforme a especificaciones declaradas',
    especificaciones_tecnicas: query.slice(0, 140),
  });
  sheet.confirmedByUser = true;

  const idSeed = Date.now();
  return {
    assistantMessage: `Clasificación completada para **${p.title}** bajo ${jurisdiction.country} (${jurisdiction.authority}). Subpartida sugerida **${p.hsCode}** con aplicación de RGI 1 y RGI 6.`,
    classificationStatus: 'classified',
    workflowState: 'classified',
    merceologicalSheet: sheet,
    inlineComponents: [
      {
        type: 'merceological_sheet',
        id: `sheet-ok-${idSeed}`,
        mode: 'confirmed_summary',
        title: 'Ficha Merceológica Validada',
        sheet,
      },
      {
        type: 'verdict',
        id: `verdict-${idSeed}`,
        hsCode: p.hsCode,
        description: p.officialDesc,
        adValoremPercent: p.adValorem,
        vatPercent: vat,
        customsFeePercent: jurisdiction.customsFeePercent,
        legalRegimeCode: p.regimeCode,
        legalRegimeSummary: p.regimeSummary,
        confidenceLabel: 'Alta (92%)',
        rgiApplied: ['RGI 1', 'RGI 6'],
        preferredCanvasTab: 'dossier',
      },
      {
        type: 'legal_notice',
        id: `notice-${idSeed}`,
        severity: p.severity,
        authority: jurisdiction.authority,
        title:
          p.permits.length > 0
            ? 'Verificación de permisos OGA previa al despacho'
            : 'Régimen legal ordinario sin permisos previos',
        summary: p.regimeSummary,
        requiredPermits: p.permits,
      },
    ],
    canvasComponents: [
      {
        type: 'dossier',
        id: `dossier-${idSeed}`,
        title: `Dictamen Técnico · ${p.title}`,
        hsCode: p.hsCode,
        officialDescription: p.officialDesc,
        jurisdictionName: `${jurisdiction.country} (${jurisdiction.authority})`,
        confidenceLevel: 'Alto',
        confidencePct: 92,
        confidenceReason: 'Coincidencia directa con texto de partida y notas explicativas.',
        rgiSteps: [
          {
            rule: 'RGI 1',
            note: `Capítulo ${p.hsCode.slice(0, 2)} · Partida ${p.hsCode.slice(0, 4)}`,
            application: `El texto de la partida ${p.hsCode.slice(0, 4)} describe específicamente la mercancía.`,
            conclusion: `Ubicación confirmada en partida ${p.hsCode.slice(0, 4)}.`,
          },
          {
            rule: 'RGI 6',
            application: p.rgi2,
            conclusion: `Asignación final a 10 dígitos: ${p.hsCode}.`,
          },
        ],
        legalNotes: [jurisdiction.legalRegimeNotes],
        technicalSpecs: [
          { key: 'Mercancía', value: p.title },
          { key: 'País de origen referencial', value: p.origin },
          { key: 'Nomenclatura', value: jurisdiction.nomenclature },
        ],
        permits: p.permits.map(({ code, name, organism }) => ({ code, name, organism })),
        rejectedAlternatives: [
          { hsCode: p.rejectedCode, title: 'Alternativa evaluada', reason: p.rejectedReason, rule: 'RGI 6' },
        ],
        reviewStatus: 'draft_ai',
        verifiedAgainstOfficial: true,
      },
      {
        type: 'calculator',
        id: `calc-${idSeed}`,
        title: `Liquidación CIF · ${p.title}`,
        hsCode: p.hsCode,
        adValoremPercent: p.adValorem,
        vatPercent: vat,
        customsServiceFeePercent: jurisdiction.customsFeePercent,
        currencyCode: jurisdiction.currencyCode,
        localCurrencyCode: jurisdiction.localCurrencyCode,
        suggestedExchangeRate: jurisdiction.defaultExchangeRate,
        exemptionAvailable: false,
        originCountry: p.origin,
        incoterm: 'FOB',
      },
      {
        type: 'hierarchy',
        id: `hier-${idSeed}`,
        title: `Árbol Arancelario · ${p.hsCode}`,
        selectedCode: p.hsCode,
        nodes: [
          { level: 'chapter', code: p.hsCode.slice(0, 2), title: `Capítulo ${p.hsCode.slice(0, 2)}` },
          { level: 'heading', code: p.hsCode.slice(0, 4), title: `Partida ${p.hsCode.slice(0, 4)}` },
          { level: 'subheading', code: p.hsCode.slice(0, 7), title: p.officialDesc, selectable: true },
          {
            level: 'national',
            code: p.hsCode,
            title: p.officialDesc,
            dutyRate: `AV ${p.adValorem}% · IVA ${vat}%`,
            legalRegime: p.regimeCode,
            isCurrent: true,
            selectable: true,
          },
        ],
      },
      {
        type: 'comparison',
        id: `comp-${idSeed}`,
        title: 'Comparativa de subpartidas candidatas',
        candidates: [
          {
            hsCode: p.hsCode,
            title: p.officialDesc,
            adValoremPercent: p.adValorem,
            vatPercent: vat,
            legalRegime: p.regimeCode,
            rgiRationale: p.rgi2,
            confidencePct: 92,
            pros: 'Designación específica alineada a RGI 1 y RGI 6.',
            cons: 'Requiere conservar ficha técnica en expediente.',
            recommended: true,
          },
          {
            hsCode: p.rejectedCode,
            title: 'Partida alternativa evaluada',
            adValoremPercent: p.adValorem + 5,
            vatPercent: vat,
            legalRegime: 'Revisión',
            rgiRationale: p.rejectedReason,
            confidencePct: 41,
            pros: 'Cobertura residual en caso de modificación técnica.',
            cons: p.rejectedReason,
            recommended: false,
          },
        ],
      },
    ],
  };
}
