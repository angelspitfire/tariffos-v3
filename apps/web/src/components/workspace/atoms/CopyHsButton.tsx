'use client';

import { useState, type MouseEvent } from 'react';
import { formatHsCode } from '@tariffos/shared-types';
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
  const formattedCode = formatHsCode(hsCode);

  const handleCopy = async (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    try {
      await navigator.clipboard?.writeText(formattedCode);
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
      aria-label={`Copiar código ${formattedCode}`}
      className={`group inline-flex max-w-full min-w-0 cursor-pointer items-center gap-1.5 rounded-lg border border-border-subtle bg-surface-muted font-mono font-semibold tracking-tight text-ink-primary transition-colors hover:border-accent-border hover:bg-accent-soft hover:text-accent-ink focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none ${SIZE_CLASSES[size]} ${className}`}
    >
      <span translate="no" className="truncate">
        {formattedCode}
      </span>
      {copied ? (
        <span className="inline-flex shrink-0 items-center gap-0.5 font-sans text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
          Copiado
        </span>
      ) : (
        <Copy
          className="h-3.5 w-3.5 shrink-0 text-ink-muted transition-colors group-hover:text-accent-ink"
          aria-hidden="true"
        />
      )}
    </button>
  );
}
