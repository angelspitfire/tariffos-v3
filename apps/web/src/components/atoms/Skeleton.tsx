export function Skeleton({ className = '', style, children }: { className?: string; style?: React.CSSProperties; children?: React.ReactNode }) {
  return (
    <div
      className={`animate-pulse bg-[var(--surface-elevated)] rounded ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

export function SkeletonText({ lines = 3, className = '', children }: { lines?: number; className?: string; children?: React.ReactNode }) {
  return (
    <div className={className}>
      {children ?? (
        Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={`text-line-${i}`} className="h-3 w-full mb-2" style={{ width: i === lines - 1 ? '60%' : '100%' }} />
        ))
      )}
    </div>
  );
}

export function SkeletonCard({ className = '', children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div className={`bg-[var(--surface-card)] border border-[var(--border-card)] rounded-xl p-4 animate-pulse ${className}`}>
      {children ?? (
        <>
          <Skeleton className="h-4 w-1/4 mb-4" />
          <SkeletonText lines={3} />
        </>
      )}
    </div>
  );
}

export function SkeletonTableRow({ columns = 8, className = '' }: { columns?: number; className?: string }) {
  return (
    <div className={`grid gap-4 animate-pulse ${className}`} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={`row-col-${i}`} className="h-8" />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 8, className = '' }: { rows?: number; columns?: number; className?: string }) {
  return (
    <div className={className}>
      <div className="grid gap-4 mb-4 animate-pulse" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`header-col-${i}`} className="h-6 w-full" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, row) => (
        <SkeletonTableRow key={`row-${row}`} columns={columns} />
      ))}
    </div>
  );
}
