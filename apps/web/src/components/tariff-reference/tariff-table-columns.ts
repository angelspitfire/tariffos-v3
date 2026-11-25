/**
 * Column configuration for TariffTable.
 * Single source of truth for column keys, labels, and widths.
 */

export type TableColumn =
  | 'code'
  | 'description'
  | 'dutyRate'
  | 'specific'
  | 'vatRate'
  | 'fodinfaRate'
  | 'unit'
  | 'status';

export const COLUMN_KEYS: TableColumn[] = [
  'code',
  'description',
  'dutyRate',
  'specific',
  'vatRate',
  'fodinfaRate',
  'unit',
  'status',
];

export const COLUMN_LABELS: Record<TableColumn, string> = {
  code: 'Código',
  description: 'Descripción',
  dutyRate: 'Ad-Valorem %',
  specific: 'Específico',
  vatRate: 'IVA %',
  fodinfaRate: 'FODINFA %',
  unit: 'Unidad',
  status: 'Estado',
};

export const COLUMN_WIDTHS: Record<TableColumn, string> = {
  code: 'w-24',
  description: 'w-auto min-w-[200px]',
  dutyRate: 'w-20',
  specific: 'w-20',
  vatRate: 'w-16',
  fodinfaRate: 'w-20',
  unit: 'w-16',
  status: 'w-20',
};
