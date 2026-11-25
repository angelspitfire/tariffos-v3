/**
 * Layout and tab constants for the TariffReferenceView.
 * Single source of truth to avoid inline magic numbers.
 */

export const TARIFF_REF_DRAWER_TREE_WIDTH = 280;
export const TARIFF_REF_CANVAS_TREE_WIDTH = 300;
export const TARIFF_REF_DETAIL_WIDTH = 320;

export type TariffRefTabId = 'buscar' | 'explorar' | 'favoritos' | 'historial';

export interface TariffRefTab {
  id: TariffRefTabId;
  label: string;
}

export const TARIFF_REF_TABS: TariffRefTab[] = [
  { id: 'buscar', label: 'Buscar' },
  { id: 'explorar', label: 'Explorar' },
  { id: 'favoritos', label: 'Favoritos' },
  { id: 'historial', label: 'Historial' },
];

// ─── Ad-Valorem rate color bands (percent) ───
export const ADVALOREM_LOW_BAND = 5; // green ≤ 5%
export const ADVALOREM_MEDIUM_BAND = 15; // yellow 5–15%, red > 15%

// ─── Table ───
export const TARIFF_TABLE_ROW_HEIGHT = 44;
export const TARIFF_TABLE_VISIBLE_ROWS = 12;
export const TARIFF_TABLE_MIN_HEIGHT = TARIFF_TABLE_ROW_HEIGHT * TARIFF_TABLE_VISIBLE_ROWS;
