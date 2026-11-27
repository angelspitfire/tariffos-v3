// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { A2UIEnvelope, UserProfileSettings } from '@tariffos/shared-types';
import type { ThreadMessageLike } from '@assistant-ui/react';
import { buildWorkspaceInlineActions } from '@/lib/workspace/inline-actions';
import { DEFAULT_USER_PROFILE } from '@/lib/workspace/types';

const SAMPLE_ENVELOPE: A2UIEnvelope = {
  assistantMessage: 'Clasificación sugerida 8471.30.00.90',
  classificationStatus: 'classified',
  inlineComponents: [
    {
      type: 'verdict',
      id: 'verdict-eve-1',
      hsCode: '8471.30.00.90',
      description: 'Computadora portátil de 14 pulgadas',
      adValoremPercent: 0,
      vatPercent: 16,
      customsFeePercent: 1,
      legalRegimeCode: 'Libre',
      legalRegimeSummary: 'Sin restricciones OGA',
      confidenceLabel: 'Alto',
      rgiApplied: ['RGI 1', 'RGI 6'],
    },
  ],
  canvasComponents: [
    {
      type: 'dossier',
      id: 'dossier-eve-1',
      title: 'Dictamen Técnico',
      hsCode: '8471.30.00.90',
      officialDescription: 'Computadoras portátiles',
      jurisdictionName: 'Venezuela (SENIAT — Decreto 4.944)',
      rgiSteps: [],
      legalNotes: [],
      technicalSpecs: [],
      permits: [],
      reviewStatus: 'draft_ai',
    },
  ],
};

const MOCK_MESSAGES: ThreadMessageLike[] = [
  {
    id: 'u-1',
    role: 'user',
    createdAt: new Date('2026-11-26T12:00:00.000Z'),
    content: [{ type: 'text', text: 'Clasifica MacBook Pro 14 M3' }],
  },
  {
    id: 'a-1',
    role: 'assistant',
    createdAt: new Date('2026-11-26T12:00:05.000Z'),
    content: [
      {
        type: 'tool-call',
        toolCallId: 'tc-web',
        toolName: 'web_search',
        args: { query: 'MacBook Pro 14 M3 specs' },
        result: {
          query: 'MacBook Pro 14 M3 specs',
          provider: 'vercel-parallel-fast',
          results: [],
          summary: null,
        },
      },
      {
        type: 'tool-call',
        toolCallId: 'tc-cls',
        toolName: 'classify_item',
        args: { description: 'MacBook Pro 14 M3' },
        result: { line: {}, envelope: SAMPLE_ENVELOPE },
      },
      { type: 'text', text: 'Se clasifica en **8471.30.00.90**.' },
    ],
  },
];

const capturedRuntimeOptions = vi.hoisted(() => ({
  lastOptions: null as Record<string, unknown> | null,
  messages: null as ThreadMessageLike[] | null,
  isRunning: false,
  onNew: vi.fn(async () => undefined),
}));

vi.mock('@assistant-ui/eve', async () => {
  const react = await import('@assistant-ui/react');
  return {
    useEveAgentRuntime: (options?: Record<string, unknown>) => {
      capturedRuntimeOptions.lastOptions = options ?? null;
      return react.useExternalStoreRuntime({
        isRunning: capturedRuntimeOptions.isRunning,
        messages: capturedRuntimeOptions.messages ?? MOCK_MESSAGES,
        convertMessage: (m: ThreadMessageLike) => m,
        onNew: capturedRuntimeOptions.onNew,
      });
    },
  };
});

import { EveThreadSurface } from './EveThreadSurface';

