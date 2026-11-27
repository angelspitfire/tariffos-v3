import { A2UIEnvelopeSchema, type A2UIEnvelope } from '@tariffos/shared-types';
import type { ClientSubscriptionToken } from 'inngest/react';
import { SIGNED_UPLOAD_THRESHOLD_BYTES } from '@/lib/inngest/batch-storage-constants';

export interface SubmitBatchFileResult {
  filingId: string;
  queued: boolean;
  totalItems: number;
  fileName: string;
  envelope: A2UIEnvelope | null;
}

export interface BatchResultPollResponse {
  filingId: string;
  status: string;
  totalLines: number;
  envelope: A2UIEnvelope | null;
}

async function readErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const body = (await res.json()) as { error?: string; message?: string };
    return body.error ?? body.message ?? fallback;
  } catch {
    return fallback;
  }
}

async function trySignedBatchUpload(file: File): Promise<{ storageKey: string } | null> {
  const contentType = file.type || 'application/octet-stream';
  const urlRes = await fetch('/api/batch/upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileName: file.name, contentType, sizeBytes: file.size }),
  });
  if (!urlRes.ok) {
    throw new Error(await readErrorMessage(urlRes, `Error al preparar subida (HTTP ${urlRes.status}).`));
  }

  const urlJson = (await urlRes.json()) as {
    mode?: string;
    directInline?: boolean;
    storageKey?: string;
    signedUrl?: string;
  };
  if (urlJson.directInline || urlJson.mode === 'offline' || !urlJson.signedUrl || !urlJson.storageKey) {
    return null;
  }

  const putRes = await fetch(urlJson.signedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: file,
  });
  if (!putRes.ok) {
    throw new Error(`No se pudo subir el archivo a Storage (HTTP ${putRes.status}).`);
  }

  return { storageKey: urlJson.storageKey };
}

/** Uploads a commercial invoice (.xlsx, .csv, .txt, .pdf, image) to `POST /api/batch` (via Signed URL above 3.5 MB). */
export async function submitBatchFile(params: {
  file: File;
  countryCode: string;
  deepMode?: boolean;
}): Promise<SubmitBatchFileResult> {
  let res: Response;
  const signed = params.file.size > SIGNED_UPLOAD_THRESHOLD_BYTES
    ? await trySignedBatchUpload(params.file)
    : null;

  if (signed) {
    res = await fetch('/api/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        storageKey: signed.storageKey,
        fileName: params.file.name,
        countryCode: params.countryCode,
        deepMode: Boolean(params.deepMode),
      }),
    });
  } else {
    const form = new FormData();
    form.append('file', params.file);
    form.append('countryCode', params.countryCode);
    if (params.deepMode) form.append('deepMode', 'true');
    res = await fetch('/api/batch', { method: 'POST', body: form });
  }

  if (!res.ok) {
    throw new Error(await readErrorMessage(res, `Error al procesar lote (HTTP ${res.status}).`));
  }

  const json = (await res.json()) as {
    filingId: string;
    queued: boolean;
    totalItems: number;
    fileName?: string;
    envelope?: unknown;
  };
  const parsedEnvelope = json.envelope ? A2UIEnvelopeSchema.safeParse(json.envelope) : null;

  return {
    filingId: json.filingId,
    queued: Boolean(json.queued),
    totalItems: json.totalItems ?? 0,
    fileName: json.fileName ?? params.file.name,
    envelope: parsedEnvelope?.success ? parsedEnvelope.data : null,
  };
}

/** Fetches classified manifest status and A2UIEnvelope once Inngest completes the batch. */
export async function fetchBatchResult(filingId: string): Promise<BatchResultPollResponse> {
  const res = await fetch(`/api/batch/${encodeURIComponent(filingId)}`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res, `Error cargando lote (${res.status}).`));
  }

  const json = (await res.json()) as {
    filingId: string;
    status: string;
    totalLines: number;
    envelope?: unknown;
  };
  const parsedEnvelope = json.envelope ? A2UIEnvelopeSchema.safeParse(json.envelope) : null;

  return {
    filingId: json.filingId,
    status: json.status,
    totalLines: json.totalLines ?? 0,
    envelope: parsedEnvelope?.success ? parsedEnvelope.data : null,
  };
}

/** Mints a short-lived Inngest v4 Realtime client subscription token for a filing. */
export async function fetchBatchRealtimeToken(
  filingId: string,
): Promise<ClientSubscriptionToken> {
  const res = await fetch(`/api/batch/${encodeURIComponent(filingId)}/token`, {
    method: 'POST',
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res, `Error de token realtime (${res.status}).`));
  }
  const json = (await res.json()) as { token: ClientSubscriptionToken };
  return json.token;
}
