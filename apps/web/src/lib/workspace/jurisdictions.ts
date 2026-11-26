import type { JurisdictionConfig } from '@tariffos/shared-types';

export const JURISDICTIONS: readonly JurisdictionConfig[] = [
  {
    id: 've-seniat',
    countryCode: 'VE',
    country: 'Venezuela',
    authority: 'SENIAT',
    nomenclature: 'Arancel de Aduanas Consolidado 2026 (Decreto 4.944 y reformas 5.103–5.198)',
    codeDigits: '10 dígitos (XXXX.XX.XX.XX)',
    pilot: true,
    defaultVatPercent: 16,
    customsFeePercent: 1,
    currencyCode: 'USD',
    localCurrencyCode: 'VES',
    defaultExchangeRate: 46.5,
    legalRegimeNotes:
      'Arancel NCM 10 dígitos Consolidado 2026 (Decreto 4.944 + Decretos 5.103, 5.122, 5.147 y 5.198). Regímenes Legales 1–21 y OGA/PGA (SACS, INSAI, SENCAMER, CONATEL). Tasa Aduanera 1% CIF · IVA 16%.',
  },
  {
    id: 'co-dian',
    countryCode: 'CO',
    country: 'Colombia',
    authority: 'DIAN',
    nomenclature: 'Arancel de Aduanas de Colombia (Decreto 1881 · NANDINA)',
    codeDigits: '10 dígitos (XXXX.XX.XX.XX)',
    defaultVatPercent: 19,
    customsFeePercent: 0,
    currencyCode: 'USD',
    localCurrencyCode: 'COP',
    defaultExchangeRate: 4350,
    legalRegimeNotes:
      'Visto bueno VUCE (INVIMA, ICA, ANLA, SIC, MinComercio). Gravamen Arancelario Ad Valorem e IVA general del 19%.',
  },
  {
    id: 'mx-tigie',
    countryCode: 'MX',
    country: 'México',
    authority: 'ANAM / SAT',
    nomenclature: 'TIGIE + NICO',
    codeDigits: '8 dígitos + 2 NICO (XXXX.XX.XX.XX)',
    defaultVatPercent: 16,
    customsFeePercent: 0.8,
    currencyCode: 'USD',
    localCurrencyCode: 'MXN',
    defaultExchangeRate: 20.1,
    legalRegimeNotes:
      'Fracción arancelaria a 8 dígitos más NICO (2 dígitos). RRNA: NOMs, COFEPRIS, SENASICA, SE. DTA 0.8% · IVA 16%.',
  },
  {
    id: 'us-htsus',
    countryCode: 'US',
    country: 'Estados Unidos',
    authority: 'CBP / USITC',
    nomenclature: 'HTSUS (Harmonized Tariff Schedule)',
    codeDigits: '10 dígitos (XXXX.XX.XXXX)',
    defaultVatPercent: 0,
    customsFeePercent: 0.3464,
    currencyCode: 'USD',
    localCurrencyCode: 'USD',
    defaultExchangeRate: 1,
    legalRegimeNotes:
      'Column 1 General vs Special (USMCA/FTA), Section 301 para origen CN, MPF 0.3464% y agencias PGA (FDA, FCC, EPA, CPSC).',
  },
  {
    id: 'eu-taric',
    countryCode: 'EU',
    country: 'Unión Europea',
    authority: 'Aduanas UE / TARIC',
    nomenclature: 'Nomenclatura Combinada (NC) / TARIC',
    codeDigits: '10 dígitos (XXXX XX XX XX)',
    defaultVatPercent: 21,
    customsFeePercent: 0,
    currencyCode: 'EUR',
    localCurrencyCode: 'EUR',
    defaultExchangeRate: 1,
    legalRegimeNotes:
      'Arancel Aduanero Común (TEC), medidas TARIC, marcado CE, certificados EUR.1, CBAM e IVA de importación referencial (21%).',
  },
  {
    id: 'oma-hs',
    countryCode: 'WO',
    country: 'Global (OMA)',
    authority: 'Organización Mundial de Aduanas',
    nomenclature: 'Sistema Armonizado (SA / HS 2022)',
    codeDigits: '6 dígitos internacionales (XXXX.XX)',
    defaultVatPercent: 0,
    customsFeePercent: 0,
    currencyCode: 'USD',
    localCurrencyCode: 'USD',
    defaultExchangeRate: 1,
    legalRegimeNotes:
      'Clasificación internacional estándar a 6 dígitos (Subpartida SA 2022) con aplicación estricta de RGI 1 a 6 y Notas Legales.',
  },
];

export interface SampleMerchandise {
  id: string;
  label: string;
  category: string;
  description: string;
  origin: string;
  hsHint: string;
}

