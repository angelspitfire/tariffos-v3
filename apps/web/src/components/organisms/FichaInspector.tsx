import { ManifestLineItem } from '@/types/domain';
import { SkeletonCard, SkeletonText } from '@/components/atoms/Skeleton';
import { FileText, Scale, Coins } from 'lucide-react';
import { CONFIDENCE_SAFE_THRESHOLD, CONFIDENCE_BORDERLINE_THRESHOLD, CONFIDENCE_PERCENT_MULTIPLIER } from '@/__mocks__';

export function FichaInspector({ item, isLoading = false }: { item: ManifestLineItem; isLoading?: boolean }) {
  if (isLoading) {
    return (
      <SkeletonCard>
        <SkeletonText lines={4} />
      </SkeletonCard>
    );
  }

  const confidencePercent = (item.confidence * CONFIDENCE_PERCENT_MULTIPLIER).toFixed(0);
  const isSafe = item.confidence >= CONFIDENCE_SAFE_THRESHOLD;
  const isBorderline = item.confidence >= CONFIDENCE_BORDERLINE_THRESHOLD;

  return (
    <div className="bg-[var(--surface-card)] border border-[var(--border-card)] rounded-xl p-4 shadow-xl">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--purple-subtle)', color: 'var(--purple-text)' }}>
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[var(--text-hi)]">Ficha de Clasificación: {item.hsCode}</h4>
            <p className="text-[11px] text-[var(--text-lo)] mt-0.5">{item.description}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-[var(--text-muted)]">Línea #{item.itemNumber}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-4">
        <div className="p-3 rounded-lg" style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border-card)' }}>
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Certeza</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full bg-[var(--surface)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: confidencePercent + '%',
                  background: isSafe ? 'var(--success-text)' : isBorderline ? 'var(--warning-text)' : 'var(--danger-text)',
                }}
              />
            </div>
            <span className="text-lg font-bold font-mono-numbers" style={{ color: isSafe ? 'var(--success-text)' : isBorderline ? 'var(--warning-text)' : 'var(--danger-text)' }}>
              {confidencePercent}%
            </span>
          </div>
        </div>
        <div className="p-3 rounded-lg" style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border-card)' }}>
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Arancel Ad-Valorem</p>
          <p className="text-2xl font-bold text-[var(--text-hi)] font-mono-numbers">{item.dutyRate}%</p>
        </div>
        <div className="p-3 rounded-lg" style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border-card)' }}>
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">IVA Aduanero</p>
          <p className="text-2xl font-bold text-[var(--text-hi)] font-mono-numbers">{item.vatRate}%</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 mb-4">
        <div className="p-3 rounded-lg" style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border-card)' }}>
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">CIF Unitario</p>
          <p className="text-lg font-bold text-[var(--text-hi)] font-mono-numbers">${item.cifValue.toLocaleString()}</p>
        </div>
        <div className="p-3 rounded-lg" style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border-card)' }}>
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Cantidad</p>
          <p className="text-lg font-bold text-[var(--text-hi)] font-mono-numbers">{item.quantity} {item.unit}</p>
        </div>
      </div>

      <div className="pt-4 border-t border-[var(--border-divider)]">
        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Fundamento Legal</p>
        <p className="text-[11px] text-[var(--text-mid)]">Clasificación conforme a RGI 1 y 6 del Sistema Armonizado y Notas de la Sección XVI.</p>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        <button className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors" style={{ background: 'var(--surface-elevated)', color: 'var(--text-hi)', border: '1px solid var(--border-mid)' }}>
          <Scale className="w-3 h-3 mr-1" />
          Arbitraje
        </button>
        <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors" style={{ background: 'var(--brand)', border: 'none' }}>
          <Coins className="w-3 h-3 mr-1" />
          Liquidación
        </button>
      </div>
    </div>
  );
}
