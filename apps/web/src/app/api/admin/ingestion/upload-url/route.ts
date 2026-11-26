import { SignedUploadRequestSchema } from '@tariffos/shared-types';
import { parseJsonBody, requireAdmin } from '@/lib/admin/http-helpers';
import { LEGAL_DOCUMENTS_BUCKET } from '@/lib/inngest/legal-ingestion-helpers';
import { isCloudModeEnabled } from '@/lib/runtime-config';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 140) || 'document.bin';
}

export async function POST(request: Request): Promise<Response> {
  const guard = await requireAdmin('ingestion:manage');
  if (!guard.ok) return guard.response;

  const rawBody = await parseJsonBody(request);
  if (rawBody === null) {
    return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const parsed = SignedUploadRequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return Response.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  if (!isCloudModeEnabled()) {
    return Response.json({ mode: 'offline', directInline: true }, { status: 200 });
  }

  const safeName = sanitizeFileName(parsed.data.fileName);
  const storageKey = `${parsed.data.countryCode}/${Date.now()}-${safeName}`;
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage
    .from(LEGAL_DOCUMENTS_BUCKET)
    .createSignedUploadUrl(storageKey);

  if (error || !data?.signedUrl) {
    return Response.json(
      { error: error?.message ?? 'No se pudo generar URL de subida firmada' },
      { status: 500 },
    );
  }

  return Response.json(
    {
      mode: 'cloud',
      directInline: false,
      storageKey,
      signedUrl: data.signedUrl,
    },
    { status: 200 },
  );
}
