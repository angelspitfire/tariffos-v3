'use client';

import { useMemo, useState } from 'react';
import { BookMarked, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import type { SkuPrecedent } from '@tariffos/shared-types';
import { CopyHsButton } from '../atoms/CopyHsButton';
import { StatusPill } from '../atoms/StatusPill';
import { WorkspaceDialogShell } from '../atoms/WorkspaceDialogShell';
import { SkuPrecedentForm } from '../molecules/SkuPrecedentForm';

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
  const [editingId, setEditingId] = useState<string | null>(null);

  const editingItem = useMemo(
    () => (editingId ? precedents.find((p) => p.id === editingId) : undefined),
    [editingId, precedents],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return precedents;
    return precedents.filter(
      (item) =>
        item.sku.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.hsCode.toLowerCase().includes(q),
    );
  }, [precedents, search]);

  return (
    <WorkspaceDialogShell
      open={open}
      onClose={onClose}
      label="Catálogo de precedentes SKU"
      maxWidthClassName="max-w-2xl"
      contentClassName="max-h-[85vh]"
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
          className="cursor-pointer rounded-lg p-1 text-ink-muted transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-border-hairline px-5 py-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-2 left-2.5 h-3.5 w-3.5 text-ink-muted" aria-hidden="true" />
          <input
            type="search"
            aria-label="Buscar precedentes SKU"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por SKU, descripción o código SA…"
            className="w-full rounded-lg border border-border-subtle bg-surface-input py-1.5 pr-3 pl-8 text-xs text-ink-primary focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingId(null);
            setAdding((prev) => !prev);
          }}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-accent-brand px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent-brand-hover focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Nuevo SKU
        </button>
      </div>

      {adding ? (
        <SkuPrecedentForm
          key={editingItem?.id ?? 'new'}
          initialItem={editingItem}
          jurisdictionId={jurisdictionId}
          onSave={(precedent) => {
            onSave(precedent);
            setEditingId(null);
            setAdding(false);
          }}
          onCancel={() => {
            setEditingId(null);
            setAdding(false);
          }}
        />
      ) : null}

      <div className="flex-1 overflow-y-auto p-5">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-xs text-ink-muted">
            No hay precedentes SKU registrados aún.
          </p>
        ) : (
          <ul className="space-y-2">
            {filtered.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border-subtle bg-surface-muted p-3 text-xs"
              >
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
                    className="cursor-pointer rounded-lg border border-border-subtle bg-surface-panel px-2.5 py-1 text-xs font-medium text-ink-primary transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
                  >
                    Clasificar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(item.id);
                      setAdding(true);
                    }}
                    aria-label={`Editar SKU ${item.sku}`}
                    className="cursor-pointer rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-surface-hover hover:text-accent-ink focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    aria-label={`Eliminar SKU ${item.sku}`}
                    className="cursor-pointer rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-surface-hover hover:text-rose-600 focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </WorkspaceDialogShell>
  );
}
