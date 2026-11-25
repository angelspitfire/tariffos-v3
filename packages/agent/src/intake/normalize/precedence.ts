/**
 * Tabla única de precedencia por campo (F2-26).
 *
 * Es la única fuente de verdad del orden de fuentes por campo de ficha.
 * Ningún otro módulo repite este orden: usan `rank()` desde aquí.
 *
 * Tabla del plan §10.4:
 *   Campo           Gana      Luego     Nunca
 *   Identidad       factura   ficha     packing
 *   Composición %   ficha     packing   factura
 *   Función/uso     ficha     catálogo  factura
 *   Presentación    packing   factura   catálogo
 *   Origen          B/L       factura   —
 *
 * Un empate no se promedia: se registra el conflicto y decide la compuerta.
 */

import type { SheetFieldName, Source } from '../../domain/sheet.js';

export type SourceKind = NonNullable<Source['kind']>;

/** Orden de fuentes por campo, de mayor a menor precedencia. */
export const PRECEDENCE: Record<SheetFieldName, SourceKind[]> = {
  what: ['invoice', 'datasheet', 'packing'],
  madeOf: ['datasheet', 'packing'],
  howMade: [],
  purpose: ['datasheet', 'catalog'],
  presentation: ['packing', 'invoice'],
} as const;

/**
 * Rang de precedencia de una fuente para un campo (menor = mayor precedencia).
 * Fuentes no listadas para el campo quedan en el último rango (empate).
 */
export function rank(kind: SourceKind, field: SheetFieldName): number {
  const order = PRECEDENCE[field];
  const index = order.indexOf(kind);
  return index === -1 ? order.length : index;
}

/** Campo que gana entre dos fuentes para un campo dado (o null si empatan). */
export function winner(kindA: SourceKind, kindB: SourceKind, field: SheetFieldName): SourceKind | null {
  const ra = rank(kindA, field);
  const rb = rank(kindB, field);
  if (ra < rb) return kindA;
  if (rb < ra) return kindB;
  return null;
}

export type { SheetFieldName };
