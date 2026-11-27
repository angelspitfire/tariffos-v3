import { useEffect } from 'react';

export interface UseWorkspaceShortcutsOptions {
  canvasOpen: boolean;
  hasOpenModal: boolean;
  onFocusComposer: () => void;
  onNewThread: () => void;
  onCloseCanvas: () => void;
}

/**
 * Global keyboard shortcuts for fast customs-brokerage navigation:
 * - Ctrl/Cmd + K: focus chat composer
 * - Alt + N (or Ctrl/Cmd + Shift + O): start fresh chat
 * - Escape: dismiss right-hand Canvas when no modal is open
 */
export function useWorkspaceShortcuts({
  canvasOpen,
  hasOpenModal,
  onFocusComposer,
  onNewThread,
  onCloseCanvas,
}: UseWorkspaceShortcutsOptions): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();

      if (mod && key === 'k') {
        event.preventDefault();
        onFocusComposer();
        return;
      }
      if ((event.altKey && key === 'n') || (mod && event.shiftKey && key === 'o')) {
        event.preventDefault();
        onNewThread();
        return;
      }
      if (event.key === 'Escape' && canvasOpen && !hasOpenModal) {
        if (event.defaultPrevented) return;
        if (document.querySelector('[role="dialog"], dialog[open], [data-workspace-dialog="open"]')) return;
        onCloseCanvas();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [canvasOpen, hasOpenModal, onCloseCanvas, onFocusComposer, onNewThread]);
}
