'use client';

import { useTariffReference } from './TariffReferenceProvider';
import { BookOpen } from 'lucide-react';
import { TariffItem } from '@/types/tariff-reference';
import { Breadcrumb } from './Breadcrumb';
import { BreadcrumbItem } from '@/types/tariff-reference';
import { TariffDetail } from './TariffDetail';

interface DetailPanelProps {
  item: TariffItem | null;
  breadcrumbs: BreadcrumbItem[];
}

export function DetailPanel({ item, breadcrumbs }: DetailPanelProps) {
  const { favorites, toggleFavorite } = useTariffReference();
  
  const isFavorite = item ? favorites.some(f => f.code === item.code) : false;
  
  const handleFavoriteToggle = () => {
    if (item) toggleFavorite(item);
  };
  
  const handleExport = (format: 'csv' | 'json') => {
    console.log(`Export ${format}:`, item);
  };

  return (
    <aside className="flex flex-col w-80 min-w-[320px] max-w-[400px] border-l" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <Breadcrumb items={breadcrumbs} />

      <div className="flex-1 overflow-y-auto p-4">
        {item ? (
          <>
            <TariffDetail
              item={item}
              onFavoriteToggle={handleFavoriteToggle}
              isFavorite={isFavorite}
              onExport={handleExport}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <BookOpen className="w-12 h-12 mb-4" style={{ color: 'var(--text-lo)' }} />
            <p className="text-[var(--text-lo)]">Seleccione una partida arancelaria</p>
            <p className="text-xs text-[var(--text-lo)] mt-2">Navegue el árbol o use la búsqueda</p>
          </div>
        )}
      </div>
    </aside>
  );
}
