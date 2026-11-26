// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
import { render, screen, waitFor } from '@testing-library/react';
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
        result: { query: 'MacBook Pro 14 M3 specs', provider: 'vercel-parallel-fast', results: [], summary: null },
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

vi.mock('@assistant-ui/eve', async () => {
  const react = await import('@assistant-ui/react');
  return {
    useEveAgentRuntime: () =>
      react.useExternalStoreRuntime({
        isRunning: false,
        messages: MOCK_MESSAGES,
        convertMessage: (m: ThreadMessageLike) => m,
        onNew: async () => undefined,
      }),
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
  });

  it('renders Eve tool pills, VerdictCard from classify_item tool result, and syncs discovered envelope', async () => {
    const onEnvelopeDiscovered = vi.fn();
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
        onEnvelopeDiscovered={onEnvelopeDiscovered}
        onRegisterSend={onRegisterSend}
        onErrorToast={vi.fn()}
      />,
    );

    expect(screen.getByText('Clasifica MacBook Pro 14 M3')).toBeTruthy();
    expect(screen.getByText(/Parallel Fast/i)).toBeTruthy();
    expect(screen.getByText(/Clasificación completada/i)).toBeTruthy();
    expect(screen.getAllByText('8471.30.00.90').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Computadora portátil de 14 pulgadas')).toBeTruthy();

    await waitFor(() => {
      expect(onEnvelopeDiscovered).toHaveBeenCalledTimes(1);
    });
    expect(onEnvelopeDiscovered.mock.calls[0]?.[0]?.envelope?.inlineComponents[0]?.type).toBe('verdict');
    expect(onRegisterSend).toHaveBeenCalledWith(expect.any(Function));
  });
});
