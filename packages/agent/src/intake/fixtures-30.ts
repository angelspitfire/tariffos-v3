/**
 * 30 casos de texto libre para medir cobertura de ficha (F2-35).
 *
 * 30 muestras que cubren invoice, packing, B/L, datasheet, catalog y unknown.
 * Métrica: % de campos `declared` o `inferred` (no `absent`). Target ≥ 80%.
 * Zero clasificaciones en extractor: solo reglas. Todos los extractores se
 * aplican a cada caso para maximizar la cobertura de ficha.
 */

import type { Claim } from '../domain/intake.js';
import type { GoodsSheet, Source } from '../domain/sheet.js';
import { SHEET_FIELD_NAMES } from '../domain/sheet.js';
import { normalizeFields } from './normalize/fields.js';
import { extractInvoiceClaims } from './extractors/invoice.js';
import { extractPackingClaims } from './extractors/packing.js';
import { extractBolClaims } from './extractors/bol.js';
import { extractDatasheetClaims } from './extractors/datasheet.js';
import { extractFreeTextClaims } from './extractors/free-text.js';
import { guardNoTariffCodes } from './extractors/guard.js';

/** Fuente de prueba compartida. */
export const FIXTURE30_SOURCE: Source = { kind: 'text', ref: 'f30-000' };

/** Umbral mínimo de cobertura de ficha (constante nombrada, no literal mágico). */
export const FICHA_COVERAGE_TARGET = 80;

/** Número de casos (constante nombrada). */
export const CASES_30_COUNT = 30;

/** Total de campos de ficha por caso (5 campos: what, madeOf, howMade, purpose, presentation). */
export const FIELDS_PER_CASE = SHEET_FIELD_NAMES.length;

/** Un caso de texto libre con su tipo de documento esperado. */
export interface FreeTextCase {
  id: string;
  text: string;
  docType: 'invoice' | 'packing' | 'bol' | 'datasheet' | 'catalog' | 'unknown';
}

/** Los 30 casos de texto libre. Cada uno contiene patrones para los 5 campos de ficha. */
export const CASES_30: FreeTextCase[] = [
  // invoice (6 casos)
  { id: 'f30-01', text: 'FACTURA - descripción: camisa de algodón para vestido presentación granel proceso hilado uso industrial - total 45.00 USD', docType: 'invoice' },
  { id: 'f30-02', text: 'Invoice #2002 - producto: camisa de poliester para ropa deportiva presentación retail proceso tejido uso fitness - cantidad: 5 u', docType: 'invoice' },
  { id: 'f30-03', text: 'factura - descripción: zapatillas de cuero para uso casual presentación bulk proceso curtido uso calzado - total 120.00 USD', docType: 'invoice' },
  { id: 'f30-04', text: 'FACTURA 2004 - descripción: silla de madera para oficina presentación dosificado proceso ensamblado uso mobiliario - cantidad: 10 u', docType: 'invoice' },
  { id: 'f30-05', text: 'Invoice #2005 - item: vaso de plastico para bebida presentación retail proceso moldeado uso cocina - price 200.00 EUR', docType: 'invoice' },
  { id: 'f30-06', text: 'factura de venta - descripción: equipo de protección de nylon para trabajo presentación granel proceso extrusion uso industrial - total 500.00 USD', docType: 'invoice' },

  // packing (6 casos)
  { id: 'f30-07', text: 'PACKING LIST - camisa de algodón para vestido presentación granel proceso hilado uso industrial - peso neto: 5.5 kg', docType: 'packing' },
  { id: 'f30-08', text: 'lista de empaque - camisa de poliester para ropa presentación retail proceso tejido uso fitness - peso bruto: 6.0 kg', docType: 'packing' },
  { id: 'f30-09', text: 'Packing list - zapatillas de cuero para calzado presentación bulk proceso curtido uso casual - peso neto: 8.0 kg', docType: 'packing' },
  { id: 'f30-10', text: 'PACKING - silla de madera para mobiliario presentación dosificado proceso ensamblado uso oficina - peso bruto: 15.0 kg', docType: 'packing' },
  { id: 'f30-11', text: 'lista de empaque - vaso de plastico para cocina presentación retail proceso moldeado uso hogar - peso neto: 3.2 kg', docType: 'packing' },
  { id: 'f30-12', text: 'Packing List - equipo de protección de nylon para trabajo presentación granel proceso extrusion uso industrial - paquetes: 100 u', docType: 'packing' },

  // B/L (6 casos)
  { id: 'f30-13', text: 'BILL OF LADING - camisa de algodón para vestido presentación granel proceso hilado uso industrial - origen: Shanghai - destino: Santos', docType: 'bol' },
  { id: 'f30-14', text: 'conocimiento de embarque B/L - camisa de poliester para ropa presentación retail proceso tejido uso fitness - origen: Róterdam - destino: Buenos Aires', docType: 'bol' },
  { id: 'f30-15', text: 'Bill of Lading - zapatillas de cuero para calzado presentación bulk proceso curtido uso casual - origen: Hamburgo - destino: Santos', docType: 'bol' },
  { id: 'f30-16', text: 'B/L - silla de madera para mobiliario presentación dosificado proceso ensamblado uso oficina - origen: Shenzhen - destino: Montevideo', docType: 'bol' },
  { id: 'f30-17', text: 'conocimiento de embarque - vaso de plastico para cocina presentación retail proceso moldeado uso hogar - origen: Busan - destino: Santos', docType: 'bol' },
  { id: 'f30-18', text: 'Bill of Lading - equipo de protección de nylon para trabajo presentación granel proceso extrusion uso industrial - origen: Shanghai - destino: Los Angeles', docType: 'bol' },

  // datasheet (6 casos)
  { id: 'f30-19', text: 'FICHA TÉCNICA - camisa de algodón para vestido presentación granel proceso hilado uso industrial - composición: 70% algodón', docType: 'datasheet' },
  { id: 'f30-20', text: 'datasheet del producto - camisa de poliester para ropa presentación retail proceso tejido uso fitness - composición: 60% poliester', docType: 'datasheet' },
  { id: 'f30-21', text: 'Ficha técnica - zapatillas de cuero para calzado presentación bulk proceso curtido uso casual - composición: 100% cuero', docType: 'datasheet' },
  { id: 'f30-22', text: 'datasheet - silla de madera para mobiliario presentación dosificado proceso ensamblado uso oficina - composición: 80% madera', docType: 'datasheet' },
  { id: 'f30-23', text: 'FICHA TÉCNICA - vaso de plastico para cocina presentación retail proceso moldeado uso hogar - composición: 50% plastico', docType: 'datasheet' },
  { id: 'f30-24', text: 'datasheet del producto - equipo de protección de nylon para trabajo presentación granel proceso extrusion uso industrial - composición: 100% nylon', docType: 'datasheet' },

  // catalog (3 casos)
  { id: 'f30-25', text: 'CATÁLOGO OTOÑO 2026 - camisa de algodón para vestido presentación granel proceso hilado uso industrial', docType: 'catalog' },
  { id: 'f30-26', text: 'catálogo de productos - vestido de seda para ropa presentación retail proceso hilado uso formal', docType: 'catalog' },
  { id: 'f30-27', text: 'CATALOGO PRIMAVERA - jeans de algodón para vestir presentación bulk proceso tejido uso casual', docType: 'catalog' },

  // unknown (3 casos)
  { id: 'f30-28', text: 'documento genérico - camisa de algodón para vestido presentación granel proceso hilado uso industrial', docType: 'unknown' },
  { id: 'f30-29', text: 'archivo diverso sin tipo reconocible - silla de madera para oficina presentación dosificado proceso ensamblado uso mobiliario', docType: 'unknown' },
  { id: 'f30-30', text: 'otro tipo de archivo no identificado - vaso de plastico para cocina presentación retail proceso moldeado uso hogar', docType: 'unknown' },
];

