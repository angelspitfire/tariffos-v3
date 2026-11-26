import {
  A2UIEnvelopeSchema,
  StreamProgressEventSchema,
  type A2UIEnvelope,
  type JurisdictionConfig,
  type StreamProgressEvent,
} from '@tariffos/shared-types';
import { isCloudModeEnabled } from '@/lib/runtime-config';
import { classifyOffline } from './offline-classifier';

export interface ClassifyStreamRequest {
  query: string;
  jurisdiction: JurisdictionConfig;
  attachmentsText?: string;
  isBatchHint?: boolean;
  onProgress?: (event: StreamProgressEvent) => void;
  signal?: AbortSignal;
}

const SIMULATED_STAGES: readonly StreamProgressEvent[] = [
  { stage: 'pre_gate', label: 'Validando descripción merceológica...', progressPct: 18 },
  { stage: 'sku_lookup', label: 'Consultando catálogo de precedentes SKU...', progressPct: 36 },
  { stage: 'hybrid_retrieval', label: 'Recuperando partidas y notas legales...', progressPct: 58 },
  { stage: 'rgi_reasoning', label: 'Aplicando reglas RGI 1 → 6...', progressPct: 82 },
  { stage: 'verifying_tariff', label: 'Verificando arancel oficial vigente...', progressPct: 95 },
];

async function runOfflineWithStages(
  input: ClassifyStreamRequest
): Promise<A2UIEnvelope> {
  for (const step of SIMULATED_STAGES) {
    if (input.signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }
    input.onProgress?.(step);
    await new Promise((resolve) => setTimeout(resolve, 65));
  }
  const envelope = classifyOffline({
    query: input.attachmentsText ? `${input.query}\n${input.attachmentsText}` : input.query,
    jurisdiction: input.jurisdiction,
    isBatchHint: input.isBatchHint,
  });
  input.onProgress?.({ stage: 'complete', label: 'Clasificación completada', progressPct: 100 });
  return envelope;
}

function parseSseBlock(block: string): { event: string; data: string } | null {
  const lines = block.split('\n');
  let eventName = 'message';
  const dataLines: string[] = [];
  for (const line of lines) {
    if (line.startsWith('event:')) {
      eventName = line.slice(6).trim();
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trim());
    }
  }
  if (dataLines.length === 0) return null;
  return { event: eventName, data: dataLines.join('\n') };
}

export async function classifyStream(
  input: ClassifyStreamRequest
): Promise<A2UIEnvelope> {
  if (!isCloudModeEnabled() || typeof fetch === 'undefined') {
    return runOfflineWithStages(input);
  }

  try {
    const response = await fetch('/api/classify-stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: input.signal,
      body: JSON.stringify({
        query: input.query,
        jurisdictionId: input.jurisdiction.id,
        attachmentsText: input.attachmentsText,
        isBatchHint: input.isBatchHint,
      }),
    });

    if (!response.ok || !response.body) {
      return runOfflineWithStages(input);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let finalEnvelope: A2UIEnvelope | null = null;

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const blocks = buffer.split('\n\n');
      buffer = blocks.pop() ?? '';

      for (const rawBlock of blocks) {
        const parsed = parseSseBlock(rawBlock);
        if (!parsed) continue;
        let json: unknown;
        try {
          json = JSON.parse(parsed.data);
        } catch {
          continue;
        }
        const progress = StreamProgressEventSchema.safeParse(json);
        if (progress.success && parsed.event !== 'result') {
          input.onProgress?.(progress.data);
          continue;
        }
        const candidateEnvelope =
          typeof json === 'object' && json !== null && 'envelope' in json
            ? (json as { envelope: unknown }).envelope
            : json;
        const envelopeRes = A2UIEnvelopeSchema.safeParse(candidateEnvelope);
        if (envelopeRes.success) {
          finalEnvelope = envelopeRes.data;
        }
      }
    }

    if (finalEnvelope) {
      input.onProgress?.({ stage: 'complete', label: 'Clasificación completada', progressPct: 100 });
      return finalEnvelope;
    }
    return runOfflineWithStages(input);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }
    return runOfflineWithStages(input);
  }
}
