'use client';

import { useCallback, useEffect, useState } from 'react';
import { ExternalLink, Download } from 'lucide-react';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { cn } from '@/lib/utils';
import { TOAST_DURATION_MS } from '@/__mocks__';
import { TariffDetailHeader } from './TariffDetailHeader';
import { TariffDutySection } from './TariffDutySection';
import { TariffItem } from '@/types/tariff-reference';

export interface TariffDetailProps {
  item?: TariffItem | null;
  onFavoriteToggle: (code: string, isFavorite: boolean) => void;
  isFavorite: boolean;
  onExport: (format: 'csv' | 'json') => void;
}

const EMPTY_STATE_MESSAGE = 'Seleccione un codigo arancelario para ver detalles';
const SENIAT_BASE_URL = 'https://seniat.gob.ve/consultas/arl';

export function TariffDetail({
  item,
  onFavoriteToggle,
  isFavorite,
  onExport,
}: TariffDetailProps) {
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'info' } | null>(null);

  const dismissToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(dismissToast, TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toast, dismissToast]);

  const handleCopy = useCallback(() => {
    if (!item || !navigator.clipboard) return;
    navigator.clipboard.writeText(item.code).then(() => {
      setToast({ message: `Codigo ${item.code} copiado al portapapeles`, variant: 'success' });
    });
  }, [item]);

  const handleFavorite = useCallback(() => {
    if (!item) return;
    const next = !isFavorite;
    onFavoriteToggle(item.code, next);
    setToast({ message: next ? 'Agregado a favoritos' : 'Eliminado de favoritos', variant: 'info' });
  }, [item, isFavorite, onFavoriteToggle]);

  const handleExportCsv = useCallback(() => onExport('csv'), [onExport]);
  const handleExportJson = useCallback(() => onExport('json'), [onExport]);

  if (!item) {
    return (
      <Card className="p-10 md:p-12 text-center print-layout">
        <p className="text-[var(--text-mid)]">{EMPTY_STATE_MESSAGE}</p>
      </Card>
    );
  }

  const toastStyles: Record<'success' | 'info', string> = {
    success: 'bg-[var(--success-subtle)] text-[var(--success-text)] border-[var(--success-border)]',
    info: 'bg-[var(--info-subtle)] text-[var(--info-text)] border-[var(--info-border)]',
  };

  return (
    <section className="tariff-detail space-y-6 print-layout">
      <style>
        {`
          @media print {
            .tariff-detail-print {
              background: #ffffff !important;
              color: #000000 !important;
              border: 1px solid #000000 !important;
              box-shadow: none !important;
            }
            .tariff-detail-print .print-hide {
              display: none !important;
            }
            .tariff-detail-print a[href]::after {
              content: ' (' attr(href) ')';
              font-size: 12px;
              color: #000000;
            }
            .tariff-detail-print code,
            .tariff-detail-print .font-mono-numbers {
              color: #000000 !important;
            }
          }
        `}
      </style>

      {toast && (
        <div
          className={cn(
            'print-hide flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium',
            toastStyles[toast.variant],
          )}
          role="status"
          aria-live="polite"
        >
          {toast.variant === 'success' ? (
            <span className="w-3 h-3 text-current">✓</span>
          ) : (
            <span className="w-3 h-3 text-current">ℹ</span>
          )}
          {toast.message}
        </div>
      )}

      <Card className={cn('tariff-detail-print p-6 md:p-8 space-y-6 print:overflow-visible')}>
        <TariffDetailHeader
          item={item}
          isFavorite={isFavorite}
          onFavoriteToggle={handleFavorite}
          onCopy={handleCopy}
        />

        <TariffDutySection item={item} />

        <section className="space-y-3">
          <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
            Descripcion
          </h3>
          <p className="text-sm text-[var(--text-hi)] leading-relaxed">
            {item.description}
          </p>
          {item.descriptionEs && item.descriptionEs !== item.description && (
            <>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mt-3">
                Descripcion (ES)
              </p>
              <p className="text-sm text-[var(--text-mid)] leading-relaxed">{item.descriptionEs}</p>
            </>
          )}
          {item.notes && (
            <>
              <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mt-6">
                Notas
              </h3>
              <p className="text-sm text-[var(--text-hi)] leading-relaxed">{item.notes}</p>
            </>
          )}
        </section>

        <div className="pt-4 border-t border-[var(--border-divider)] print-hide">
          <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <Button variant="outline" size="sm" onClick={handleExportCsv}>
              <Download className="w-3 h-3 mr-1" />
              Exportar CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportJson}>
              <Download className="w-3 h-3 mr-1" />
              Exportar JSON
            </Button>
            <Button asChild size="sm" variant="outline">
              <a
                href={`${SENIAT_BASE_URL}/${item.code}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Abrir en SENIAT
              </a>
            </Button>
          </div>
        </div>
      </Card>
    </section>
  );
}
