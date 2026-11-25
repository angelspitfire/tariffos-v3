import { useState } from 'react';
import { useToast } from '@/components/organisms/Toast';
import { ManifestLineItem, ManifestGridPayload as DomainManifestGridPayload } from '@/types/domain';
import { CONFIDENCE_SAFE_THRESHOLD, CONFIDENCE_BORDERLINE_THRESHOLD, CONFIDENCE_PERCENT_MULTIPLIER } from '@/__mocks__';
import { Search, SlidersHorizontal, ShieldCheck, AlertCircle, Edit2 } from 'lucide-react';
import { SkeletonTable } from '@/components/atoms/Skeleton';
import { ManifestRowEditor } from './ManifestRowEditor';
import { useManifestKeyboard } from '@/hooks/useManifestKeyboard';

interface ManifestGridProps {
  payload: DomainManifestGridPayload;
  isLoading?: boolean;
  onSelectItem?: (item: ManifestLineItem) => void;
  onUpdateItem?: (itemId: string, patch: Partial<ManifestLineItem>) => void;
}

function confidenceClassName(confidence: number) {
  if (confidence >= CONFIDENCE_SAFE_THRESHOLD) {
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25';
  }
  if (confidence >= CONFIDENCE_BORDERLINE_THRESHOLD) {
    return 'bg-amber-500/10 text-amber-400 border-amber-500/25';
  }
  return 'bg-rose-500/10 text-rose-400 border-rose-500/25';
}

function confidenceIcon(confidence: number) {
  if (confidence >= CONFIDENCE_SAFE_THRESHOLD) {
    return <ShieldCheck className="w-3 h-3" />;
  }
  if (confidence >= CONFIDENCE_BORDERLINE_THRESHOLD) {
    return <span className="w-3 h-3" />;
  }
  return <AlertCircle className="w-3 h-3" />;
}

export function ManifestGrid({ payload, isLoading = false, onSelectItem, onUpdateItem }: ManifestGridProps) {
  const { items, totalCif, totalDuties } = payload;
  const [filter, setFilter] = useState('');
  const [dense, setDense] = useState(true);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { toast } = useToast();

  const filtered = items.filter((i) =>
    i.description.toLowerCase().includes(filter.toLowerCase()) ||
    i.hsCode.includes(filter)
  );

  useManifestKeyboard({
    enabled: !editingItemId && filtered.length > 0,
    onNext: () => setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1)),
    onPrev: () => setSelectedIndex((i) => Math.max(i - 1, 0)),
    onApprove: () => {
      const item = filtered[selectedIndex];
      if (item) onSelectItem?.(item);
    },
    onArbitrate: () => {
      const item = filtered[selectedIndex];
      if (item) onSelectItem?.(item);
    },
  });

  if (isLoading) {
    return <SkeletonTable rows={5} columns={8} />;
  }

  return (
    <div className="flex flex-col h-full bg-[var(--surface-card)] border border-[var(--border-card)] rounded-xl overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--surface-overlay)]">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            Partidas Arancelarias ({filtered.length})
          </span>
          <span className="text-xs text-[var(--text-muted)] font-mono-numbers">
            CIF: ${totalCif.toLocaleString()} · Arancel Est.: ${totalDuties.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Filtrar por HS o descripción..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-8 pr-3 py-1 bg-[var(--surface-elevated)] border border-[var(--border-mid)] rounded-md text-xs text-[var(--text-hi)] placeholder-zinc-500 focus:outline-none focus:border-[var(--brand)] w-52"
            />
          </div>
          <button
            onClick={() => setDense(!dense)}
            className="p-1.5 rounded-md hover:bg-[var(--surface-elevated)] text-zinc-400 hover:text-zinc-200 border border-[var(--border-mid)]"
            title="Alternar densidad de filas"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] bg-zinc-900/60 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider sticky top-0 backdrop-blur-sm">
              <th className="py-2 px-3">#</th>
              <th className="py-2 px-3">Partida HS</th>
              <th className="py-2 px-3">Descripción</th>
              <th className="py-2 px-3 text-right">Cant.</th>
              <th className="py-2 px-3 text-right">CIF (USD)</th>
              <th className="py-2 px-3 text-right">Arancel</th>
              <th className="py-2 px-3 text-right">IVA</th>
              <th className="py-2 px-3 text-center">Certeza</th>
              <th className="py-2 px-2 text-center w-10">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-divider)]">
            {filtered.map((item, idx) => {
              if (editingItemId === item.id) {
                return (
                  <ManifestRowEditor
                    key={item.id}
                    item={item}
                    onSave={(patch) => {
                      onUpdateItem?.(item.id, patch);
                      toast('Manifest item updated', 'success');
                      setEditingItemId(null);
                    }}
                    onCancel={() => setEditingItemId(null)}
                  />
                );
              }

              const isSelected = selectedIndex === idx;

              return (
                <tr
                  key={item.id}
                  className={`transition-colors cursor-pointer group text-xs ${
                    isSelected ? 'bg-indigo-950/40 ring-1 ring-inset ring-indigo-500/50' : 'hover:bg-zinc-800/40'
                  }`}
                  onClick={() => {
                    setSelectedIndex(idx);
                    onSelectItem?.(item);
                  }}
                  onDoubleClick={() => setEditingItemId(item.id)}
                >
                  <td className="py-2 px-3 text-zinc-500 font-mono-numbers">{idx + 1}</td>
                  <td className="py-2 px-3 font-mono-numbers font-medium text-[var(--purple-text)] group-hover:text-[var(--purple)]">
                    {item.hsCode}
                  </td>
                  <td className="py-2 px-3 text-[var(--text-hi)] max-w-xs truncate" title={item.description}>
                    {item.description}
                  </td>
                  <td className="py-2 px-3 text-right text-zinc-400 font-mono-numbers">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="py-2 px-3 text-right text-[var(--text-hi)] font-mono-numbers font-medium">
                    ${item.cifValue.toLocaleString()}
                  </td>
                  <td className="py-2 px-3 text-right text-zinc-400 font-mono-numbers">{item.dutyRate}%</td>
                  <td className="py-2 px-3 text-right text-zinc-400 font-mono-numbers">{item.vatRate}%</td>
                  <td className="py-2 px-3 text-center">
                    <span className={"inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border font-mono-numbers tracking-tight " + confidenceClassName(item.confidence)}>
                      {confidenceIcon(item.confidence)}
                      {(item.confidence * CONFIDENCE_PERCENT_MULTIPLIER).toFixed(0)}%
                    </span>
                  </td>
                  <td className="py-2 px-2 text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setEditingItemId(item.id)}
                      title="Editar partida"
                      aria-label={`Editar partida ${item.hsCode}`}
                      className="p-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2 bg-zinc-950/80 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-zinc-400">
        <div className="flex items-center gap-3">
          <span><kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-[10px] text-zinc-300">J/K</kbd> o <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-[10px] text-zinc-300">↑↓</kbd> Navegar</span>
          <span><kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-[10px] text-zinc-300">Enter</kbd> Seleccionar</span>
          <span><kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-[10px] text-zinc-300">Doble clic</kbd> Editar</span>
        </div>
        <span className="text-zinc-400 font-mono-numbers">Línea {selectedIndex + 1} de {filtered.length}</span>
      </div>
    </div>
  );
}
