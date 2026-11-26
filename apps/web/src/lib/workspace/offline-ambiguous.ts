import type { A2UIEnvelope, JurisdictionConfig } from '@tariffos/shared-types';
import { buildDefaultMerceologicalSheet } from './merceological-helpers';

export function isAmbiguousMotorQuery(query: string): boolean {
  const q = query.toLowerCase();
  const mentionsMotor = /motor\s+el[eé]ctric|motor\s+trif[aá]sic/.test(q);
  const hasPowerSpec = /\d+(\.\d+)?\s*(kw|hp|w\b|cv)/i.test(q);
  return mentionsMotor && !hasPowerSpec;
}

export function buildAmbiguousMotorEnvelope(
  query: string,
  jurisdiction: JurisdictionConfig
): A2UIEnvelope {
  const sheet = buildDefaultMerceologicalSheet('Motor eléctrico trifásico para bomba industrial', {
    naturaleza_materia: 'Carcasa de hierro fundido, devanado de cobre',
    funcion_uso: 'Accionamiento de bomba centrífuga industrial',
    principio_funcionamiento: 'Corriente alterna (CA) polifásico / trifásico',
    estado_elaboracion: 'Nuevo, unidad completa',
  });

  const idSeed = Date.now();
  return {
    assistantMessage: `Para asignar la subpartida exacta a 10 dígitos en ${jurisdiction.country} (${jurisdiction.authority}) necesito confirmar la potencia nominal en kW del motor eléctrico (la subpartida 8501.51 / 8501.52 / 8501.53 se divide estrictamente por potencia).`,
    classificationStatus: 'needs_details',
    workflowState: 'needs_input',
    decision: {
      mode: 'individual',
      outcome: 'needs_input',
      confidencePct: 64,
      reason: 'Falta potencia nominal (W/kW) para desdoblar la subpartida 8501.5x bajo RGI 6.',
      missingCriticalFields: ['Potencia nominal (kW / HP)'],
      clarifyingQuestions: [
        {
          id: 'q-power',
          question: 'Rango de potencia nominal del motor trifásico',
          fieldKey: 'especificaciones_tecnicas',
          inputType: 'select',
          options: ['≤ 750 W (8501.51)', '> 750 W hasta 75 kW (8501.52)', '> 75 kW (8501.53)'],
          critical: true,
        },
      ],
      tentativeProposal: {
        hsCode: '8501.52.10.00',
        title: 'Motores CA polifásicos de potencia > 750 W y ≤ 75 kW (jaula de ardilla)',
        confidencePct: 64,
        reason: 'Rango más habitual para bombas industriales 220/440V.',
      },
    },
    merceologicalSheet: sheet,
    inlineComponents: [
      {
        type: 'merceological_sheet',
        id: `sheet-hitl-${idSeed}`,
        mode: 'hitl_validation',
        title: 'Ficha Merceológica · Validación HITL',
        subtitle: query,
        sheet,
        allowWebEnrich: true,
      },
      {
        type: 'disambiguation',
        id: `disamb-${idSeed}`,
        question: '¿Cuál es el rango de potencia nominal del motor eléctrico trifásico?',
        contextHint: 'Define directamente la subpartida SA (RGI 6) en el Capítulo 85.',
        options: [
          {
            id: 'opt-850151',
            label: 'Potencia inferior o igual a 750 W (≤ 1 HP)',
            technicalDetail: 'Motores de corriente alterna polifásicos de baja potencia.',
            suggestedHsHint: '8501.51.00.00',
          },
          {
            id: 'opt-850152',
            label: 'Potencia superior a 750 W pero ≤ 75 kW (1 – 100 HP)',
            technicalDetail: 'Rango industrial estándar para bombas y compresores trifásicos.',
            suggestedHsHint: '8501.52.10.00',
          },
          {
            id: 'opt-850153',
            label: 'Potencia superior a 75 kW (> 100 HP)',
            technicalDetail: 'Motores trifásicos de alta potencia para bombeo pesado.',
            suggestedHsHint: '8501.53.10.00',
          },
        ],
      },
      {
        type: 'questionnaire',
        id: `quest-${idSeed}`,
        title: 'Parámetros técnicos complementarios',
        fields: [
          {
            id: 'f-rotor',
            label: 'Tipo de rotor',
            fieldType: 'select',
            options: ['Jaula de ardilla', 'Rotor bobinado', 'Síncrono'],
          },
          {
            id: 'f-power-kw',
            label: 'Potencia exacta',
            fieldType: 'number',
            unit: 'kW',
            placeholder: 'Ej. 5.5',
          },
        ],
      },
    ],
    canvasComponents: [],
  };
}
