import { Copy, Heart } from 'lucide-react';
import { TariffItem, TariffStatus } from '@/types/tariff-reference';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { cn } from '@/lib/utils';

type BadgeVariant = 'cleared' | 'review' | 'disputed' | 'neutral' | 'intel';

interface TariffDetailHeaderProps {
  item: TariffItem;
  isFavorite: boolean;
  onFavoriteToggle: () => void;
  onCopy: () => void;
}

const STATUS_LABELS: Record<TariffStatus | 'inactive', string> = {
  active: 'Activo',
  suspended: 'Suspendido',
  'under-review': 'En revision',
  discontinued: 'Descontinuado',
  temporary: 'Temporal',
  inactive: 'Inactivo',
};

const STATUS_VARIANTS: Record<TariffStatus | 'inactive', BadgeVariant> = {
  active: 'cleared',
  suspended: 'disputed',
  'under-review': 'review',
  discontinued: 'neutral',
  temporary: 'intel',
  inactive: 'neutral',
};

export function TariffDetailHeader({
  item,
  isFavorite,
  onFavoriteToggle,
  onCopy,
}: TariffDetailHeaderProps) {
  const status: TariffStatus | 'inactive' = item.status ?? 'inactive';

  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <code className="text-2xl font-bold font-mono-numbers text-[var(--text-hi)] sm:text-3xl">
            {item.code}
          </code>
          <Button size="icon" variant="ghost" onClick={onCopy} aria-label="Copiar codigo">
            <Copy className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-sm text-[var(--text-mid)] leading-snug">{item.description}</p>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant={STATUS_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>
          <Button
            size="icon"
            variant={isFavorite ? 'default' : 'ghost'}
            onClick={onFavoriteToggle}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? 'Eliminar de favoritos' : 'Agregar a favoritos'}
          >
            <Heart className={cn('w-4 h-4', isFavorite ? 'text-[var(--danger-text)] fill-[var(--danger-text)]' : 'text-[var(--text-muted)]')} />
          </Button>
        </div>
      </div>
    </div>
  );
}
