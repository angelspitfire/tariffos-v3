// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { A2UIEnvelope } from '@tariffos/shared-types';
import { JURISDICTIONS } from './jurisdictions';

const mocks = vi.hoisted(() => ({
  useRealtime: vi.fn(),
  submitBatchFile: vi.fn(),
  fetchBatchResult: vi.fn(),
  fetchBatchRealtimeToken: vi.fn(),
  isCloudModeEnabled: vi.fn(),
}));

vi.mock('inngest/react', () => ({
  useRealtime: mocks.useRealtime,
}));

vi.mock('./batch-client', () => ({
  submitBatchFile: mocks.submitBatchFile,
  fetchBatchResult: mocks.fetchBatchResult,
  fetchBatchRealtimeToken: mocks.fetchBatchRealtimeToken,
}));

vi.mock('@/lib/runtime-config', () => ({
  isCloudModeEnabled: mocks.isCloudModeEnabled,
}));

import { useBatchJob } from './use-batch-job';

const VE_JURISDICTION = JURISDICTIONS[0]!;

const SAMPLE_ENVELOPE: A2UIEnvelope = {
  assistantMessage: 'Lote listo',
  classificationStatus: 'classified',
  inlineComponents: [],
  canvasComponents: [
    {
      type: 'dossier',
      id: 'dos-1',
      title: 'Dictamen',
      hsCode: '8504.40.90.00',
      officialDescription: 'Convertidores estáticos',
      jurisdictionName: 'Venezuela (SENIAT)',
      confidenceLevel: 'Alto',
      confidencePct: 92,
      confidenceReason: 'Match',
      rgiSteps: [],
      legalNotes: [],
      technicalSpecs: [],
      permits: [],
      rejectedAlternatives: [],
      reviewStatus: 'draft_ai',
    },
  ],
};

describe('useBatchJob', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    mocks.isCloudModeEnabled.mockReturnValue(true);
    mocks.useRealtime.mockReturnValue({
      connectionStatus: 'error',
      runStatus: 'running',
      messages: { byTopic: {} },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not reset the 4s polling interval when parent passes a fresh params object', async () => {
    mocks.submitBatchFile.mockResolvedValueOnce({
      filingId: 'fil-poll-1',
      queued: true,
      totalItems: 3,
      fileName: 'lote.xlsx',
      envelope: null,
    });
    mocks.fetchBatchResult.mockResolvedValue({
      filingId: 'fil-poll-1',
      status: 'In progress',
      totalLines: 0,
      envelope: null,
    });

    const onBatchCompleted = vi.fn();
    const pushToast = vi.fn();

    const { result, rerender } = renderHook(
      ({ tick }) =>
        useBatchJob({
          jurisdiction: VE_JURISDICTION,
          deepMode: false,
          approvalWorkflowMode: 'agent_decides',
          onBatchCompleted,
          pushToast: (msg, v) => pushToast(tick, msg, v),
        }),
      { initialProps: { tick: 1 } },
    );

    await act(async () => {
      await result.current.startBatchUpload(new File(['a'], 'lote.xlsx'));
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2_000);
    });
    rerender({ tick: 2 });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2_200);
    });

    expect(mocks.fetchBatchResult).toHaveBeenCalledTimes(1);
  });

  it('stops polling and notifies user when polled batch status becomes Failed', async () => {
    mocks.submitBatchFile.mockResolvedValueOnce({
      filingId: 'fil-fail-1',
      queued: true,
      totalItems: 2,
      fileName: 'rota.pdf',
      envelope: null,
    });
    mocks.fetchBatchResult.mockResolvedValueOnce({
      filingId: 'fil-fail-1',
      status: 'Failed',
      totalLines: 0,
      envelope: null,
    });

    const pushToast = vi.fn();
    const { result } = renderHook(() =>
      useBatchJob({
        jurisdiction: VE_JURISDICTION,
        deepMode: false,
        onBatchCompleted: vi.fn(),
        pushToast,
      }),
    );

    await act(async () => {
      await result.current.startBatchUpload(new File(['a'], 'rota.pdf'));
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(4_100);
    });

    expect(result.current.activeJob).toBeNull();
    expect(pushToast).toHaveBeenCalledWith(expect.stringMatching(/rota\.pdf/i), 'warning');
  });

  it('applies approvalWorkflowMode to completed batch envelopes', async () => {
    mocks.isCloudModeEnabled.mockReturnValue(false);
    mocks.submitBatchFile.mockResolvedValueOnce({
      filingId: 'fil-policy-1',
      queued: false,
      totalItems: 1,
      fileName: 'lote.csv',
      envelope: SAMPLE_ENVELOPE,
    });

    const onBatchCompleted = vi.fn();
    const { result } = renderHook(() =>
      useBatchJob({
        jurisdiction: VE_JURISDICTION,
        deepMode: false,
        approvalWorkflowMode: 'always_review',
        onBatchCompleted,
        pushToast: vi.fn(),
      }),
    );

    await act(async () => {
      await result.current.startBatchUpload(new File(['a'], 'lote.csv'));
    });

    const emittedMsg = onBatchCompleted.mock.calls[0]?.[0] as { envelope: A2UIEnvelope };
    const dossier = emittedMsg.envelope.canvasComponents[0];
    expect(dossier?.type).toBe('dossier');
    if (dossier?.type === 'dossier') {
      expect(dossier.reviewStatus).toBe('in_review');
    }
  });
});
