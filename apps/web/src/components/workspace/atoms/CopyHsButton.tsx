'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CopyHsButtonProps {
  hsCode: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<CopyHsButtonProps['size']>, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-lg',
};

const COPIED_RESET_MS = 1800;

export function CopyHsButton({ hsCode, size = 'md', className = '' }: CopyHsButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard?.writeText(hsCode);
    } catch {
      // Clipboard write may fail in restricted contexts; still surface feedback.
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), COPIED_RESET_MS);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`Copiar código ${hsCode}`}
      className={`group inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-surface-muted font-mono font-semibold tracking-tight text-ink-primary transition hover:border-accent-border hover:bg-accent-soft hover:text-accent-ink ${SIZE_CLASSES[size]} ${className}`}
    >
      <span>{hsCode}</span>
      {copied ? (
        <span className="inline-flex items-center gap-0.5 font-sans text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
          Copiado
        </span>
      ) : (
        <Copy className="h-3.5 w-3.5 text-ink-muted transition group-hover:text-accent-ink" aria-hidden="true" />
      )}
    </button>
  );
}
