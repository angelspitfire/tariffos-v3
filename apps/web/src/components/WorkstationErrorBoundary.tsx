'use client';

import React, { type ReactNode, type ErrorInfo } from 'react';

export type WorkstationErrorBoundaryProps = {
  fallback?: ReactNode;
  onError?: (error: Error) => void;
};

export class WorkstationErrorBoundary extends React.Component<
  WorkstationErrorBoundaryProps & { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: WorkstationErrorBoundaryProps & { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Workstation error boundary caught error:', error, {
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error } = this.state;

      return (
        <div
          className="flex flex-col items-center justify-center p-8 gap-4"
          role="alert"
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-[var(--danger-subtle)] text-[var(--danger-text)]"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="mx-auto"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="12" x2="16" y2="16" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-hi)]">
              Error en el trabajo
            </h3>
            <p className="text-xs text-[var(--text-lo)] mb-4">
              {error?.message || 'Ocurrió un error inesperado en el componente de trabajo'}
            </p>
            <button
              onClick={this.resetError}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-white transition-colors bg-[var(--brand)] border-0"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 11l8 8 8-8M4 15l8-8 8-8" />
              </svg>
              <span>Reload Work</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}