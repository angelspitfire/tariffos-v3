'use client';

import { GitCompareArrows, Maximize2, Minimize2, X } from 'lucide-react';

export interface CanvasTitleBarProps {
  codeLabel: string;
  versionsCount?: number;
  isFullscreen?: boolean;
  onOpenTimeline?: () => void;
  onToggleFullscreen?: () => void;
  onClose?: () => void;
}

const CANVAS_ICON_BTN =
  'inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink-primary focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none';

export function CanvasTitleBar({
  codeLabel,
  versionsCount = 0,
  isFullscreen = false,
  onOpenTimeline,
  onToggleFullscreen,
  onClose,
}: CanvasTitleBarProps) {
  return (
    <div className="no-print flex h-[52px] shrink-0 items-center justify-between gap-2 border-b border-border-subtle bg-surface-panel/85 px-4 backdrop-blur-xl">
      <div className="flex min-w-0 items-center gap-2 text-xs">
        <span className="font-semibold text-ink-primary">Canvas</span>
        <span className="truncate font-mono font-semibold text-accent-ink tabular-nums">
          {codeLabel}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {versionsCount >= 2 && onOpenTimeline ? (
          <button
            type="button"
            onClick={onOpenTimeline}
            aria-label="Historial y comparador de versiones"
            className="inline-flex h-7 cursor-pointer items-center gap-1 rounded-full border border-border-subtle bg-surface-muted px-2.5 text-[11px] font-medium text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink-primary focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
          >
            <GitCompareArrows className="h-3 w-3 text-accent-ink" aria-hidden="true" />
            <span>Versiones ({versionsCount})</span>
          </button>
        ) : null}
        {onToggleFullscreen ? (
          <button
            type="button"
            onClick={onToggleFullscreen}
            aria-label={isFullscreen ? 'Restaurar tamaño del Canvas' : 'Expandir Canvas'}
            className={CANVAS_ICON_BTN}
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
            className={CANVAS_ICON_BTN}
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
