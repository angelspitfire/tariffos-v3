import { DocumentPreviewerPayload } from '@/types/generative-payloads';
import { SkeletonCard, SkeletonText } from '@/components/atoms/Skeleton';
import { FileText, ChevronLeft, ChevronRight, Download, Search, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useState, useRef } from 'react';

export function DocumentPreviewer({ payload, isLoading = false }: { payload: DocumentPreviewerPayload; isLoading?: boolean }) {
  if (isLoading) {
    return (
      <SkeletonCard>
        <SkeletonText lines={2} />
        <div className="h-64 mt-4 animate-pulse bg-[var(--surface-elevated)] rounded" />
      </SkeletonCard>
    );
  }

  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  
  const [searchTerm, setSearchTerm] = useState('');
  const pdfRef = useRef<HTMLDivElement>(null);

  const totalPages = 1;

  return (
    <div className="bg-[var(--surface-card)] border border-[var(--border-card)] rounded-xl overflow-hidden shadow-xl h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-divider)] bg-[var(--surface-overlay)]">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-[var(--purple-text)]" />
          <div>
            <p className="text-xs font-semibold text-[var(--text-hi)]">{payload.title}</p>
            <p className="text-[10px] text-[var(--text-lo)]">{payload.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar en documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1 bg-[var(--surface-elevated)] border border-[var(--border-mid)] rounded-md text-xs text-[var(--text-hi)] placeholder-zinc-500 focus:outline-none focus:border-[var(--brand)] w-48"
            />
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded hover:bg-[var(--surface-elevated)] text-zinc-400 hover:text-zinc-200 border border-[var(--border-mid)]" title="Rotar izquierda" onClick={() => setRotation(r => (r + 90) % 360)}>
              <RotateCcw className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded hover:bg-[var(--surface-elevated)] text-zinc-400 hover:text-zinc-200 border border-[var(--border-mid)]" title="Zoom out" onClick={() => setScale(Math.max(0.5, scale - 0.25))}>
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-[var(--text-lo)] px-1">{Math.round(scale * 100)}%</span>
            <button className="p-1.5 rounded hover:bg-[var(--surface-elevated)] text-zinc-400 hover:text-zinc-200 border border-[var(--border-mid)]" title="Zoom in" onClick={() => setScale(Math.min(3, scale + 0.25))}>
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4" style={{ background: 'var(--canvas)' }}>
        <div
          ref={pdfRef}
          className="flex flex-col items-center gap-4"
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            transformOrigin: 'top center',
          }}
        >
          <div
            key="doc"
            className="relative w-full max-w-2xl"
            style={{
              aspectRatio: '1 / 1.414', // A4 ratio
              background: 'white',
              border: '1px solid var(--border-mid)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div className="absolute top-2 right-2 z-10 flex gap-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-black/50 text-white">
                1 / 1
              </span>
            </div>
            <div className="w-full h-full flex items-center justify-center text-zinc-400">
              <FileText className="w-12 h-12" />
              <p>{payload.fileName ?? 'Documento'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-[var(--border-divider)] bg-[var(--surface-overlay)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            className="p-1.5 rounded hover:bg-[var(--surface-elevated)] text-zinc-400 hover:text-zinc-200 border border-[var(--border-mid)]"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            title="Página anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-[var(--text-lo)]">
            Página {currentPage} de {totalPages}
          </span>
          <button
            className="p-1.5 rounded hover:bg-[var(--surface-elevated)] text-zinc-400 hover:text-zinc-200 border border-[var(--border-mid)]"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            title="Página siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors" style={{ background: 'var(--surface-elevated)', color: 'var(--text-hi)', border: '1px solid var(--border-mid)' }}>
            <Download className="w-3 h-3 mr-1" />
            Descargar
          </button>
        </div>
      </div>
    </div>
  );
}
