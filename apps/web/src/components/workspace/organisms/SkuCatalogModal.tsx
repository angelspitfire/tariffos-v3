'use client';

import { useMemo, useState } from 'react';
import { BookMarked, Plus, Search, Trash2, X } from 'lucide-react';
import type { SkuPrecedent } from '@tariffos/shared-types';
import { normalizeSkuKey } from '@/lib/workspace/persistence';
import { CopyHsButton } from '../atoms/CopyHsButton';
import { StatusPill } from '../atoms/StatusPill';

export interface SkuCatalogModalProps {
  open: boolean;
  precedents: readonly SkuPrecedent[];
  jurisdictionId: string;
  onClose: () => void;
  onSave: (precedent: SkuPrecedent) => void;
  onDelete: (id: string) => void;
  onApplyToChat: (precedent: SkuPrecedent) => void;
}

export function SkuCatalogModal({
  open,
  precedents,
  jurisdictionId,
  onClose,
  onSave,
  onDelete,
  onApplyToChat,
}: SkuCatalogModalProps) {
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState(false);
  const [sku, setSku] = useState('');
  const [title, setTitle] = useState('');
  const [hsCode, setHsCode] = useState('');
  const [adValorem, setAdValorem] = useState('10');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return precedents;
    return precedents.filter(
      (item) =>
        item.sku.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.hsCode.toLowerCase().includes(q)
    );
  }, [precedents, search]);

  if (!open) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku.trim() || !hsCode.trim()) return;
    const now = new Date().toISOString();
    onSave({
      id: `sku-${Date.now()}`,
      sku: sku.trim(),
      normalizedSku: normalizeSkuKey(sku),
      title: title.trim() || sku.trim(),
      description: title.trim() || sku.trim(),
      hsCode: hsCode.trim(),
      jurisdictionId,
      adValoremPercent: Number(adValorem) || 0,
      vatPercent: 16,
      legalRegime: 'Libre',
      reviewStatus: 'approved',
      usageCount: 1,
      createdAt: now,
      updatedAt: now,
    });
    setSku('');
    setTitle('');
    setHsCode('');
    setAdding(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <dialog
        open
        aria-label="Catálogo de precedentes SKU"
        className="static m-0 flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border-subtle bg-surface-panel p-0 text-ink-primary shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-border-subtle px-5 py-3.5">
          <div className="flex items-center gap-2">
            <BookMarked className="h-4 w-4 text-accent-ink" aria-hidden="true" />
            <h2 className="text-sm font-semibold">Catálogo de Precedentes SKU ({precedents.length})</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar catálogo SKU"
            className="rounded-lg p-1 text-ink-muted hover:bg-surface-hover"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-border-hairline px-5 py-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-2 left-2.5 h-3.5 w-3.5 text-ink-muted" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por SKU, descripción o código SA..."
              className="w-full rounded-lg border border-border-subtle bg-surface-input py-1.5 pr-3 pl-8 text-xs text-ink-primary outline-none focus:border-accent-brand"
            />
          </div>
          <button
            type="button"
            onClick={() => setAdding((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-brand-hover"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Nuevo SKU
          </button>
        </div>

        {adding && (
          <form
            onSubmit={handleCreate}
            className="grid gap-2 border-b border-border-subtle bg-surface-muted px-5 py-3 text-xs sm:grid-cols-4"
          >
            <input required placeholder="Código SKU" value={sku} onChange={(e) => setSku(e.target.value)} className="rounded-lg border border-border-subtle bg-surface-input px-2.5 py-1.5" />
            <input required placeholder="Descripción breve" value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-lg border border-border-subtle bg-surface-input px-2.5 py-1.5 sm:col-span-2" />
            <input required placeholder="Partida (ej. 8504.40.90.00)" value={hsCode} onChange={(e) => setHsCode(e.target.value)} className="rounded-lg border border-border-subtle bg-surface-input px-2.5 py-1.5 font-mono" />
            <div className="flex items-center justify-end gap-2 sm:col-span-4">
              <input type="number" value={adValorem} onChange={(e) => setAdValorem(e.target.value)} aria-label="Ad Valorem %" className="w-20 rounded-lg border border-border-subtle bg-surface-input px-2 py-1 font-mono" />
              <span className="text-[11px] text-ink-muted">% AV</span>
              <button type="submit" className="rounded-lg bg-emerald-600 px-3 py-1.5 font-medium text-white hover:bg-emerald-700">
                Guardar precedente
              </button>
            </div>
          </form>
        )}

        <div className="flex-1 overflow-y-auto p-5">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-xs text-ink-muted">
              No hay precedentes SKU registrados aún.
            </p>
          ) : (
            <ul className="space-y-2">
              {filtered.map((item) => (
                <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border-subtle bg-surface-muted p-3 text-xs">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-semibold text-ink-primary">{item.sku}</span>
                      <CopyHsButton hsCode={item.hsCode} size="sm" />
                      <StatusPill variant={item.reviewStatus} />
                    </div>
                    <p className="mt-1 truncate text-ink-secondary">{item.title}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        onApplyToChat(item);
                        onClose();
                      }}
                      className="rounded-lg border border-border-subtle bg-surface-panel px-2.5 py-1 text-xs font-medium text-ink-primary hover:bg-surface-hover"
                    >
                      Clasificar
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(item.id)}
                      aria-label={`Eliminar SKU ${item.sku}`}
                      className="rounded-lg p-1.5 text-ink-muted hover:bg-surface-hover hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </dialog>
    </div>
  );
}