describe('EveThreadSurface', () => {
  const profile: UserProfileSettings = DEFAULT_USER_PROFILE;
  const inlineActions = buildWorkspaceInlineActions({
    onSelectCanvasMessage: vi.fn(),
    onExportPdf: vi.fn(),
    onSaveSku: vi.fn(),
    onClassify: vi.fn(),
  });

  beforeEach(() => {
    vi.clearAllMocks();
    capturedRuntimeOptions.lastOptions = null;
    capturedRuntimeOptions.messages = null;
    capturedRuntimeOptions.isRunning = false;
  });

  it('renders ToolActivityList, VerdictCard from classify_item, and syncs discovered messages & envelopes', async () => {
    const onEnvelopeDiscovered = vi.fn();
    const onSyncMessages = vi.fn();
    const onRegisterSend = vi.fn();

    render(
      <EveThreadSurface
        jurisdictionId="ve-seniat"
        approvalWorkflowMode="agent_decides"
        defaultIncoterm="FOB"
        deepMode={false}
        skuPrecedents={[]}
        pendingAttachments={[]}
        profile={profile}
        inlineActions={inlineActions}
        onAddFiles={vi.fn()}
        onRemoveAttachment={vi.fn()}
        onConsumeAttachments={() => []}
        onRunSample={vi.fn()}
        onRunBatchSample={vi.fn()}
        onUpdateProfile={vi.fn()}
        onSyncMessages={onSyncMessages}
        onEnvelopeDiscovered={onEnvelopeDiscovered}
        onRegisterSend={onRegisterSend}
        onErrorToast={vi.fn()}
      />,
    );

    expect(screen.getByText('Clasifica MacBook Pro 14 M3')).toBeTruthy();
    expect(screen.getByText(/Completado · 2 pasos/i)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Completado · 2 pasos/i }));
    expect(screen.getByText(/Parallel Fast/i)).toBeTruthy();
    expect(screen.getByText(/Clasificación completada/i)).toBeTruthy();
    expect(screen.getAllByText('8471.30.00.90').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Computadora portátil de 14 pulgadas')).toBeTruthy();

    await waitFor(() => {
      expect(onEnvelopeDiscovered).toHaveBeenCalledTimes(1);
      expect(onSyncMessages).toHaveBeenCalledTimes(1);
    });
    expect(onEnvelopeDiscovered.mock.calls[0]?.[0]?.envelope?.inlineComponents[0]?.type).toBe('verdict');
    expect(onSyncMessages.mock.calls[0]?.[0]).toHaveLength(2);
    expect(onSyncMessages.mock.calls[0]?.[1]).toBe('a-1');
    expect(onRegisterSend).toHaveBeenCalledWith(expect.any(Function));
  });

  it('reconnects durable eveSessionId with resume: true and prevents duplicating persisted chat turns', () => {
    const onSessionIdDiscovered = vi.fn();

    render(
      <EveThreadSurface
        eveSessionId="wrun_session_abc"
        jurisdictionId="ve-seniat"
        approvalWorkflowMode="agent_decides"
        defaultIncoterm="FOB"
        deepMode={false}
        persistedMessages={[
          {
            id: 'stale-local-user-id',
            role: 'user',
            text: 'Turno viejo duplicado por ID distinto',
            createdAt: '2026-11-26T12:00:00.000Z',
            jurisdictionId: 've-seniat',
          },
          {
            id: 'msg-batch-42',
            role: 'assistant',
            text: 'Lote BL_SOLAR procesado (4 ítems).',
            createdAt: '2026-11-26T12:05:00.000Z',
            jurisdictionId: 've-seniat',
          },
        ]}
        skuPrecedents={[]}
        pendingAttachments={[]}
        profile={profile}
        inlineActions={inlineActions}
        onAddFiles={vi.fn()}
        onRemoveAttachment={vi.fn()}
        onConsumeAttachments={() => []}
        onRunSample={vi.fn()}
        onRunBatchSample={vi.fn()}
        onUpdateProfile={vi.fn()}
        onSessionIdDiscovered={onSessionIdDiscovered}
        onRegisterSend={vi.fn()}
        onErrorToast={vi.fn()}
      />,
    );

    expect(capturedRuntimeOptions.lastOptions?.initialSession).toEqual({
      sessionId: 'wrun_session_abc',
      streamIndex: 0,
    });
    expect(capturedRuntimeOptions.lastOptions?.resume).toBe(true);

    // Persisted chat turns are NOT duplicated once live Eve messages arrive,
    // while external Inngest batch messages remain visible.
    expect(screen.queryByText('Turno viejo duplicado por ID distinto')).toBeNull();
    expect(screen.getByText('Lote BL_SOLAR procesado (4 ítems).')).toBeTruthy();

    // onSessionChange notifies parent when Eve assigns a new durable session ID.
    const onSessionChange = capturedRuntimeOptions.lastOptions?.onSessionChange as
      | ((session: { sessionId: string; streamIndex: number } | undefined) => void)
      | undefined;
    onSessionChange?.({ sessionId: 'wrun_session_abc', streamIndex: 4 });
    expect(onSessionIdDiscovered).not.toHaveBeenCalled();

    onSessionChange?.({ sessionId: 'wrun_session_new', streamIndex: 0 });
    expect(onSessionIdDiscovered).toHaveBeenCalledTimes(1);
    expect(onSessionIdDiscovered).toHaveBeenCalledWith('wrun_session_new');
  });

  it('renders persisted external batch messages alongside live Eve messages without duplicating live IDs', () => {
    render(
      <EveThreadSurface
        jurisdictionId="ve-seniat"
        approvalWorkflowMode="agent_decides"
        defaultIncoterm="FOB"
        deepMode={false}
        persistedMessages={[
          {
            id: 'a-1',
            role: 'assistant',
            text: 'Duplicado live',
            createdAt: '2026-11-26T12:00:05.000Z',
            jurisdictionId: 've-seniat',
          },
          {
            id: 'batch-done-1',
            role: 'assistant',
            text: 'Lote BL_SOLAR procesado (4 ítems).',
            createdAt: '2026-11-26T12:05:00.000Z',
            jurisdictionId: 've-seniat',
          },
        ]}
        skuPrecedents={[]}
        pendingAttachments={[]}
        profile={profile}
        inlineActions={inlineActions}
        onAddFiles={vi.fn()}
        onRemoveAttachment={vi.fn()}
        onConsumeAttachments={() => []}
        onRunSample={vi.fn()}
        onRunBatchSample={vi.fn()}
        onUpdateProfile={vi.fn()}
        onEnvelopeDiscovered={vi.fn()}
        onRegisterSend={vi.fn()}
        onErrorToast={vi.fn()}
      />,
    );

    expect(screen.getByText('Lote BL_SOLAR procesado (4 ítems).')).toBeTruthy();
    expect(screen.queryByText('Duplicado live')).toBeNull();
  });

  it('formats unreachable Eve 500/network errors with actionable dev startup guidance while preserving domain errors', () => {
    const onErrorToast = vi.fn();

    render(
      <EveThreadSurface
        jurisdictionId="ve-seniat"
        approvalWorkflowMode="agent_decides"
        defaultIncoterm="FOB"
        deepMode={false}
        skuPrecedents={[]}
        pendingAttachments={[]}
        profile={profile}
        inlineActions={inlineActions}
        onAddFiles={vi.fn()}
        onRemoveAttachment={vi.fn()}
        onConsumeAttachments={() => []}
        onRunSample={vi.fn()}
        onRunBatchSample={vi.fn()}
        onUpdateProfile={vi.fn()}
        onRegisterSend={vi.fn()}
        onErrorToast={onErrorToast}
      />,
    );

    const onError = capturedRuntimeOptions.lastOptions?.onError as
      | ((err: Error) => void)
      | undefined;
    expect(onError).toBeTypeOf('function');

    onError?.(new Error('Internal Server Error'));
    onError?.(new Error('Failed to fetch'));
    onError?.(new Error('Cuota mensual alcanzada'));

    expect(onErrorToast).toHaveBeenNthCalledWith(
      1,
      expect.stringMatching(/pnpm dev|pnpm dev:eve/),
    );
    expect(onErrorToast).toHaveBeenNthCalledWith(
      2,
      expect.stringMatching(/pnpm dev|pnpm dev:eve/),
    );
    expect(onErrorToast).toHaveBeenNthCalledWith(3, 'Cuota mensual alcanzada');
  });

  it('triggers onNew when empty-state quick suggestions are clicked, stabilizes send registration across rerenders, and prefills prompt on Clasificar producto', async () => {
    capturedRuntimeOptions.messages = [];
    let latestRegisteredSend: ((text: string) => void) | null = null;
    const onRegisterSend = vi.fn((fn: ((text: string) => void) | null) => {
      latestRegisteredSend = fn;
    });

    const commonProps = {
      jurisdictionId: 've-seniat',
      approvalWorkflowMode: 'agent_decides' as const,
      defaultIncoterm: 'FOB' as const,
      deepMode: false,
      skuPrecedents: [],
      pendingAttachments: [],
      profile,
      inlineActions,
      onAddFiles: vi.fn(),
      onRemoveAttachment: vi.fn(),
      onConsumeAttachments: () => [],
      onRunSample: (sample: { description: string }) => {
        latestRegisteredSend?.(sample.description);
      },
      onRunBatchSample: vi.fn(),
      onUpdateProfile: vi.fn(),
      onErrorToast: vi.fn(),
    };

    const { rerender } = render(<EveThreadSurface {...commonProps} onRegisterSend={onRegisterSend} />);

    // Re-rendering with a new inline callback must NOT tear down the send ref to null.
    const secondRegister = vi.fn((fn: ((text: string) => void) | null) => {
      latestRegisteredSend = fn;
    });
    rerender(<EveThreadSurface {...commonProps} onRegisterSend={secondRegister} />);
    expect(onRegisterSend).not.toHaveBeenCalledWith(null);
    expect(latestRegisteredSend).toBeTypeOf('function');

    fireEvent.click(screen.getByRole('button', { name: /Tasa oficial BCV/i }));
    await waitFor(() => {
      expect(capturedRuntimeOptions.onNew).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'user',
          content: [{ type: 'text', text: '¿Cuál es la tasa oficial del BCV hoy?' }],
        }),
      );
    });

    fireEvent.click(screen.getByRole('button', { name: /Ecógrafo portátil Doppler/i }));
    await waitFor(() => {
      expect(capturedRuntimeOptions.onNew).toHaveBeenCalledTimes(2);
    });

    fireEvent.click(screen.getByRole('button', { name: /Clasificar producto/i }));
    const textarea = screen.getByLabelText(
      /Consulta arancelaria o descripción de mercancía/i,
    ) as HTMLTextAreaElement;
    expect(document.activeElement).toBe(textarea);
    expect(textarea.value).toBe('');
  });

  it('syncs once when canvas arrives mid-stream, ignores streaming text deltas, and persists final settled text once', async () => {
    const syncSpy = vi.fn();
    capturedRuntimeOptions.isRunning = true;

    const buildMsgs = (text: string): ThreadMessageLike[] => [
      MOCK_MESSAGES[0],
      {
        id: 'a-stream-1',
        role: 'assistant',
        createdAt: new Date('2026-11-26T12:00:05.000Z'),
        content: [
          {
            type: 'tool-call',
            toolCallId: 'tc-cls',
            toolName: 'classify_item',
            args: { description: 'Ecógrafo' },
            result: { line: {}, envelope: SAMPLE_ENVELOPE },
          },
          { type: 'text', text },
        ],
      },
    ];

    capturedRuntimeOptions.messages = buildMsgs('Parcial 1');

    const baseProps = {
      jurisdictionId: 've-seniat',
      approvalWorkflowMode: 'agent_decides' as const,
      defaultIncoterm: 'FOB' as const,
      deepMode: false,
      skuPrecedents: [],
      pendingAttachments: [],
      profile,
      inlineActions,
      onAddFiles: vi.fn(),
      onRemoveAttachment: vi.fn(),
      onConsumeAttachments: () => [],
      onRunSample: vi.fn(),
      onRunBatchSample: vi.fn(),
      onUpdateProfile: vi.fn(),
      onRegisterSend: vi.fn(),
      onErrorToast: vi.fn(),
    };

    const { rerender } = render(
      <EveThreadSurface {...baseProps} onSyncMessages={(m, id) => syncSpy(m, id)} />,
    );

    await waitFor(() => {
      expect(syncSpy).toHaveBeenCalledTimes(1);
    });
    expect(syncSpy.mock.calls[0]?.[1]).toBeNull();

    // Streaming text token deltas with fresh inline callback must NOT re-trigger persistence
    capturedRuntimeOptions.messages = buildMsgs('Parcial 1 + más texto');
    rerender(<EveThreadSurface {...baseProps} onSyncMessages={(m, id) => syncSpy(m, id)} />);
    expect(syncSpy).toHaveBeenCalledTimes(1);

    // Once stream finishes (isRunning -> false), persist final settled text and open Canvas once
    capturedRuntimeOptions.isRunning = false;
    capturedRuntimeOptions.messages = buildMsgs('Dictamen final completo.');
    rerender(<EveThreadSurface {...baseProps} onSyncMessages={(m, id) => syncSpy(m, id)} />);

    await waitFor(() => {
      expect(syncSpy).toHaveBeenCalledTimes(2);
    });
    expect(syncSpy.mock.calls[1]?.[0]?.[1]?.text).toBe('Dictamen final completo.');
    expect(syncSpy.mock.calls[1]?.[1]).toBe('a-stream-1');

    // Re-rendering with a new inline callback and identical settled messages must NOT fire again
    rerender(<EveThreadSurface {...baseProps} onSyncMessages={(m, id) => syncSpy(m, id)} />);
    expect(syncSpy).toHaveBeenCalledTimes(2);
  });
});
