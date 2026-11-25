/**
 * Fixtures de ingesta fuera del golden set (F2-34).
 *
 * 10 muestras de documento declaradas explícitamente con sus Claim[] y
 * GoodsSheet esperados. Se ejecutan sin modelo: usan extractores basados en
 * reglas. Deterministas.
 */

import type { Claim } from '../domain/intake.js';
import type { GoodsSheet, Source, SheetField } from '../domain/sheet.js';

/** Fuente de prueba compartida. */
export const FIXTURE_SOURCE: Source = { kind: 'text', ref: 'fixture-000' };

function sheetField(value: string, method: 'declared' | 'absent', source: Source | null = null): SheetField {
  return { value, unit: null, source, method };
}

function emptySheet(): GoodsSheet {
  return {
    what: sheetField('', 'absent'),
    madeOf: sheetField('', 'absent'),
    howMade: sheetField('', 'absent'),
    purpose: sheetField('', 'absent'),
    presentation: sheetField('', 'absent'),
  };
}

export interface IntakeFixture {
  id: string;
  text: string;
  docType: 'invoice' | 'packing' | 'bol' | 'datasheet' | 'catalog' | 'unknown';
  expectedClaims: Claim[];
  expectedSheet: GoodsSheet;
}

export const FIXTURES: IntakeFixture[] = [
  {
    id: 'inv-001',
    text: 'FACTURA NÚMERO 1001 - descripción: camisa de algodón - total 45.00 USD - cantidad: 10 u',
    docType: 'invoice',
    expectedClaims: [
      { value: '45.00', unit: 'USD', target: null, source: FIXTURE_SOURCE, method: 'rule', confidence: 'medium' },
      { value: '10', unit: 'u', target: null, source: FIXTURE_SOURCE, method: 'rule', confidence: 'medium' },
      { value: 'camisa de algodón', unit: null, target: 'what', source: FIXTURE_SOURCE, method: 'rule', confidence: 'medium' },
    ],
    expectedSheet: {
      ...emptySheet(),
      what: sheetField('camisa de algodón', 'declared', FIXTURE_SOURCE),
    },
  },
  {
    id: 'pack-002',
    text: 'PACKING LIST - peso neto: 5.5 kg - peso bruto: 6.0 kg - bultos: 20 u - presentación: granel',
    docType: 'packing',
    expectedClaims: [
      { value: '5.5', unit: 'kg', target: null, source: FIXTURE_SOURCE, method: 'rule', confidence: 'medium' },
      { value: '6.0', unit: 'kg', target: null, source: FIXTURE_SOURCE, method: 'rule', confidence: 'medium' },
      { value: '20', unit: 'u', target: null, source: FIXTURE_SOURCE, method: 'rule', confidence: 'medium' },
      { value: 'granel', unit: null, target: 'presentation', source: FIXTURE_SOURCE, method: 'rule', confidence: 'medium' },
    ],
    expectedSheet: {
      ...emptySheet(),
      presentation: sheetField('granel', 'declared', FIXTURE_SOURCE),
    },
  },
  {
    id: 'bol-003',
    text: 'BILL OF LADING - origen: Shanghai - destino: Santos - modo: marítimo - bultos: 50 u',
    docType: 'bol',
    expectedClaims: [
      { value: 'Shanghai', unit: null, target: null, source: FIXTURE_SOURCE, method: 'rule', confidence: 'medium' },
      { value: 'Santos', unit: null, target: null, source: FIXTURE_SOURCE, method: 'rule', confidence: 'medium' },
      { value: 'marítimo', unit: null, target: null, source: FIXTURE_SOURCE, method: 'rule', confidence: 'medium' },
      { value: '50', unit: 'u', target: null, source: FIXTURE_SOURCE, method: 'rule', confidence: 'medium' },
    ],
    expectedSheet: emptySheet(),
  },
  {
    id: 'ds-004',
    text: 'FICHA TÉCNICA - composición: 70% algodón - proceso: hilado - uso: vestido',
    docType: 'datasheet',
    expectedClaims: [
      { value: '70%', unit: null, target: 'madeOf', source: FIXTURE_SOURCE, method: 'rule', confidence: 'medium' },
      { value: 'hilado', unit: null, target: 'howMade', source: FIXTURE_SOURCE, method: 'rule', confidence: 'medium' },
      { value: 'vestido', unit: null, target: 'purpose', source: FIXTURE_SOURCE, method: 'rule', confidence: 'medium' },
    ],
    expectedSheet: {
      ...emptySheet(),
      madeOf: sheetField('70%', 'declared', FIXTURE_SOURCE),
      howMade: sheetField('hilado', 'declared', FIXTURE_SOURCE),
      purpose: sheetField('vestido', 'declared', FIXTURE_SOURCE),
    },
  },
  {
    id: 'cat-005',
    text: 'CATÁLOGO OTOÑO 2026 - camisa de algodón - polo de poliester',
    docType: 'catalog',
    expectedClaims: [
      { value: 'camisa', unit: null, target: 'what', source: FIXTURE_SOURCE, method: 'rule', confidence: 'medium' },
      { value: 'algodón', unit: null, target: 'madeOf', source: FIXTURE_SOURCE, method: 'rule', confidence: 'medium' },
      { value: 'polo', unit: null, target: 'what', source: FIXTURE_SOURCE, method: 'rule', confidence: 'medium' },
      { value: 'poliester', unit: null, target: 'madeOf', source: FIXTURE_SOURCE, method: 'rule', confidence: 'medium' },
    ],
    expectedSheet: {
      ...emptySheet(),
      what: sheetField('camisa', 'declared', FIXTURE_SOURCE),
      madeOf: sheetField('algodón', 'declared', FIXTURE_SOURCE),
    },
  },
  {
    id: 'inv-006',
    text: 'factura de servicios - descripción: consultoría informática - total 1200.00 EUR',
    docType: 'invoice',
    expectedClaims: [
      { value: '1200.00', unit: 'EUR', target: null, source: FIXTURE_SOURCE, method: 'rule', confidence: 'medium' },
      { value: 'consultoría informática', unit: null, target: 'what', source: FIXTURE_SOURCE, method: 'rule', confidence: 'medium' },
    ],
    expectedSheet: {
      ...emptySheet(),
      what: sheetField('consultoría informática', 'declared', FIXTURE_SOURCE),
    },
  },
  {
    id: 'pack-007',
    text: 'lista de empaque del envío - peso neto: 12 kg - bultos: 5 u - presentación: retail',
    docType: 'packing',
    expectedClaims: [
      { value: '12', unit: 'kg', target: null, source: FIXTURE_SOURCE, method: 'rule', confidence: 'medium' },
      { value: '5', unit: 'u', target: null, source: FIXTURE_SOURCE, method: 'rule', confidence: 'medium' },
      { value: 'retail', unit: null, target: 'presentation', source: FIXTURE_SOURCE, method: 'rule', confidence: 'medium' },
    ],
    expectedSheet: {
      ...emptySheet(),
      presentation: sheetField('retail', 'declared', FIXTURE_SOURCE),
    },
  },
  {
    id: 'bol-008',
    text: 'conocimiento de embarque B/L - origen: Róterdam - destino: Buenos Aires - modo: marítimo',
    docType: 'bol',
    expectedClaims: [
      { value: 'Róterdam', unit: null, target: null, source: FIXTURE_SOURCE, method: 'rule', confidence: 'medium' },
      { value: 'Buenos Aires', unit: null, target: null, source: FIXTURE_SOURCE, method: 'rule', confidence: 'medium' },
      { value: 'marítimo', unit: null, target: null, source: FIXTURE_SOURCE, method: 'rule', confidence: 'medium' },
    ],
    expectedSheet: emptySheet(),
  },
  {
    id: 'ds-009',
    text: 'datasheet del producto - composición: 60% poliester 40% algodón - uso: ropa deportiva',
    docType: 'datasheet',
    expectedClaims: [
      { value: '60%', unit: null, target: 'madeOf', source: FIXTURE_SOURCE, method: 'rule', confidence: 'medium' },
      { value: '40%', unit: null, target: 'madeOf', source: FIXTURE_SOURCE, method: 'rule', confidence: 'medium' },
      { value: 'ropa deportiva', unit: null, target: 'purpose', source: FIXTURE_SOURCE, method: 'rule', confidence: 'medium' },
    ],
    expectedSheet: {
      ...emptySheet(),
      madeOf: sheetField('60%', 'declared', FIXTURE_SOURCE),
      purpose: sheetField('ropa deportiva', 'declared', FIXTURE_SOURCE),
    },
  },
  {
    id: 'unk-010',
    text: 'texto sin clasificación clara de documento - producto genérico',
    docType: 'unknown',
    expectedClaims: [],
    expectedSheet: emptySheet(),
  },
];

/** Número total de fixtures (constante nombrada). */
export const FIXTURE_COUNT = FIXTURES.length;
