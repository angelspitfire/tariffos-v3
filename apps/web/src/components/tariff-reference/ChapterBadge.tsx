import { cn } from '@/lib/utils';

interface ChapterBadgeProps {
  code: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export function ChapterBadge({ code, label, isActive, onClick }: ChapterBadgeProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors w-full text-left',
        isActive
          ? 'bg-[var(--surface-active)] text-[var(--text-hi)] border-l-2 border-l-[var(--brand)]'
          : 'text-[var(--text-mid)] hover:bg-white/5 hover:text-[var(--text-hi)]'
      )}
      style={{ borderLeft: isActive ? '2px solid var(--brand)' : '2px solid transparent' }}
    >
      <span className="font-mono text-xs text-[var(--brand)]">{code}</span>
      <span className="text-sm font-medium truncate">{label}</span>
    </button>
  );
}
