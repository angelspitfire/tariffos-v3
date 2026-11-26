'use client';

import { Maximize2, Minimize2, X } from 'lucide-react';

export interface CanvasTitleBarProps {
  codeLabel: string;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onClose?: () => void;
}

export function CanvasTitleBar({
  codeLabel,
  isFullscreen = false,
  onToggleFullscreen,
  onClose,
}: CanvasTitleBarProps) {
  return (
    <div className="no-print flex h-11 shrink-0 items-center justify-between gap-2 border-b border-border-subtle bg-surface-panel px-4">
      <div className="flex min-w-0 items-center gap-2 text-xs">
        <span className="font-semibold text-ink-primary">Canvas</span>
        <span aria-hidden="true" className="text-border-strong">·</span>
        <span className="truncate font-mono font-semibold text-accent-ink tabular-nums">
          {codeLabel}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {onToggleFullscreen ? (
          <button
            type="button"
            onClick={onToggleFullscreen}
            aria-label={isFullscreen ? 'Restaurar tamaño del Canvas' : 'Expandir Canvas'}
            className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink-primary"
          >
            {isFullscreen ? (
              <Minimize2 className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </button>
        ) : null}
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar panel de dictamen"
            className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink-primary"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
