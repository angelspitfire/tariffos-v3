'use client';

import type { ChangeEvent } from 'react';
import { Upload } from 'lucide-react';

export interface PaymentReceiptUploadFieldProps {
  receiptFileName?: string;
  onChangeFile: (e: ChangeEvent<HTMLInputElement>) => void;
}

export function PaymentReceiptUploadField({
  receiptFileName,
  onChangeFile,
}: PaymentReceiptUploadFieldProps) {
  return (
    <div className="space-y-1.5">
      <span className="block text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
        Comprobante o captura (opcional)
      </span>
      <label className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border border-dashed border-border-strong hover:border-accent-brand bg-surface-muted/60 cursor-pointer text-xs text-ink-secondary transition-colors">
        <span className="inline-flex items-center gap-2 truncate">
          <Upload className="w-4 h-4 text-accent-ink shrink-0" />
          <span className="truncate">{receiptFileName || 'Adjuntar imagen o PDF (máx. 5 MB)'}</span>
        </span>
        <input type="file" accept="image/*,.pdf" onChange={onChangeFile} className="hidden" />
      </label>
    </div>
  );
}
