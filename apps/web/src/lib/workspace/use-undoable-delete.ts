'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { WorkspaceToast } from './types';

export const UNDO_DELETE_DELAY_MS = 5000;

export interface UndoToastAction {
  actionLabel: string;
  onAction: () => void;
  durationMs?: number;
}

export interface ScheduleUndoableDeleteParams {
  key: string;
  toastTitle: string;
  onRestore: () => void;
  onCommit: () => void;
}

interface PendingDelete {
  timerId: number;
  onCommit: () => void;
}

/**
 * Schedules a reversible 5-second deletion with an Undo toast action.
 * If the user clicks "Deshacer" before the timeout, the item is restored and
 * persistence deletion is never invoked.
 */
export function useUndoableDelete(
  pushToast: (title: string, variant?: WorkspaceToast['variant'], action?: UndoToastAction) => void,
  dismissToast: () => void,
) {
  const pendingRef = useRef<Map<string, PendingDelete>>(new Map());

  useEffect(() => {
    const map = pendingRef.current;
    return () => {
      for (const entry of map.values()) {
        window.clearTimeout(entry.timerId);
      }
      map.clear();
    };
  }, []);

  const scheduleDelete = useCallback(
    ({ key, toastTitle, onRestore, onCommit }: ScheduleUndoableDeleteParams) => {
      const existing = pendingRef.current.get(key);
      if (existing) {
        window.clearTimeout(existing.timerId);
        pendingRef.current.delete(key);
      }

      const timerId = window.setTimeout(() => {
        pendingRef.current.delete(key);
        onCommit();
      }, UNDO_DELETE_DELAY_MS);

      pendingRef.current.set(key, { timerId, onCommit });

      pushToast(toastTitle, 'info', {
        actionLabel: 'Deshacer',
        durationMs: UNDO_DELETE_DELAY_MS,
        onAction: () => {
          const active = pendingRef.current.get(key);
          if (!active) return;
          window.clearTimeout(active.timerId);
          pendingRef.current.delete(key);
          onRestore();
          dismissToast();
        },
      });
    },
    [dismissToast, pushToast],
  );

  return { scheduleDelete };
}
