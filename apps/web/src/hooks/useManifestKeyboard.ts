'use client';

import { useEffect } from 'react';

export interface UseManifestKeyboardOptions {
  enabled?: boolean;
  onNext?: () => void;
  onPrev?: () => void;
  onApprove?: () => void;
  onArbitrate?: () => void;
  onOpenDossier?: () => void;
}

export function useManifestKeyboard({
  enabled = true,
  onNext,
  onPrev,
  onApprove,
  onArbitrate,
  onOpenDossier,
}: UseManifestKeyboardOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        onOpenDossier?.();
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
        case 'j':
        case 'J':
          e.preventDefault();
          onNext?.();
          break;
        case 'ArrowUp':
        case 'k':
        case 'K':
          e.preventDefault();
          onPrev?.();
          break;
        case 'Enter':
          e.preventDefault();
          onApprove?.();
          break;
        case 'a':
        case 'A':
          e.preventDefault();
          onArbitrate?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, onNext, onPrev, onApprove, onArbitrate, onOpenDossier]);
}
