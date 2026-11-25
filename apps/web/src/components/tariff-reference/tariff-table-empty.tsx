/**
 * Empty state for TariffTable.
 */

export function TariffTableEmpty() {
  return (
    <div className="border border-[var(--border-subtle)] rounded-lg bg-[var(--surface-card)] p-12 text-center">
      <div className="w-8 h-8 rounded-full bg-[var(--surface-elevated)] flex items-center justify-center mx-auto mb-3 text-[var(--text-muted)]">
        <span className="text-[14px]">📋</span>
      </div>
      <p className="text-[var(--text-muted)] text-sm">
        No se encontraron partidas arancelarias.
      </p>
    </div>
  );
}
