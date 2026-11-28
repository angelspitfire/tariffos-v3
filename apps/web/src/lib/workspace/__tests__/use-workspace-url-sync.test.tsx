// @vitest-environment jsdom
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { CanvasTabType } from '@tariffos/shared-types';
import { useWorkspaceUrlSync } from '../use-workspace-url-sync';
import { useWorkspaceShellLayout } from '../use-split-layout';

function UrlSyncHarness(props: {
  activeThreadId: string | null;
  activeTab: CanvasTabType;
  analyticsOpen: boolean;
  hasCanvas: boolean;
  onHydrateThread: (id: string) => void;
  onHydrateTab: (tab: CanvasTabType) => void;
  onHydrateAnalytics: (open: boolean) => void;
}) {
  useWorkspaceUrlSync(props);
  return null;
}

function ResizerHarness() {
  const layout = useWorkspaceShellLayout({
    activeThreadId: 't-1',
    hasCanvas: true,
    themePreference: 'light',
    onSaveTheme: vi.fn(),
  });
  return (
    <div style={{ width: 1000 }}>
      <span data-testid="pct">{Math.round(layout.chatWidthPct)}</span>
      <div
        role="separator"
        aria-orientation="vertical"
        aria-valuenow={Math.round(layout.chatWidthPct)}
        tabIndex={0}
        onPointerDown={layout.handleStartResize}
        onKeyDown={layout.handleResizeKeyDown}
      />
    </div>
  );
}

describe('useWorkspaceUrlSync & accessible split resizer (Plan 3.3 + 3.4)', () => {
  it('hydrates initial state from ?thread=&tab=&view=processes (and legacy view=analytics) and syncs URL via history.replaceState', () => {
    window.history.replaceState(null, '', '/app?thread=thr-99&tab=calculator&view=analytics');

    const onHydrateThread = vi.fn();
    const onHydrateTab = vi.fn();
    const onHydrateAnalytics = vi.fn();

    const { rerender } = render(
      <UrlSyncHarness
        activeThreadId={null}
        activeTab="dossier"
        analyticsOpen={false}
        hasCanvas={false}
        onHydrateThread={onHydrateThread}
        onHydrateTab={onHydrateTab}
        onHydrateAnalytics={onHydrateAnalytics}
      />,
    );

    expect(onHydrateThread).toHaveBeenCalledWith('thr-99');
    expect(onHydrateTab).toHaveBeenCalledWith('calculator');
    expect(onHydrateAnalytics).toHaveBeenCalledWith(true);

    rerender(
      <UrlSyncHarness
        activeThreadId="thr-99"
        activeTab="calculator"
        analyticsOpen={false}
        hasCanvas={true}
        onHydrateThread={onHydrateThread}
        onHydrateTab={onHydrateTab}
        onHydrateAnalytics={onHydrateAnalytics}
      />,
    );

    expect(window.location.search).toBe('?thread=thr-99&tab=calculator');

    rerender(
      <UrlSyncHarness
        activeThreadId={null}
        activeTab="dossier"
        analyticsOpen={true}
        hasCanvas={false}
        onHydrateThread={onHydrateThread}
        onHydrateTab={onHydrateTab}
        onHydrateAnalytics={onHydrateAnalytics}
      />,
    );

    expect(window.location.search).toBe('?view=processes');
  });

  it('adjusts chatWidthPct by ±4% via ArrowLeft/ArrowRight on role="separator"', () => {
    render(<ResizerHarness />);
    const sep = screen.getByRole('separator');
    expect(screen.getByTestId('pct').textContent).toBe('46');

    act(() => {
      fireEvent.keyDown(sep, { key: 'ArrowRight' });
    });
    expect(screen.getByTestId('pct').textContent).toBe('50');

    act(() => {
      fireEvent.keyDown(sep, { key: 'ArrowLeft' });
    });
    expect(screen.getByTestId('pct').textContent).toBe('46');
  });
});
