'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRealtime } from 'inngest/react';
import type { JurisdictionConfig } from '@tariffos/shared-types';
import { batchChannel, type BatchProgressEvent } from '@/lib/inngest/channels';
import { isCloudModeEnabled } from '@/lib/runtime-config';
import {
  fetchBatchRealtimeToken,
  fetchBatchResult,
  submitBatchFile,
} from './batch-client';
import type { WorkspaceMessage, WorkspaceToast } from './types';

export interface ActiveBatchJob {
  filingId: string;
  fileName: string;
  totalItems: number;
}

export interface BatchBannerState {
  fileName: string;
  totalItems: number;
  connectionStatus: ReturnType<typeof useRealtime>['connectionStatus'] | 'polling';
  progress: BatchProgressEvent | null;
}

/** Coordinates multipart invoice batch upload and Inngest v4 Realtime progress completion. */
export function useBatchJob(params: {
  jurisdiction: JurisdictionConfig;
  deepMode: boolean;
  onBatchCompleted: (message: WorkspaceMessage) => void;
  pushToast: (title: string, variant?: WorkspaceToast['variant']) => void;
}) {
  const [activeJob, setActiveJob] = useState<ActiveBatchJob | null>(null);
  const [submittingFileName, setSubmittingFileName] = useState<string | null>(null);
  const completedFilingRef = useRef<string | null>(null);

  const cloudEnabled = isCloudModeEnabled();
  const realtime = useRealtime({
    channel: activeJob ? batchChannel(activeJob.filingId) : undefined,
    topics: ['progress'] as const,
    token: activeJob ? () => fetchBatchRealtimeToken(activeJob.filingId) : undefined,
    enabled: Boolean(activeJob && cloudEnabled),
    autoCloseOnTerminal: true,
  });

  const latestProgress: BatchProgressEvent | null = realtime.messages.byTopic.progress?.data ?? null;

  const finalizeCompletedBatch = useCallback(
    async (job: ActiveBatchJob) => {
      if (completedFilingRef.current === job.filingId) return;
      try {
        const res = await fetchBatchResult(job.filingId);
        if (res.status !== 'Completed' || !res.envelope) return;
        completedFilingRef.current = job.filingId;
        const now = new Date().toISOString();
        params.onBatchCompleted({
          id: `msg-batch-${job.filingId}`,
          role: 'assistant',
          text: res.envelope.assistantMessage,
          createdAt: now,
          jurisdictionId: params.jurisdiction.id,
          envelope: res.envelope,
        });
        params.pushToast(`Lote ${job.fileName} completado (${res.totalLines} ítems).`, 'success');
        setActiveJob(null);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'No se pudo cargar el expediente del lote.';
        params.pushToast(msg, 'warning');
        setActiveJob(null);
      }
    },
    [params],
  );

  useEffect(() => {
    if (!activeJob) return;
    if (latestProgress?.stage === 'completed' || realtime.runStatus === 'completed') {
      void finalizeCompletedBatch(activeJob);
      return;
    }
    if (latestProgress?.stage === 'failed' || realtime.runStatus === 'failed') {
      params.pushToast(
        latestProgress?.error ?? `Falló el procesamiento de ${activeJob.fileName}.`,
        'warning',
      );
      setActiveJob(null);
    }
  }, [activeJob, finalizeCompletedBatch, latestProgress, params, realtime.runStatus]);

  useEffect(() => {
    if (!activeJob || !cloudEnabled) return;
    if (realtime.connectionStatus !== 'error' && realtime.connectionStatus !== 'closed') return;
    const timer = window.setInterval(() => {
      void finalizeCompletedBatch(activeJob);
    }, 4_000);
    return () => window.clearInterval(timer);
  }, [activeJob, cloudEnabled, finalizeCompletedBatch, realtime.connectionStatus]);

  const startBatchUpload = useCallback(
    async (file: File) => {
      setSubmittingFileName(file.name);
      try {
        const res = await submitBatchFile({
          file,
          countryCode: params.jurisdiction.countryCode,
          deepMode: params.deepMode,
        });
        if (!res.queued && res.envelope) {
          params.onBatchCompleted({
            id: `msg-batch-${res.filingId}`,
            role: 'assistant',
            text: res.envelope.assistantMessage,
            createdAt: new Date().toISOString(),
            jurisdictionId: params.jurisdiction.id,
            envelope: res.envelope,
          });
          params.pushToast(`Lote ${res.fileName} procesado (${res.totalItems} ítems).`, 'success');
          return;
        }
        completedFilingRef.current = null;
        setActiveJob({
          filingId: res.filingId,
          fileName: res.fileName,
          totalItems: res.totalItems,
        });
        params.pushToast(`Lote ${res.fileName} encolado (${res.totalItems} ítems).`, 'info');
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error al subir el lote.';
        params.pushToast(msg, 'warning');
      } finally {
        setSubmittingFileName(null);
      }
    },
    [params],
  );

  const bannerState: BatchBannerState | null = activeJob
    ? {
        fileName: activeJob.fileName,
        totalItems: activeJob.totalItems,
        connectionStatus: realtime.connectionStatus,
        progress: latestProgress,
      }
    : submittingFileName
      ? {
          fileName: submittingFileName,
          totalItems: 0,
          connectionStatus: 'polling',
          progress: {
            filingId: 'inline',
            stage: 'classifying',
            label: 'Clasificando lote en modo local…',
            completedItems: 0,
            totalItems: 0,
            progressPct: 40,
            ts: Date.now(),
          },
        }
      : null;

  return {
    activeJob,
    isSubmitting: Boolean(submittingFileName),
    latestProgress,
    connectionStatus: realtime.connectionStatus,
    bannerState,
    startBatchUpload,
    dismissJob: () => {
      setActiveJob(null);
      setSubmittingFileName(null);
    },
  };
}
