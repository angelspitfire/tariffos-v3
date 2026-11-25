'use client';

import { ReactNode, Suspense } from 'react';

interface LoadingBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function LoadingBoundary({
  children,
  fallback,
}: LoadingBoundaryProps) {
  const defaultFallback = (
    <div
      className="flex flex-col items-center justify-center p-8 gap-4"
      role="status"
      aria-label="Cargando..."
      style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}
    >
      <div className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <span
            key={`dot-${i}`}
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: 'var(--brand)',
              animation: `pulse 1.2s ease-in-out ${(i * 2) / 10}s infinite`,
              opacity: 0.6,
            }}
          />
        ))}
      </div>
      <span className="text-xs" style={{ color: 'var(--text-lo)' }}>
        Cargando...
      </span>
    </div>
  );

  return (
    <Suspense fallback={fallback ?? defaultFallback}>
      {children}
    </Suspense>
  );
}

export function withLoadingBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithLoadingBoundary(props: P) {
    return (
      <LoadingBoundary>
        <WrappedComponent {...props} />
      </LoadingBoundary>
    );
  };
}
