// @vitest-environment jsdom
import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mergeSyncedMessagesIntoThread } from '../thread-mutations';
import { useAgencyTeam } from '../use-agency-team';
import { useProcessPresence } from '../use-process-presence';
import { useWorkspaceState } from '../use-workspace-state';

const mocks = vi.hoisted(() => ({
  isCloudModeEnabled: vi.fn(() => true),
  loadLocalBootstrap: vi.fn(),
  loadThreads: vi.fn(),
  patchThreadMeta: vi.fn(),
  saveThread: vi.fn(),
  loadSkuPrecedents: vi.fn(),
  loadUserProfile: vi.fn(),
}));

vi.mock('@/lib/runtime-config', () => ({
  isCloudModeEnabled: mocks.isCloudModeEnabled,
}));

vi.mock('../persistence', () => ({
  createWorkspacePersistence: () => ({
    loadLocalBootstrap: mocks.loadLocalBootstrap,
    loadThreads: mocks.loadThreads,
    patchThreadMeta: mocks.patchThreadMeta,
    saveThread: mocks.saveThread,
    deleteThread: vi.fn().mockResolvedValue(undefined),
    loadSkuPrecedents: mocks.loadSkuPrecedents,
    saveSkuPrecedent: vi.fn().mockResolvedValue(undefined),
    deleteSkuPrecedent: vi.fn().mockResolvedValue(undefined),
    loadUserProfile: mocks.loadUserProfile,
    saveUserProfile: vi.fn().mockResolvedValue(undefined),
    clearLocal: vi.fn().mockResolvedValue(undefined),
  }),
  normalizeSkuKey: (s: string) => s.trim().toUpperCase(),
}));

function TeamHarness() {
  const team = useAgencyTeam();
  const peers = useProcessPresence({ threadId: 'thr-1', currentUser: team.currentUser });
  return (
    <div>
      <span data-testid="role">{team.role}</span>
      <span data-testid="members">{team.members.length}</span>
      <span data-testid="peers">{peers.length}</span>
      <button type="button" onClick={() => void team.inviteMember('nuevo@agencia.ve', 'REVIEWER')}>
        invite
      </button>
    </div>
  );
}

describe('Fase B collaboration hooks (useAgencyTeam, useProcessPresence, attribution & signoff guard)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('loads agency team, supports inviteMember, and safely falls back on presence when Supabase realtime is absent', async () => {
    mocks.isCloudModeEnabled.mockReturnValue(true);
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            role: 'OWNER',
            currentUser: { userId: 'u-1', email: 'owner@agencia.ve', fullName: 'Carlos', role: 'OWNER' },
            members: [
              { userId: 'u-1', email: 'owner@agencia.ve', fullName: 'Carlos', role: 'OWNER' },
              { userId: 'u-2', email: 'ana@agencia.ve', fullName: 'Ana', role: 'ANALYST' },
            ],
            invitations: [],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            ok: true,
            invitation: { id: 'inv-1', email: 'nuevo@agencia.ve', role: 'REVIEWER', status: 'PENDING', expiresAt: '2026-12-05T00:00:00Z' },
          }),
          { status: 201 },
        ),
      );
    vi.stubGlobal('fetch', fetchMock);

    render(<TeamHarness />);
    await waitFor(() => {
      expect(screen.getByTestId('members').textContent).toBe('2');
    });
    expect(screen.getByTestId('role').textContent).toBe('OWNER');
    expect(screen.getByTestId('peers').textContent).toBe('0');

    await act(async () => {
      screen.getByRole('button', { name: 'invite' }).click();
    });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/workspace/team',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('stamps user author attribution onto newly merged messages and blocks ANALYST seal in always_review mode', async () => {
    const merged = mergeSyncedMessagesIntoThread(
      null,
      'thr-shared',
      [
        {
          id: 'u-msg-1',
          role: 'user',
          text: 'Clasifica bomba centrífuga',
          createdAt: '2026-11-28T10:00:00Z',
          jurisdictionId: 've-seniat',
        },
      ],
      've-seniat',
      { userId: 'u-ana', fullName: 'Ana Pérez' },
    );
    expect(merged.messages[0]?.authorName).toBe('Ana Pérez');
    expect(merged.messages[0]?.authorInitials).toBe('AP');
    expect(merged.messages[0]?.authorUserId).toBe('u-ana');

    const activeThread = {
      id: 'thr-1',
      title: 'Bomba',
      jurisdictionId: 've-seniat',
      status: 'regular' as const,
      messages: [
        {
          id: 'm1',
          role: 'assistant' as const,
          text: 'OK',
          createdAt: '2026-11-28T10:00:00Z',
          jurisdictionId: 've-seniat',
          envelope: {
            assistantMessage: 'OK',
            classificationStatus: 'classified' as const,
            inlineComponents: [],
            canvasComponents: [
              {
                type: 'dossier' as const,
                id: 'd1',
                title: 'Bomba',
                hsCode: '8413.70.10.00',
                officialDescription: 'Bombas',
                jurisdictionName: 'Venezuela',
                reviewStatus: 'draft_ai' as const,
                technicalSpecs: [],
                rgiSteps: [],
                legalNotes: [],
                permits: [],
                flags: [],
              },
            ],
          },
        },
      ],
      createdAt: '2026-11-28T10:00:00Z',
      updatedAt: '2026-11-28T10:00:00Z',
    };

    mocks.loadLocalBootstrap.mockResolvedValue({
      threads: [activeThread],
      skuPrecedents: [],
      profile: {
        fullName: 'Ana Pérez',
        email: 'ana@agencia.ve',
        role: 'Analista',
        companyName: 'Agencia',
        brokerLicense: 'L-1',
        themePreference: 'light',
        defaultJurisdictionId: 've-seniat',
        defaultIncoterm: 'FOB',
        preferredCurrency: 'USD',
        detailLevel: 'standard',
        approvalWorkflowMode: 'always_review',
        autoOpenCanvas: true,
        updatedAt: '2026-11-28T10:00:00Z',
      },
    });
    mocks.loadThreads.mockResolvedValue([activeThread]);
    mocks.loadSkuPrecedents.mockResolvedValue([]);
    mocks.loadUserProfile.mockResolvedValue(null);

    function GuardHarness() {
      const ws = useWorkspaceState();
      return (
        <div>
          <span data-testid="toast">{ws.toast?.title ?? ''}</span>
          <button type="button" onClick={() => ws.setActiveThreadId('thr-1')}>select</button>
          <button type="button" onClick={() => ws.approveActiveDossier('ANALYST')}>seal</button>
          <button type="button" onClick={() => ws.assignThreadReviewer('thr-1', 'u-rev', 'Revisar', 'Carlos')}>assign</button>
        </div>
      );
    }

    render(<GuardHarness />);
    await waitFor(() => expect(mocks.loadThreads).toHaveBeenCalled());
    act(() => screen.getByRole('button', { name: 'select' }).click());
    act(() => screen.getByRole('button', { name: 'seal' }).click());
    expect(screen.getByTestId('toast').textContent).toMatch(/Solo un revisor o dueño/i);

    act(() => screen.getByRole('button', { name: 'assign' }).click());
    expect(mocks.patchThreadMeta).toHaveBeenCalledWith(
      'thr-1',
      expect.objectContaining({ assignedToUserId: 'u-rev', note: 'Revisar' }),
    );
  });
});
