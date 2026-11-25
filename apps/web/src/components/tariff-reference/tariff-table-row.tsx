'use client';

import { cn } from '@/lib/utils';
import type { TariffItem } from '@/types/tariff-reference';
import { COLUMN_WIDTHS } from './tariff-table-columns';
import {
  dutyRateBadgeClass,
  statusBadgeClass,
  statusBadgeLabel,
  FODINFA_RATE_PERCENT,
  IVA_RATE_PERCENT,
} from './tariff-table-badge';

interface TariffTableRowProps {
  item: TariffItem;
  index: number;
  isSelected: boolean;
  isFocused: boolean;
  onSelect: (item: TariffItem) => void;
}

export function TariffTableRow({
  item,
  index,
  isSelected,
  isFocused,
  onSelect,
}: TariffTableRowProps) {
  const handleClick = () => onSelect(item);

  const rowClass = cn(
    'p-0 border-b border-[var(--border-subtle)]/30 transition-colors group cursor-pointer',
    isSelected
      ? 'bg-[var(--brand-subtle)] border-l-2 border-l-[var(--brand-solid)]'
      : isFocused
        ? 'bg-[var(--surface-active)] ring-1 ring-[var(--brand-border)]'
        : 'hover:bg-[var(--surface-elevated)]/50',
  );

  return (
    <tr
      key={item.code}
      data-row-index={index}
      onClick={handleClick}
      className={rowClass}
    >
      <td className={cn('p-3', COLUMN_WIDTHS['code'])}>
        <span className="font-mono-numbers font-medium text-[var(--text-hi)]">
          {item.code}
        </span>
      </td>
      <td className={cn('p-3', COLUMN_WIDTHS['description'])} title={item.description}>
        <span className="text-[var(--text-hi)] truncate block">{item.description}</span>
      </td>
      <td className={cn('p-3', COLUMN_WIDTHS['dutyRate'])}>
        <span
          className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono-numbers border',
            dutyRateBadgeClass(item.dutyAdValorem),
          )}
        >
          {item.dutyAdValorem.toFixed(0)}%
        </span>
      </td>
      <td className={cn('p-3', COLUMN_WIDTHS['specific'])}>
        <span className="font-mono-numbers text-[var(--text-lo)]">-</span>
      </td>
      <td className={cn('p-3', COLUMN_WIDTHS['vatRate'])}>
        <span className="font-mono-numbers text-[var(--text-hi)]">{IVA_RATE_PERCENT.toFixed(0)}%</span>
      </td>
      <td className={cn('p-3', COLUMN_WIDTHS['fodinfaRate'])}>
        <span className="font-mono-numbers text-[var(--text-hi)]">{FODINFA_RATE_PERCENT.toFixed(1)}%</span>
      </td>
      <td className={cn('p-3', COLUMN_WIDTHS['unit'])}>
        <span className="font-mono-numbers text-[var(--text-mid)]">{item.unit}</span>
      </td>
      <td className={cn('p-3', COLUMN_WIDTHS['status'])}>
        <span
          className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono-numbers border',
            statusBadgeClass(item.status),
          )}
        >
          {statusBadgeLabel(item.status)}
        </span>
      </td>
    </tr>
  );
}