export const SAMPLE_MERCHANDISE: readonly SampleMerchandise[] = [
  {
    id: 'ecografo',
    label: 'Ecógrafo portátil Doppler',
    category: 'Equipo médico',
    description:
      'Sistema de diagnóstico por ultrasonido Doppler a color portátil con pantalla LCD de 15 pulgadas, 2 transductores convexo y lineal, voltaje 110-240V, uso clínico hospitalario.',
    origin: 'Alemania',
    hsHint: '9018.12',
  },
  {
    id: 'inversor',
    label: 'Inversor solar híbrido 5 kW',
    category: 'Energía y potencia',
    description:
      'Inversor cargador solar híbrido onda sinusoidal pura 5000W 48V DC a 110/220V AC con controlador MPPT integrado de 100A para sistemas fotovoltaicos.',
    origin: 'China',
    hsHint: '8504.40',
  },
  {
    id: 'cafe',
    label: 'Café tostado molido 500g',
    category: 'Alimentos y bebidas',
    description:
      'Café arábica 100% tostado y molido, sin descafeinar, en empaque metalizado con válvula desgasificadora de 500 gramos netos para venta al por menor.',
    origin: 'Colombia',
    hsHint: '0901.21',
  },
  {
    id: 'motor-ambiguo',
    label: 'Motor eléctrico (caso ambiguo HITL)',
    category: 'Maquinaria industrial',
    description: 'Motor eléctrico trifásico para bomba industrial, carcasa de hierro.',
    origin: 'Brasil',
    hsHint: '8501.5x',
  },
];

export interface SampleBatchDocument {
  id: string;
  label: string;
  docTypes: string;
  itemsCount: number;
  filename: string;
  promptText: string;
  documentText: string;
}

export const SAMPLE_BATCH_DOCUMENTS: readonly SampleBatchDocument[] = [
  {
    id: 'bl-invoice-solar',
    label: 'Lote B/L + Factura (Kit Solar · 4 ítems)',
    docTypes: 'Bill of Lading · Factura Comercial',
    itemsCount: 4,
    filename: 'BL_INV_SOLAR_PTOCABELLO.txt',
    promptText:
      'Clasificar en lote este embarque amparado por Bill of Lading y Factura Comercial (Kit Solar 4 ítems) con destino Puerto Cabello.',
    documentText: [
      'BILL OF LADING NO: MSCU-VE-884210 | SHIPPER: SHENZHEN SOLARGRID TECH CO., LTD',
      'CONSIGNEE: ENERGÍA ANDINA C.A. | INCOTERM: CIF PUERTO CABELLO | GROSS WEIGHT: 4,820 KG',
      'LINE 1 | SKU SG-INV5K | Inversor solar híbrido 5 kW 48V DC / 120V AC MPPT 100A | QTY: 12 PCS | FOB: USD 5,040.00',
      'LINE 2 | SKU SG-BAT51 | Batería recargable LiFePO4 48V 100Ah | QTY: 12 PCS | FOB: USD 10,800.00',
      'LINE 3 | SKU SG-PV550 | Panel solar fotovoltaico monocristalino 550W | QTY: 80 PCS | FOB: USD 9,600.00',
      'LINE 4 | SKU SG-CAB6 | Cable eléctrico fotovoltaico cobre estañado 6 mm2 | QTY: 40 ROLLS | FOB: USD 2,960.00',
    ].join('\n'),
  },
  {
    id: 'packing-tech-industrial',
    label: 'Lote Packing List (Industrial · 3 ítems)',
    docTypes: 'Packing List · Ficha Técnica',
    itemsCount: 3,
    filename: 'PACKING_TECH_INDUSTRIAL.txt',
    promptText:
      'Clasificar en lote los 3 ítems industriales del Packing List con correlación técnica.',
    documentText: [
      'PACKING LIST NO: PL-2026-4410 | EXPORTER: EUROFLOW GMBH (GERMANY)',
      'ITEM 1 | Bomba centrífuga multietapa acero inoxidable 316L 5.5 kW | QTY: 2 UNITS | FOB: USD 6,400.00',
      'ITEM 2 | Válvula de bola bridada acero inoxidable 2 pulgadas ANSI 150 | QTY: 15 PCS | FOB: USD 2,850.00',
      'ITEM 3 | Juego de pastillas de freno cerámica sin amianto para montacargas | QTY: 60 SETS | FOB: USD 2,100.00',
    ].join('\n'),
  },
];

export function getJurisdictionById(id: string): JurisdictionConfig {
  return JURISDICTIONS.find((j) => j.id === id) ?? JURISDICTIONS[0];
}
