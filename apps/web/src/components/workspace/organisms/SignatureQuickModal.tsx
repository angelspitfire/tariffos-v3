'use client';

import { useState } from 'react';
import { PenTool, X } from 'lucide-react';

interface SignatureQuickModalProps {
  open: boolean;
  defaultName: string;
  defaultLicense: string;
  onClose: () => void;
  onSaveAndExport: (payload: {
    fullName: string;
    brokerLicense: string;
    signatureDataUrl: string;
  }) => void;
}

function buildTextSignatureDataUrl(name: string, license: string): string {
  const safeName = name.replace(/[<>&"]/g, '');
  const safeLicense = license.replace(/[<>&"]/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="80"><rect width="100%" height="100%" fill="none"/><text x="12" y="42" font-family="Georgia, serif" font-style="italic" font-size="24" fill="#0f172a">${safeName}</text><text x="12" y="64" font-family="monospace" font-size="11" fill="#475569">${safeLicense}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function SignatureQuickModal({
  open,
  defaultName,
  defaultLicense,
  onClose,
  onSaveAndExport,
}: SignatureQuickModalProps) {
  const [fullName, setFullName] = useState(defaultName);
  const [brokerLicense, setBrokerLicense] = useState(defaultLicense);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <dialog
        open
        aria-label="Firma rápida de agente aduanal"
        className="static m-0 w-full max-w-md rounded-2xl border border-border-subtle bg-surface-panel p-5 text-ink-primary shadow-xl"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const cleanName = fullName.trim() || defaultName;
            const cleanLicense = brokerLicense.trim() || defaultLicense;
            onSaveAndExport({
              fullName: cleanName,
              brokerLicense: cleanLicense,
              signatureDataUrl: buildTextSignatureDataUrl(cleanName, cleanLicense),
            });
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <PenTool className="h-4 w-4 text-accent-ink" aria-hidden="true" />
              <h3 className="text-sm font-semibold">Firma rápida del dictamen</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar modal de firma"
              className="rounded-lg p-1 text-ink-muted hover:bg-surface-hover"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <p className="mt-1.5 text-xs text-ink-muted">
            Configura tu nombre y credencial aduanera una sola vez para sellar y exportar el PDF oficial.
          </p>

          <div className="mt-4 space-y-3">
            <label className="block text-xs">
              <span className="font-medium text-ink-secondary">Nombre del agente / clasificador</span>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border-subtle bg-surface-input px-3 py-2 text-xs text-ink-primary outline-none focus:border-accent-brand"
              />
            </label>
            <label className="block text-xs">
              <span className="font-medium text-ink-secondary">Credencial / Registro Aduanal</span>
              <input
                type="text"
                required
                value={brokerLicense}
                onChange={(e) => setBrokerLicense(e.target.value)}
                placeholder="Ej. SENIAT-AG-1420"
                className="mt-1 w-full rounded-lg border border-border-subtle bg-surface-input px-3 py-2 font-mono text-xs text-ink-primary outline-none focus:border-accent-brand"
              />
            </label>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border-subtle px-3 py-1.5 text-xs font-medium text-ink-secondary hover:bg-surface-hover"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-accent-brand px-3.5 py-1.5 text-xs font-medium text-white hover:bg-accent-brand-hover"
            >
              Guardar firma y exportar PDF
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
