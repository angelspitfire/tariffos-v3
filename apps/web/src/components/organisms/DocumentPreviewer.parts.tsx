'use client';

import { useState } from 'react';
import { Download, Expand, Printer, ZoomIn, ZoomOut } from 'lucide-react';
import {
  DOC_PREVIEW_CANVAS_SHADOW,
  DOC_PREVIEW_ZOOM_PERCENT,
  DOC_PREVIEW_ZOOM_STEP,
} from '@/__mocks__';

const TOOLBAR_ITEM_STYLE = {
  background: 'var(--surface-active)',
  border: '1px solid var(--border)',
  color: 'var(--text-hi)',
} as const;

export function DocumentPreviewerHeader({
  fileName,
  title,
  subtitle,
}: {
  fileName?: string;
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="px-4 py-3 border-b border-solid">
      {title || subtitle ? (
        <div className="flex flex-col gap-1">
          {title && <h3 className="text-sm font-bold text-[var(--text-hi)]">{title}</h3>}
          {subtitle && <p className="text-[11px] text-[var(--text-mid)]">{subtitle}</p>}
        </div>
      ) : null}
      {fileName && (
        <div className="mt-2 px-2">
          <span className="text-[10px] font-mono text-[var(--text-mid)] truncate block">
            {fileName}
          </span>
        </div>
      )}
    </div>
  );
}

export function DocumentPreviewerToolbar({
  fileName,
  page,
  numPages,
  zoom,
  onPageChange,
  onZoom,
  onResetZoom,
  onDownload,
  onPrint,
  onFullscreen,
  toolbarHeight,
}: {
  fileName?: string;
  page: number;
  numPages: number;
  zoom: number;
  onPageChange: (next: number) => void;
  onZoom: (delta: number) => void;
  onResetZoom: () => void;
  onDownload: () => void;
  onPrint: () => void;
  onFullscreen: () => void;
  toolbarHeight: number;
}) {
  const [pageInput, setPageInput] = usePageInput(page);

  const handlePageInputBlur = () => {
    const parsed = Number(pageInput);
    if (Number.isFinite(parsed) && parsed >= 1 && parsed <= numPages) {
      onPageChange(parsed);
    }
    setPageInput(String(page));
  };

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const parsed = Number(pageInput);
      if (Number.isFinite(parsed) && parsed >= 1 && parsed <= numPages) {
        onPageChange(parsed);
      }
      setPageInput(String(page));
    }
  };

  return (
    <div
      className="sticky top-0 z-10 flex items-center justify-between gap-2 px-3 py-2"
      style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        height: toolbarHeight,
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        {fileName && (
          <span className="truncate text-xs text-[var(--text-hi)] min-w-0">{fileName}</span>
        )}
        <div className="flex items-center gap-1.5 min-w-[120px]">
          <input
            type="number"
            min={1}
            max={numPages}
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            onBlur={handlePageInputBlur}
            onKeyDown={handlePageInputKeyDown}
            className="w-12 text-[11px] font-mono text-center border-none bg-transparent text-[var(--text-hi)] focus:ring-0"
          />
          <span className="text-[11px] text-[var(--text-mid)]">/ {numPages}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onZoom(-DOC_PREVIEW_ZOOM_STEP)}
          className="flex items-center justify-center w-8 h-6 rounded-md shrink-0"
          style={TOOLBAR_ITEM_STYLE}
        >
          <ZoomOut size={12} />
        </button>
        <button
          type="button"
          onClick={onResetZoom}
          className="flex items-center justify-center w-8 h-6 rounded-md shrink-0"
          style={TOOLBAR_ITEM_STYLE}
        >
          <span className="text-[10px] font-mono">{Math.round(zoom * DOC_PREVIEW_ZOOM_PERCENT)}%</span>
        </button>
        <button
          type="button"
          onClick={() => onZoom(DOC_PREVIEW_ZOOM_STEP)}
          className="flex items-center justify-center w-8 h-6 rounded-md shrink-0"
          style={TOOLBAR_ITEM_STYLE}
        >
          <ZoomIn size={12} />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={onDownload} className="tooltip-anchor" style={TOOLBAR_ITEM_STYLE}>
          <Download size={14} className="opacity-70 hover:opacity-100 transition-opacity" />
        </button>
        <button type="button" onClick={onPrint} className="tooltip-anchor" style={TOOLBAR_ITEM_STYLE}>
          <Printer size={14} className="opacity-70 hover:opacity-100 transition-opacity" />
        </button>
        <button type="button" onClick={onFullscreen} className="tooltip-anchor" style={TOOLBAR_ITEM_STYLE}>
          <Expand size={14} className="opacity-70 hover:opacity-100 transition-opacity" />
        </button>
      </div>
    </div>
  );
}

export function DocumentPreviewerCanvasArea({
  zoom,
  isFullscreen,
  toolbarHeight,
}: {
  zoom: number;
  isFullscreen: boolean;
  toolbarHeight: number;
}) {
  return (
    <div
      className="flex-1 relative overflow-auto flex items-center justify-center"
      style={{
        background: 'var(--canvas)',
        ...(isFullscreen ? { position: 'fixed', inset: 0, zIndex: 50, background: 'var(--canvas)' } : {}),
      }}
    >
      <canvas
        id="doc-preview-canvas"
        className="shadow-lg rounded-sm"
        style={{
          boxShadow: DOC_PREVIEW_CANVAS_SHADOW,
          transform: `scale(${zoom})`,
          transformOrigin: 'center',
          width: '100%',
          height: `calc(100vh - ${toolbarHeight}px)`,
        }}
      />
    </div>
  );
}

function usePageInput(initial: number) {
  const [value, setValue] = useState<string>(String(initial));
  return [value, setValue] as [string, (v: string) => void];
}
