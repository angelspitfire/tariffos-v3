'use client';

import { useState } from 'react';
import { ChevronDown, FileText } from 'lucide-react';
import {
  DOC_PREVIEW_CANVAS_SHADOW,
  DOC_PREVIEW_THUMB_ASPECT_RATIO,
} from '@/__mocks__';

export function DocumentPreviewerThumbnailStrip({
  numPages,
  activePage,
  thumbWidth,
  onPageChange,
}: {
  numPages: number;
  activePage: number;
  thumbWidth: number;
  onPageChange: (next: number) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div className="border-t border-solid flex flex-col">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex items-center justify-center w-full py-1.5 hover:bg-[var(--surface-active)]"
        style={{ background: 'var(--surface)' }}
      >
        <span className="text-[10px] text-[var(--text-mid)] font-mono mr-2">Páginas</span>
        <ChevronDown size={12} className={`transition-transform ${expanded ? '' : 'rotate-180'}`} />
      </button>
      {expanded && (
        <div
          className="flex gap-1 overflow-x-auto px-2 py-2 scrollbar-hide"
          style={{ background: 'var(--surface)' }}
        >
          {Array.from({ length: numPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className="flex-shrink-0 rounded border-2 transition-all"
              style={{
                width: thumbWidth,
                height: thumbWidth * DOC_PREVIEW_THUMB_ASPECT_RATIO,
                borderColor: p === activePage ? 'var(--brand-accent)' : 'transparent',
                background: p === activePage ? 'var(--surface-active)' : 'transparent',
              }}
            >
              <FileText size={10} className="mx-auto opacity-50" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function DocumentPreviewerLoading() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <DocumentPreviewerSkeleton width={200} height={260} />
      <p className="mt-3 text-xs text-[var(--text-mid)] animate-pulse">
        Cargando documento…
      </p>
    </div>
  );
}

export function DocumentPreviewerSkeleton({ width, height }: { width: number; height: number }) {
  return (
    <div
      className="rounded overflow-hidden"
      style={{
        width,
        height,
        background: 'var(--surface-active)',
        border: '1px solid var(--border)',
        boxShadow: DOC_PREVIEW_CANVAS_SHADOW,
      }}
    />
  );
}

export function DocumentPreviewerError({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center gap-3">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{ background: 'var(--disputed-subtle)', border: '1px solid var(--disputed)' }}
      >
        <FileText size={18} className="text-[var(--disputed)]" />
      </div>
      <p className="text-sm text-[var(--text-mid)]">{error}</p>
      <button
        type="button"
        onClick={onRetry}
        className="px-4 py-1.5 rounded-md text-xs font-medium border transition-colors hover:bg-[var(--surface-active)]"
        style={{ border: '1px solid var(--border-mid)', color: 'var(--text-hi)' }}
      >
        Reintentar
      </button>
    </div>
  );
}
