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
  loadSkuPrecedents: vi.fn(),
  loadUserProfile: vi.fn(),
  saveThread: vi.fn(),
  deleteThread: vi.fn(),
}));

vi.mock('../persistence', () => ({
  createWorkspacePersistence: () => ({
    loadLocalBootstrap: mocks.loadLocalBootstrap,
    loadThreads: mocks.loadThreads,
    loadSkuPrecedents: mocks.loadSkuPrecedents,
    loadUserProfile: mocks.loadUserProfile,
    saveThread: mocks.saveThread,
    deleteThread: mocks.deleteThread,
    saveSkuPrecedent: vi.fn().mockResolvedValue(undefined),
    deleteSkuPrecedent: vi.fn().mockResolvedValue(undefined),
    saveUserProfile: vi.fn().mockResolvedValue(undefined),
    clearLocal: vi.fn().mockResolvedValue(undefined),
  }),
}));

import { useWorkspaceState } from '../use-workspace-state';

function Harness() {
  const ws = useWorkspaceState();
  return (
    <div>
      <span data-testid="count">{ws.threads.length}</span>
      <span data-testid="active-id">{ws.activeThreadId ?? 'null'}</span>
      <span data-testid="active-title">{ws.activeThread?.title ?? 'none'}</span>
      <button type="button" onClick={() => ws.setActiveThreadId(SAMPLE_THREAD.id)}>
        select-old
      </button>
      <button type="button" onClick={() => ws.deleteThread(SAMPLE_THREAD.id)}>
        delete-old
      </button>
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
});
