/**
 * Loading skeleton rows for TariffTable.
 */

export function TariffTableSkeleton() {
  return (
    <table className="w-full border-collapse text-left text-xs">
      <thead className="bg-[var(--surface-elevated)] text-[var(--text-muted)] font-semibold text-[10px] uppercase tracking-wider border-b border-[var(--border-divider)]">
        <tr>
          <th className="p-3 w-24">Codigo</th>
          <th className="p-3 w-auto min-w-[200px]">Descripcion</th>
          <th className="p-3 w-20">Ad-Valorem %</th>
          <th className="p-3 w-20">Especifico</th>
          <th className="p-3 w-16">IVA %</th>
          <th className="p-3 w-20">FODINFA %</th>
          <th className="p-3 w-16">Unidad</th>
          <th className="p-3 w-20">Estado</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[var(--border-subtle)]/40">
        {Array.from({ length: 6 }).map((_, i) => (
          <tr key={`skeleton-${i}`} className="animate-pulse">
            <td className="p-3"><div className="h-4 w-24 rounded bg-[var(--surface-elevated)]" /></td>
            <td className="p-3"><div className="h-4 w-3/4 rounded bg-[var(--surface-elevated)]" /></td>
            <td className="p-3"><div className="h-4 w-12 rounded bg-[var(--surface-elevated)]" /></td>
            <td className="p-3"><div className="h-4 w-12 rounded bg-[var(--surface-elevated)]" /></td>
            <td className="p-3"><div className="h-4 w-8 rounded bg-[var(--surface-elevated)]" /></td>
            <td className="p-3"><div className="h-4 w-16 rounded bg-[var(--surface-elevated)]" /></td>
            <td className="p-3"><div className="h-4 w-8 rounded bg-[var(--surface-elevated)]" /></td>
            <td className="p-3"><div className="h-4 w-16 rounded bg-[var(--surface-elevated)]" /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
