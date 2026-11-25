import { CustomsDossierPayload } from '@/types/dossier';

export const INITIAL_DOSSIER_DATA: CustomsDossierPayload = {
  filingId: 'TR-2024-8849-VE',
  dossierNumber: 'EXP-SENIAT-2024-8849-CL',
  issueDate: '14 de Noviembre de 2024',
  customsDistrict: 'Aduana Principal de La Guaira (SENIAT)',
  importerName: 'Tech Import Venezuela C.A.',
  importerRuc: 'J-12345678-9',
  customsBroker: 'Lic. Carlos Mendoza (Agente de Aduana Reg. SENIAT #0442)',
  regimeApplied: 'Acuerdo PARCIAL ALADI Venezuela - UE (Desgravamen Arancelario 100%)',
  totalCifUsd: 99850,
  totalDutiesUsd: 1222.5,
  totalSavingsUsd: 1455.0,
  verificationStatus: 'ready_to_transmit',
  conclusiveOpinion:
    'Se dictamina la procedencia jurídica y arancelaria de las subpartidas declaradas para el embarque procedente de Shanghai, con fundamento en las Reglas Generales Interpretativas 1 y 6 del Sistema Armonizado y las Notas Legales de la Sección XVI.',
  items: [
    {
      itemNumber: 1,
      hsCode: '8471.30.00.00',
      description: 'Computadoras portátiles de peso inferior o igual a 10 kg',
      quantity: 120,
      cifValue: 75400,
      dutyRate: 0,
      confidence: 94 / 100,
    },
    {
      itemNumber: 2,
      hsCode: '8528.52.00.00',
      description: 'Monitores capaces de conectarse directamente a máquinas automáticas',
      quantity: 80,
      cifValue: 19800,
      dutyRate: 5,
      confidence: 88 / 100,
    },
    {
      itemNumber: 3,
      hsCode: '8504.40.20.00',
      description: 'Fuentes de alimentación conmutadas reguladas para telecomunicaciones',
      quantity: 200,
      cifValue: 4650,
      dutyRate: 5,
      confidence: 89 / 100,
    },
  ],
  legalClauses: [
    {
      rule: 'RGI 1 (Regla General Interpretativa 1)',
      title: 'Clasificación por textos de partida y Notas Legales',
      text: 'Los títulos de las Secciones o Capítulos solo tienen un valor indicativo; la clasificación está determinada legalmente por los textos de las partidas y de las Notas de Sección o de Capítulo.',
    },
    {
      rule: 'RGI 6 (Regla General Interpretativa 6)',
      title: 'Clasificación a nivel de subpartida (10 dígitos)',
      text: 'La clasificación de mercancías en las subpartidas de una misma partida está determinada legalmente por los textos de estas subpartidas y de las Notas de subpartida del Sistema Armonizado OMA.',
    },
    {
      rule: 'Nota Legal 2 - Sección XVI',
      title: 'Partes y piezas de máquinas eléctricas',
      text: 'Los convertidores estáticos conmutados y unidades funcionales de potencia se clasifican en la partida 85.04 con independencia del equipo anfitrión al que se conecten.',
    },
  ],
  permitsCount: 5,
  requiredPreClearanceDocs: [
    'Factura Comercial Definitiva N° INV-2024-9981 con firma electrónica',
    'Conocimiento de Embarque Marítimo (Bill of Lading) N° MSK-9812-VE',
    'Certificado de Conformidad SENCAMER (Validado VUCE)',
    'Certificado de Origen Acuerdo PARCIAL UE / EUR.1 emitido por exportador autorizado',
    'Ficha Técnica de Homologación CONATEL para fuentes conmutadas',
  ],
};
