/**
 * Badge styling helpers for TariffTable.
 * Pure functions returning CSS class strings; no React dependencies.
 */

import type { TariffStatus } from '@/types/tariff-reference';
import { ADVALOREM_LOW_BAND, ADVALOREM_MEDIUM_BAND } from '@/__mocks__';

export const IVA_RATE_PERCENT = 16;
export const FODINFA_RATE_PERCENT = 0.5;

export function dutyRateBadgeClass(rate: number): string {
  if (rate <= ADVALOREM_LOW_BAND) {
    return 'bg-[var(--success-subtle)] text-[var(--success-text)] border border-[var(--success-border)]';
  }
  if (rate <= ADVALOREM_MEDIUM_BAND) {
    return 'bg-[var(--warning-subtle)] text-[var(--warning-text)] border border-[var(--warning-border)]';
  }
  return 'bg-[var(--danger-subtle)] text-[var(--danger-text)] border border-[var(--danger-border)]';
}

export function statusBadgeClass(status: TariffStatus): string {
  switch (status) {
    case 'active':
      return 'bg-[var(--success-subtle)] text-[var(--success-text)] border border-[var(--success-border)]';
    case 'suspended':
      return 'bg-[var(--danger-subtle)] text-[var(--danger-text)] border border-[var(--danger-border)]';
    default:
      return 'bg-[var(--surface-elevated)] text-[var(--text-muted)] border border-[var(--border-subtle)]';
  }
}

export function statusBadgeLabel(status: TariffStatus): string {
  switch (status) {
    case 'active':
      return 'Activo';
    case 'suspended':
      return 'Suspendido';
    default:
      return 'Inactivo';
  }
}
