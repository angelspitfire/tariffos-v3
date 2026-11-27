'use client';

import { useState } from 'react';
import { PenTool, X } from 'lucide-react';
import { WorkspaceDialogShell } from '../atoms/WorkspaceDialogShell';
import { BrokerSignaturePad } from '../molecules/BrokerSignaturePad';

interface SignatureQuickModalProps {
  open: boolean;
  defaultName: string;
  defaultLicense: string;
  defaultSignatureDataUrl?: string;
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
  defaultSignatureDataUrl,
  onClose,
  onSaveAndExport,
}: SignatureQuickModalProps) {
  const [fullName, setFullName] = useState(defaultName);
  const [brokerLicense, setBrokerLicense] = useState(defaultLicense);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | undefined>(defaultSignatureDataUrl);

  return (
    <WorkspaceDialogShell
      open={open}
      onClose={onClose}
      label="Firma rápida de agente aduanal"
      maxWidthClassName="max-w-lg"
      contentClassName="p-5"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const cleanName = fullName.trim() || defaultName;
          const cleanLicense = brokerLicense.trim() || defaultLicense;
          onSaveAndExport({
            fullName: cleanName,
            brokerLicense: cleanLicense,
            signatureDataUrl: signatureDataUrl || buildTextSignatureDataUrl(cleanName, cleanLicense),
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
            className="cursor-pointer rounded-lg p-1 text-ink-muted transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <p className="mt-1.5 text-xs text-ink-muted">
          Configura tu nombre, credencial y rúbrica manuscrita para sellar y exportar el PDF oficial.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-xs">
            <span className="font-medium text-ink-secondary">Nombre del agente / clasificador</span>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border-subtle bg-surface-input px-3 py-2 text-xs text-ink-primary focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
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
              className="mt-1 w-full rounded-lg border border-border-subtle bg-surface-input px-3 py-2 font-mono text-xs text-ink-primary focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
            />
          </label>

          <BrokerSignaturePad
            value={signatureDataUrl}
            onChange={setSignatureDataUrl}
            signerName={fullName}
            brokerLicense={brokerLicense}
          />
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg border border-border-subtle px-3 py-1.5 text-xs font-medium text-ink-secondary transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="cursor-pointer rounded-lg bg-accent-brand px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent-brand-hover focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
          >
            Guardar firma y exportar PDF
          </button>
        </div>
      </form>
    </WorkspaceDialogShell>
  );
}