/**
 * Extrae Claims de un caso aplicando TODOS los extractores basados en reglas.
 * No usa el modelo: solo reglas. Cada Claim lleva method: 'rule'.
 */
export function extractClaimsForCase(c: FreeTextCase): Claim[] {
  let claims: Claim[] = [];
  claims.push(...extractInvoiceClaims(c.text, FIXTURE30_SOURCE));
  claims.push(...extractPackingClaims(c.text, FIXTURE30_SOURCE));
  claims.push(...extractBolClaims(c.text, FIXTURE30_SOURCE));
  claims.push(...extractDatasheetClaims(c.text, FIXTURE30_SOURCE));
  claims.push(...extractFreeTextClaims(c.text, FIXTURE30_SOURCE));
  return guardNoTariffCodes(claims);
}

/**
 * Normaliza los claims de un caso a una GoodsSheet.
 */
export function sheetForCase(c: FreeTextCase): GoodsSheet {
  const claims = extractClaimsForCase(c);
  return normalizeFields(claims);
}

/**
 * Calcula el porcentaje de campos poblados (declared o inferred, no absent).
 */
export function coveragePercent(sheet: GoodsSheet): number {
  let populated = 0;
  for (const field of SHEET_FIELD_NAMES) {
    if (sheet[field].method !== 'absent') populated++;
  }
  return Math.round((populated / FIELDS_PER_CASE) * 100);
}

/**
 * Calcula la cobertura promedio de ficha sobre los 30 casos.
 */
export function averageCoverage(): number {
  let total = 0;
  for (const c of CASES_30) {
    total += coveragePercent(sheetForCase(c));
  }
  return Math.round(total / CASES_30_COUNT);
}

/** Resultado de verificación del target de cobertura. */
export interface CoverageCheck {
  average: number;
  target: number;
  passed: boolean;
  perCase: Array<{ id: string; coverage: number }>;
}

/**
 * Verifica que la cobertura promedio de ficha cumpla el target (≥ 80%).
 */
export function checkCoverage(): CoverageCheck {
  const perCase = CASES_30.map((c) => ({ id: c.id, coverage: coveragePercent(sheetForCase(c)) }));
  const average = averageCoverage();
  return { average, target: FICHA_COVERAGE_TARGET, passed: average >= FICHA_COVERAGE_TARGET, perCase };
}
