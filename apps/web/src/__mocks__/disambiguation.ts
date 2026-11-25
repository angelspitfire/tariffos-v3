import { DisambiguationPayload } from '@/types/domain';

export const INITIAL_DISAMBIGUATION: DisambiguationPayload = {
  filingId: 'TR-2024-8849-VE',
  lineItemId: 'item-3',
  itemNumber: 3,
  productDescription: 'Adaptadores y convertidores estáticos de corriente alterna/continua (200 unidades)',
  cifValue: 4650,
  deltaUsd: 232.5,
  recommendedHsCode: '8504.40.20.00',
  candidates: [
    {
      hsCode: '8504.40.90.00',
      description: 'Los demás convertidores estáticos (Fuentes genéricas)',
      dutyRate: 10,
      vatRate: 15,
      fodinfaRate: 1 / 2,
      totalDutyUsd: 1232.25,
      confidence: 62 / 100,
      legalBasis: 'Regla General 1 y 6 del Sistema Armonizado (RGI).',
      rationale:
        'Clasificación por defecto asignada por aforadores cuando no se anexa la ficha técnica de filtrado y conmutación de alta frecuencia.',
      pros: [
        'Aceptación inmediata en canal verde sin inspección técnica intrusiva',
        'Bajo riesgo de sanción por presunción de subvaluación arancelaria',
      ],
      cons: [
        'Tasa arancelaria Ad-Valorem elevada (10% sobre valor CIF)',
        'Sobrecosto fiscal directo de $232.50 USD en la declaración',
      ],
    },
    {
      hsCode: '8504.40.20.00',
      description: 'Fuentes de alimentación conmutadas reguladas para telecomunicaciones e informática',
      dutyRate: 5,
      vatRate: 15,
      fodinfaRate: 1 / 2,
      totalDutyUsd: 999.75,
      confidence: 89 / 100,
      legalBasis: 'Nota 2 de la Sección XVI y Notas Explicativas de la Partida 85.04 OMA.',
      rationale:
        'Aplica si la mercancía cuenta con certificación de eficiencia energética y está diseñada para equipos de conmutación de datos.',
      pros: [
        'Ahorro neto inmediato de $232.50 USD (5% arancel vs 10%)',
        'Alineación con la descripción técnica del fabricante en el invoice',
      ],
      cons: [
        'Exige adjuntar certificado de homologación CONATEL o norma SENCAMER RTE-014',
        'Riesgo de aforo físico si no se presenta el datasheet de fábrica',
      ],
    },
  ],
};
