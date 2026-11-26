'use client';

import { useState, type FormEvent } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export interface DeactivateConfirmModalProps {
  title: string;
  description: string;
  confirmLabel: string;
  danger?: boolean;
  extraCheckboxLabel?: string;
  onClose: () => void;
  onConfirm: (reason: string, extraChecked: boolean) => Promise<void>;
}

export function DeactivateConfirmModal({
  title,
  description,
  confirmLabel,
  danger = true,
  extraCheckboxLabel,
  onClose,
  onConfirm,
}: DeactivateConfirmModalProps) {
  const [reason, setReason] = useState('');
  const [extraChecked, setExtraChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 3) {
      setError('Debes indicar un motivo de al menos 3 caracteres.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onConfirm(reason.trim(), extraChecked);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo completar la acción');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border-subtle bg-surface-panel p-5 shadow-xl space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-ink-primary">{title}</h2>
              <p className="text-xs text-ink-muted mt-0.5">{description}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="text-ink-muted hover:text-ink-primary cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3 text-xs">
          <label className="block space-y-1">
            <span className="font-semibold text-ink-secondary">Motivo (se guarda en bitácora)</span>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej. Falta de pago o solicitud del cliente"
              className="w-full rounded-lg border border-border-strong bg-surface-input px-3 py-2 text-ink-primary"
            />
          </label>
          {extraCheckboxLabel && (
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={extraChecked}
                onChange={(e) => setExtraChecked(e.target.checked)}
              />
              <span className="text-ink-primary">{extraCheckboxLabel}</span>
            </label>
          )}
          {error && <p className="text-rose-600 dark:text-rose-400 font-medium">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-3 py-2 rounded-lg border border-border-strong text-ink-secondary cursor-pointer">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={busy}
              className={`px-4 py-2 rounded-lg text-white font-semibold disabled:opacity-50 cursor-pointer ${
                danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {busy ? 'Procesando...' : confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
