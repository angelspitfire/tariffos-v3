import { DataListPayload } from '@/types/domain';
import { SkeletonCard, SkeletonText } from '@/components/atoms/Skeleton';
import { FileText, ChevronRight } from 'lucide-react';

export function DataListCard({ payload, isLoading = false }: { payload: DataListPayload; isLoading?: boolean }) {
  if (isLoading) {
    return (
      <SkeletonCard>
        <SkeletonText lines={4} />
      </SkeletonCard>
    );
  }

  return (
    <div className="bg-[var(--surface-card)] border border-[var(--border-card)] rounded-xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold text-[var(--text-hi)]">{payload.title}</h4>
        <span className="text-[10px] font-mono text-[var(--text-muted)]">{payload.items.length} items</span>
      </div>
      <ul className="space-y-2">
        {payload.items.map((item, idx) => (
          <li key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--surface-elevated)] transition-colors cursor-pointer">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
              <span className="text-sm text-[var(--text-hi)] truncate">{item.label}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm font-mono-numbers text-[var(--text-lo)]">{item.value}</span>
              <ChevronRight className="w-3 h-3 text-[var(--text-muted)]" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
