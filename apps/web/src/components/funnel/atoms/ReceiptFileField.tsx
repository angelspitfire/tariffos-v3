import type { ChangeEvent } from 'react';
import { FileUp } from 'lucide-react';

export interface ReceiptFileFieldProps {
  fileName: string;
  onFileSelected: (fileName: string) => void;
}

export function ReceiptFileField({ fileName, onFileSelected }: ReceiptFileFieldProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    onFileSelected(file ? file.name : '');
  };

  return (
    <div className="space-y-1.5">
      <label
        htmlFor="receipt-upload"
        className="block text-[11px] font-semibold uppercase tracking-wider text-ink-muted"
      >
        Comprobante de pago (opcional)
      </label>
      <label
        htmlFor="receipt-upload"
        className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-dashed border-border-strong bg-surface-muted/40 hover:bg-surface-subtle/50 text-xs text-ink-secondary cursor-pointer transition-colors"
      >
        <span className="inline-flex items-center gap-2 truncate">
          <FileUp className="w-4 h-4 text-accent-ink shrink-0" />
          <span className="truncate">
            {fileName || 'Adjuntar captura o PDF del comprobante'}
          </span>
        </span>
        <span className="text-[11px] font-semibold text-accent-ink shrink-0">Elegir</span>
        <input
          id="receipt-upload"
          type="file"
          accept="image/*,.pdf"
          onChange={handleChange}
          className="sr-only"
        />
      </label>
    </div>
  );
}
