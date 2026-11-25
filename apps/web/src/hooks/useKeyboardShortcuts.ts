'use client';

import { useCallback, useEffect, useRef } from 'react';

export function useKeyboardShortcuts({
  onToggleModal,
}: {
  onToggleModal: () => void;
}) {
  const mountedRef = useRef(true);
  const handler = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault();
        onToggleModal();
      }
    },
    [onToggleModal]
  );

  useEffect(() => {
    mountedRef.current = true;

    window.addEventListener('keydown', handler);

    return () => {
      mountedRef.current = false;
      window.removeEventListener('keydown', handler);
    };
  }, [handler]);
}