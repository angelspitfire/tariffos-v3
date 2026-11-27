// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { useWorkspaceShortcuts } from '../use-workspace-shortcuts';

function ShortcutHarness(props: {
  canvasOpen: boolean;
  hasOpenModal: boolean;
  onFocusComposer: () => void;
  onNewThread: () => void;
  onCloseCanvas: () => void;
}) {
  useWorkspaceShortcuts(props);
  return <textarea aria-label="Consulta arancelaria o descripción de mercancía" />;
}

describe('useWorkspaceShortcuts', () => {
  it('handles Ctrl+K to focus composer, Alt+N for new thread, and Escape to close Canvas when no modal is open', () => {
    const onFocusComposer = vi.fn();
    const onNewThread = vi.fn();
    const onCloseCanvas = vi.fn();

    const { rerender } = render(
      <ShortcutHarness
        canvasOpen={true}
        hasOpenModal={false}
        onFocusComposer={onFocusComposer}
        onNewThread={onNewThread}
        onCloseCanvas={onCloseCanvas}
      />,
    );

    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(onFocusComposer).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'n', altKey: true });
    expect(onNewThread).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onCloseCanvas).toHaveBeenCalledTimes(1);

    rerender(
      <ShortcutHarness
        canvasOpen={true}
        hasOpenModal={true}
        onFocusComposer={onFocusComposer}
        onNewThread={onNewThread}
        onCloseCanvas={onCloseCanvas}
      />,
    );
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onCloseCanvas).toHaveBeenCalledTimes(1);
  });
});
