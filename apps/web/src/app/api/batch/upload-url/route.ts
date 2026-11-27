import { resolveCloudTenantContext } from '@/lib/agent/cloud-session';
import {
  BatchUploadUrlRequestSchema,
  createBatchSignedUploadUrl,
} from '@/lib/inngest/batch-storage';
import { isCloudModeEnabled } from '@/lib/runtime-config';

export async function POST(request: Request): Promise<Response> {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const parsed = BatchUploadUrlRequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return Response.json(
      { error: 'Archivo inválido o supera el límite de 25 MB.', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  if (!isCloudModeEnabled()) {
    return Response.json({ mode: 'offline', directInline: true }, { status: 200 });
  }

  const auth = await resolveCloudTenantContext();
  if (!auth.ok) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { storageKey, signedUrl } = await createBatchSignedUploadUrl(
      auth.context.tenantId,
      parsed.data.fileName,
    );
    return Response.json(
      {
        mode: 'cloud',
        directInline: false,
        storageKey,
        signedUrl,
      },
      { status: 200 },
    );
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'No se pudo generar URL de subida.' },
      { status: 500 },
    );
  }
}
