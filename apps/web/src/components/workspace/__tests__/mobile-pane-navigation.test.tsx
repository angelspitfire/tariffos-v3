// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { A2UIBatchManifestComponent } from '@tariffos/shared-types';
import { DEFAULT_USER_PROFILE } from '@/lib/workspace/types';
import { WorkspaceMobilePaneTabs } from '../molecules/WorkspaceMobilePaneTabs';

const BATCH_COMPONENT: A2UIBatchManifestComponent = {
  type: 'batch_manifest',
  id: 'batch-1',
  title: 'Manifiesto de Lote',
  currencyCode: 'USD',
  items: [],
};

vi.mock('@/lib/workspace/use-workspace-state', () => ({
  useWorkspaceState: () => ({
    threads: [],
    threadsLoading: false,
    activeThread: null,
    activeThreadId: null,
    selectedCanvasMsgId: null,
    canvasComponents: [BATCH_COMPONENT],
    activeTab: 'batch_manifest',
    jurisdiction: {
      id: 've-seniat',
      country: 'Venezuela',
      countryCode: 'VE',
      authority: 'SENIAT',
      currency: 'USD',
    },
    skuPrecedents: [],
    profile: DEFAULT_USER_PROFILE,
    toast: null,
    pendingAttachments: [],
    setActiveTab: vi.fn(),
    setActiveThreadId: vi.fn(),
    setSelectedCanvasMsgId: vi.fn(),
    setJurisdictionId: vi.fn(),
    setApprovalWorkflowMode: vi.fn(),
    updateProfile: vi.fn(),
    startNewThread: vi.fn(),
    deleteThread: vi.fn(),
    clearLocalData: vi.fn(),
    bindEveSessionId: vi.fn(),
    ingestExternalMessage: vi.fn(),
    syncChatMessages: vi.fn(),
    approveActiveDossier: vi.fn(),
    requestDossierReview: vi.fn(),
    confirmBatchItem: vi.fn(),
    saveSku: vi.fn(),
    saveSkuFromMessage: vi.fn(),
    deleteSku: vi.fn(),
    pushToast: vi.fn(),
    sendClassification: vi.fn(),
    addFiles: vi.fn(),
    removeAttachment: vi.fn(),
    consumePendingAttachments: vi.fn(),
  }),
}));

vi.mock('@/lib/workspace/use-cloud-usage', () => ({
  useCloudUsageState: () => ({ usage: null, loaded: true }),
  useCloudUsageSnapshot: () => null,
}));

vi.mock('@/lib/workspace/use-batch-job', () => ({
  useBatchJob: () => ({
    bannerState: null,
    startBatchUpload: vi.fn(),
    dismissJob: vi.fn(),
  }),
}));

vi.mock('../molecules/WorkspaceThreadSlot', () => ({
  WorkspaceThreadSlot: () => <div data-testid="mock-thread-slot">Thread</div>,
}));

vi.mock('../molecules/WorkspaceSidebarSlot', () => ({
  WorkspaceSidebarSlot: () => <div data-testid="mock-sidebar-slot" />,
}));

vi.mock('../organisms/WorkspaceCanvasPane', () => ({
  WorkspaceCanvasPane: ({ onCloseCanvas }: { onCloseCanvas: () => void }) => (
    <div data-testid="mock-canvas-pane">
      <button type="button" onClick={onCloseCanvas} aria-label="Cerrar panel de dictamen">
        Cerrar
      </button>
    </div>
  ),
}));

import { WorkspaceSplitShell } from '../templates/WorkspaceSplitShell';

describe('Mobile Chat <-> Canvas navigation (Plan 1.3)', () => {
  it('renders dynamic canvasLabel ("Lote"), aria-current="page", and safe-area padding on WorkspaceMobilePaneTabs', () => {
    render(
      <WorkspaceMobilePaneTabs
        activePane="canvas"
        canvasLabel="Lote"
        onSelectPane={vi.fn()}
      />,
    );

    const nav = screen.getByRole('navigation', { name: /Cambiar vista móvil/i });
    expect(nav.className).toContain('env(safe-area-inset-bottom)');
    const loteBtn = screen.getByRole('button', { name: /Lote/i });
    const chatBtn = screen.getByRole('button', { name: /Chat/i });
    expect(loteBtn).toHaveAttribute('aria-current', 'page');
    expect(chatBtn).not.toHaveAttribute('aria-current');
  });

  it('keeps mobile tabs outside hidden chat column, exposes #workspace-main, and preserves canvas on mobile close', async () => {
    const user = userEvent.setup();
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 390 });

    render(<WorkspaceSplitShell />);

    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('id', 'workspace-main');

    const loteBtn = screen.getByRole('button', { name: /Lote/i });
    await user.click(loteBtn);

    const nav = screen.getByRole('navigation', { name: /Cambiar vista móvil/i });
    // Ensure nav is NOT inside a hidden chat column when mobilePane === 'canvas'
    expect(nav.closest('.hidden')).toBeNull();
    expect(loteBtn).toHaveAttribute('aria-current', 'page');

    // Closing Canvas on mobile returns to Chat without destroying the switcher
    await user.click(screen.getByRole('button', { name: /Cerrar panel de dictamen/i }));
    expect(screen.getByRole('button', { name: /^Chat$/i })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: /^Lote$/i })).toBeInTheDocument();
  });
});
