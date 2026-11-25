'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  animation?: 'pulse' | 'wave' | 'none';
  style?: React.CSSProperties;
}

export function Skeleton({
  className,
  width = '100%',
  height = '1rem',
  borderRadius = 'var(--radius-md)',
  animation = 'pulse',
  style,
}: SkeletonProps) {
  const baseStyles: React.CSSProperties = {
    width,
    height,
    borderRadius,
    background: 'linear-gradient(90deg, var(--surface-raised) 25%, var(--border) 50%, var(--surface-raised) 75%)',
    backgroundSize: '200% 100%',
  };

  const animationStyles: Record<string, React.CSSProperties> = {
    pulse: {
      animation: 'pulse 1.5s ease-in-out infinite',
    },
    wave: {
      animation: 'wave 1.5s ease-in-out infinite',
    },
    none: {},
  };

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={{
        ...baseStyles,
        ...animationStyles[animation],
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

export function SkeletonText({
  lines = 3,
  className,
  lineHeight = '1.5rem',
}: {
  lines?: number;
  className?: string;
  lineHeight?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-1', className)} aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={`skeleton-line-${i}`}
          width={i === 0 ? '80%' : '100%'}
          height={lineHeight}
          animation="wave"
        />
      ))}
    </div>
  );
}

export function SkeletonCard({
  lines = 4,
  className,
  width = '100%',
}: {
  lines?: number;
  className?: string;
  width?: string | number;
}) {
  return (
    <div
      className={cn(
        'rounded-xl p-4 border',
        className
      )}
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border)',
        width,
      }}
      aria-hidden="true"
    >
      <SkeletonText lines={lines} />
    </div>
  );
}

export function SkeletonTable({
  rows = 5,
  columns = 6,
  className,
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div className={cn('w-full overflow-hidden border rounded-xl', className)} style={{ background: 'var(--surface)', borderColor: 'var(--border)' }} aria-hidden="true">
      <div className="overflow-hidden" style={{ background: 'var(--surface-overlay)' }}>
        <table className="w-full border-collapse" role="table">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] bg-zinc-900/60 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider sticky top-0 backdrop-blur-sm">
              {Array.from({ length: columns }, (_, i) => (
                <th key={`header-col-${i}`} className="py-2 px-3 text-left">
                  Columna {i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-divider)]">
            {Array.from({ length: rows }, (_, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-[var(--surface-elevated)]/50 transition-colors">
                {Array.from({ length: columns }, (_, colIndex) => (
                  <td key={colIndex} className="py-2 px-3 text-left">
                    <Skeleton width="60%" height="1rem" borderRadius="var(--radius-sm)" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function SkeletonList({
  items = 5,
  itemHeight = '4rem',
}: {
  items?: number;
  itemHeight?: string;
}) {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: items }, (_, i) => (
        <div
          key={`list-item-${i}`}
          className="flex items-center gap-3 p-3 rounded-lg border transition-colors"
          style={{ background: 'var(--surface-raised)', borderColor: 'var(--border)' }}
          aria-hidden="true"
        >
          <Skeleton
            width={itemHeight}
            height={itemHeight}
            borderRadius="var(--radius-lg)"
            animation="wave"
          />
          <div className="flex-1 min-w-0">
            <Skeleton width="60%" height="1rem" />
            <Skeleton width="40%" height="0.875rem" style={{ marginTop: '0.25rem' }} />
          </div>
          <Skeleton width="5rem" height="1.5rem" borderRadius="var(--radius-md)" />
        </div>
      ))}
    </div>
  );
}
