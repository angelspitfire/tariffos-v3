import { ManifestLineItem, TaxSummary, DiscrepancyReport } from '@/types/domain';

export const SINGLE_ITEM_MOCK: ManifestLineItem = {
  id: 'single-power-supply',
  itemNumber: 1,
  hsCode: '8504.40.90.00',
  description: 'Fuentes de alimentación conmutadas 220V 500W con PFC activo para servidores',
  quantity: 50,
  unit: 'U',
  fobValue: 3750,
  cifValue: 4100,
  dutyRate: 5,
  vatRate: 15,
  confidence: 92 / 100,
  permits: ['SENCAMER-RTE-014', 'CONATEL-NO-OBJECTION'],
  justification:
    'Aparato eléctrico para conversión de energía estática conmutada según Regla General Interpretativa 1 y Nota 2(b) de la Sección XVI.',
  candidates: [
    {
      hsCode: '8504.40.90.00',
      description: 'Los demás convertidores estáticos',
      dutyRate: 5,
      confidence: 92 / 100,
      rationale: 'Subpartida arancelaria ecuatoriana exacta para fuentes industriales conmutadas.',
    },
    {
      hsCode: '8471.80.00.00',
      description: 'Las demás unidades para máquinas automáticas de tratamiento de datos',
      dutyRate: 0,
      confidence: 58 / 100,
      rationale:
        'Descartada: no realiza función computacional directa, sino de suministro de potencia.',
    },
  ],
};

export const INITIAL_MANIFEST: ManifestLineItem[] = [
  {
    id: 'item-1',
    itemNumber: 1,
    hsCode: '8471.30.00.00',
    description: 'Computadoras portátiles de peso inferior o igual a 10 kg',
    quantity: 120,
    unit: 'U',
    fobValue: 72000,
    cifValue: 75400,
    dutyRate: 0,
    vatRate: 15,
    confidence: 94 / 100,
    permits: ['SENCAMER-001'],
    justification: 'Máquinas automáticas para tratamiento o procesamiento de datos digitales portátiles.',
  },
  {
    id: 'item-2',
    itemNumber: 2,
    hsCode: '8528.52.00.00',
    description: 'Monitores capaces de conectarse directamente a máquinas automáticas',
    quantity: 80,
    unit: 'U',
    fobValue: 18400,
    cifValue: 19800,
    dutyRate: 5,
    vatRate: 15,
    confidence: 88 / 100,
    permits: [],
    justification: 'Aparatos de visualización con entrada digital directa HDMI/DisplayPort.',
  },
  {
    id: 'item-3',
    itemNumber: 3,
    hsCode: '8504.40.90.00',
    description: 'Adaptadores y convertidores estáticos de corriente alterna/continua',
    quantity: 200,
    unit: 'U',
    fobValue: 4200,
    cifValue: 4650,
    dutyRate: 10,
    vatRate: 15,
    confidence: 62 / 100,
    permits: ['CONATEL-REQ'],
    justification: 'Convertidor con discrepancia en tasa ad-valorem entre 5% y 10%.',
  },
];

export const INITIAL_TAX_DATA: TaxSummary = {
  id: 'LIQ-8849-01',
  vendor: 'Shenzhen Tech Logistics Ltd.',
  invoiceId: 'INV-2024-9981',
  currency: 'USD',
  totalAmount: 16962.5,
  dueDate: '2024-11-30',
  status: 'pending',
  breakdown: [
    { concept: 'Base Imponible Total (CIF)', rate: 0, amount: 99850 },
    { concept: 'Arancel Ad-Valorem (0% - 10%)', rate: 1.46, amount: 1455.0 },
    { concept: 'FODINFA (Fondo Desarrollo Infantil)', rate: 1 / 2, amount: 499.25 },
    { concept: 'IVA Aduanero', rate: 15.0, amount: 15008.25 },
  ],
};

export const INITIAL_DISCREPANCY: DiscrepancyReport = {
  filingId: 'TR-2024-8849-VE',
  title: 'Auditoría Cruzada: Factura vs Bill of Lading',
  discrepancies: [
    {
      id: 'disc-1',
      severity: 'critical',
      field: 'Peso Bruto Total (Gross Weight)',
      expected: '1,450.00 kg',
      found: '1,620.00 kg (+11.7%)',
      recommendation: 'Verificar si se incluyeron pallets adicionales en el embarque de BoL.',
    },
    {
      id: 'disc-2',
      severity: 'medium',
      field: 'Partida Adaptadores Corriente',
      expected: '8504.40.90.00 (10%)',
      found: '8504.40.20.00 (5%) sugerida por ficha',
      recommendation: 'Revisar ficha técnica para aplicar exención de tasa arancelaria reducida.',
    },
  ],
};
