// @vitest-environment jsdom
import { act, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { WorkspaceThread } from '../types';

const SAMPLE_THREAD: WorkspaceThread = {
  id: 'thread-old-1',
  title: 'Inversor solar antiguo',
  jurisdictionId: 've-seniat',
  status: 'regular',
  messages: [],
  createdAt: '2026-11-20T10:00:00.000Z',
  updatedAt: '2026-11-20T10:00:00.000Z',
};

const SECOND_THREAD: WorkspaceThread = {
  id: 'thread-old-2',
  title: 'Compresor antiguo',
  jurisdictionId: 've-seniat',
  status: 'regular',
  messages: [],
  createdAt: '2026-11-21T10:00:00.000Z',
  updatedAt: '2026-11-21T10:00:00.000Z',
};

const mocks = vi.hoisted(() => ({
  loadLocalBootstrap: vi.fn(),
  loadThreads: vi.fn(),
  loadThreadDetail: vi.fn(),
  patchThreadMeta: vi.fn(),
  searchThreads: vi.fn(),
  loadSkuPrecedents: vi.fn(),
  loadUserProfile: vi.fn(),
  saveThread: vi.fn(),
  deleteThread: vi.fn(),
  deleteSkuPrecedent: vi.fn(),
}));

vi.mock('../persistence', () => ({
  createWorkspacePersistence: () => ({
    loadLocalBootstrap: mocks.loadLocalBootstrap,
    loadThreads: mocks.loadThreads,
    loadThreadDetail: mocks.loadThreadDetail,
    patchThreadMeta: mocks.patchThreadMeta,
    searchThreads: mocks.searchThreads,
    loadSkuPrecedents: mocks.loadSkuPrecedents,
    loadUserProfile: mocks.loadUserProfile,
    saveThread: mocks.saveThread,
    deleteThread: mocks.deleteThread,
    saveSkuPrecedent: vi.fn().mockResolvedValue(undefined),
    deleteSkuPrecedent: mocks.deleteSkuPrecedent,
    saveUserProfile: vi.fn().mockResolvedValue(undefined),
    clearLocal: vi.fn().mockResolvedValue(undefined),
  }),
  normalizeSkuKey: (s: string) => s.trim().toUpperCase(),
}));

import { useWorkspaceState } from '../use-workspace-state';

function Harness() {
  const ws = useWorkspaceState();
  return (
    <div>
      <span data-testid="count">{ws.threads.length}</span>
      <span data-testid="loading">{String(ws.threadsLoading)}</span>
      <span data-testid="active-id">{ws.activeThreadId ?? 'null'}</span>
      <span data-testid="active-title">{ws.activeThread?.title ?? 'none'}</span>
      <button type="button" onClick={() => ws.setActiveThreadId(SAMPLE_THREAD.id)}>
        select-old
      </button>
      <button type="button" onClick={() => ws.deleteThread(SAMPLE_THREAD.id)}>
        delete-old
      </button>
      <span data-testid="toast-title">{ws.toast?.title ?? ''}</span>
      {ws.toast?.actionLabel && ws.toast?.onAction ? (
        <button type="button" onClick={ws.toast.onAction}>
          {ws.toast.actionLabel}
        </button>
      ) : null}
    </div>
  );
}

describe('useWorkspaceState startup thread selection', () => {
  it('hydrates history into sidebar while starting on a fresh empty chat (activeThreadId = null) and resets to null on delete', async () => {
    mocks.loadLocalBootstrap.mockResolvedValue({
      threads: [SAMPLE_THREAD, SECOND_THREAD],
      skuPrecedents: [],
      profile: null,
    });
    mocks.loadThreads.mockResolvedValue([SAMPLE_THREAD, SECOND_THREAD]);
    mocks.loadSkuPrecedents.mockResolvedValue([]);
    mocks.loadUserProfile.mockResolvedValue(null);
    mocks.deleteThread.mockResolvedValue(undefined);

    render(<Harness />);

    await waitFor(() => {
      expect(screen.getByTestId('count').textContent).toBe('2');
    });

    expect(screen.getByTestId('active-id').textContent).toBe('null');
    expect(screen.getByTestId('active-title').textContent).toBe('none');

    act(() => {
      screen.getByRole('button', { name: 'select-old' }).click();
    });
    expect(screen.getByTestId('active-id').textContent).toBe(SAMPLE_THREAD.id);

    act(() => {
      screen.getByRole('button', { name: 'delete-old' }).click();
    });
    expect(screen.getByTestId('active-id').textContent).toBe('null');
  });

  it('hydrates sidebar threads and clears threadsLoading as soon as loadThreads resolves without waiting for precedents or profile', async () => {
    mocks.loadLocalBootstrap.mockResolvedValue({
      threads: [],
      skuPrecedents: [],
      profile: null,
    });
    mocks.loadThreads.mockResolvedValue([SAMPLE_THREAD]);
    mocks.loadSkuPrecedents.mockReturnValue(new Promise(() => {}));
    mocks.loadUserProfile.mockReturnValue(new Promise(() => {}));

    render(<Harness />);

    await waitFor(() => {
      expect(screen.getByTestId('count').textContent).toBe('1');
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
  });

  it('clears threadsLoading immediately when loadLocalBootstrap returns cached threads even while cloud loadThreads is still pending', async () => {
    mocks.loadLocalBootstrap.mockResolvedValue({
      threads: [SAMPLE_THREAD],
      skuPrecedents: [],
      profile: null,
    });
    mocks.loadThreads.mockReturnValue(new Promise(() => {}));
    mocks.loadSkuPrecedents.mockResolvedValue([]);
    mocks.loadUserProfile.mockResolvedValue(null);

    render(<Harness />);

    await waitFor(() => {
      expect(screen.getByTestId('count').textContent).toBe('1');
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
  });

  it('defers thread deletion for 5s with an Undo action that restores the thread and cancels persistence.deleteThread', async () => {
    mocks.deleteThread.mockReset();
    mocks.deleteThread.mockResolvedValue(undefined);
    mocks.loadLocalBootstrap.mockResolvedValue({
      threads: [SAMPLE_THREAD, SECOND_THREAD],
      skuPrecedents: [],
      profile: null,
    });
    mocks.loadThreads.mockResolvedValue([SAMPLE_THREAD, SECOND_THREAD]);
    mocks.loadSkuPrecedents.mockResolvedValue([]);
    mocks.loadUserProfile.mockResolvedValue(null);

    render(<Harness />);

    await waitFor(() => {
      expect(screen.getByTestId('count').textContent).toBe('2');
    });

    act(() => {
      screen.getByRole('button', { name: 'delete-old' }).click();
    });

    expect(screen.getByTestId('count').textContent).toBe('1');
    expect(mocks.deleteThread).not.toHaveBeenCalled();

    const undoBtn = screen.getByRole('button', { name: 'Deshacer' });
    act(() => {
      undoBtn.click();
    });

    expect(screen.getByTestId('count').textContent).toBe('2');
    expect(mocks.deleteThread).not.toHaveBeenCalled();
  });

  it('hydrates thread messages lazily on selectThread, patches clientRef, and archives without wiping cache', async () => {
    const summaryThread: WorkspaceThread = {
      ...SAMPLE_THREAD,
      messagesLoaded: false,
      messages: [],
    };
    const hydratedThread: WorkspaceThread = {
      ...SAMPLE_THREAD,
      messagesLoaded: true,
      messages: [
        {
          id: 'm1',
          role: 'user',
          text: 'Inversor solar antiguo',
          createdAt: '2026-11-20T10:00:00.000Z',
          jurisdictionId: 've-seniat',
        },
      ],
    };
    mocks.loadLocalBootstrap.mockResolvedValue({ threads: [summaryThread], skuPrecedents: [], profile: null });
    mocks.loadThreads.mockResolvedValue([summaryThread]);
    mocks.loadThreadDetail.mockResolvedValue(hydratedThread);
    mocks.patchThreadMeta.mockResolvedValue(undefined);
    mocks.loadSkuPrecedents.mockResolvedValue([]);
    mocks.loadUserProfile.mockResolvedValue(null);

    function ProcessHarness() {
      const ws = useWorkspaceState();
      return (
        <div>
          <span data-testid="msg-count">{ws.activeThread?.messages.length ?? 0}</span>
          <span data-testid="client-ref">{ws.threads[0]?.clientRef ?? 'none'}</span>
          <span data-testid="op-status">{ws.threads[0]?.operationalStatus ?? 'none'}</span>
          <button type="button" onClick={() => void ws.selectThread(SAMPLE_THREAD.id)}>
            open-summary
          </button>
          <button type="button" onClick={() => ws.updateThreadClientRef(SAMPLE_THREAD.id, 'Polar · BL-10')}>
            tag-client
          </button>
          <button type="button" onClick={() => ws.archiveThread(SAMPLE_THREAD.id)}>
            archive-one
          </button>
        </div>
      );
    }

    render(<ProcessHarness />);
    await waitFor(() => {
      expect(screen.getByTestId('op-status').textContent).toBe('none');
    });

    await act(async () => {
      screen.getByRole('button', { name: 'open-summary' }).click();
    });
    await waitFor(() => {
      expect(mocks.loadThreadDetail).toHaveBeenCalledWith(SAMPLE_THREAD.id);
      expect(screen.getByTestId('msg-count').textContent).toBe('1');
    });

    act(() => {
      screen.getByRole('button', { name: 'tag-client' }).click();
      screen.getByRole('button', { name: 'archive-one' }).click();
    });

    expect(screen.getByTestId('client-ref').textContent).toBe('Polar · BL-10');
    expect(screen.getByTestId('op-status').textContent).toBe('archived');
    expect(mocks.patchThreadMeta).toHaveBeenCalledWith(SAMPLE_THREAD.id, { clientRef: 'Polar · BL-10' });
    expect(mocks.patchThreadMeta).toHaveBeenCalledWith(SAMPLE_THREAD.id, {
      status: 'archived',
      operationalStatus: 'archived',
    });
  });
});
