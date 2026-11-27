import { z } from 'zod';
import { resolveCloudTenantContext } from '@/lib/agent/cloud-session';
import {
  ALLOWED_RECEIPT_MIME_TYPES,
  MAX_RECEIPT_SIZE_BYTES,
  PAYMENT_RECEIPTS_BUCKET,
} from '@/lib/funnel/receipt-upload';
import { isCloudModeEnabled } from '@/lib/runtime-config';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

const ReceiptUploadRequestSchema = z.object({
  fileName: z.string().trim().min(1).max(180),
  contentType: z.enum(ALLOWED_RECEIPT_MIME_TYPES),
  sizeBytes: z.number().int().positive().max(MAX_RECEIPT_SIZE_BYTES),
});

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120) || 'comprobante.bin';
}

export async function POST(request: Request): Promise<Response> {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const parsed = ReceiptUploadRequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return Response.json(
      { error: 'Comprobante inválido. Usa PNG, JPG, WEBP o PDF (máx. 5 MB).', issues: parsed.error.issues },
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

  const storageKey = `${auth.context.tenantId}/${Date.now()}-${sanitizeFileName(parsed.data.fileName)}`;
  const supabase = createSupabaseAdminClient();
  let { data, error } = await supabase.storage
    .from(PAYMENT_RECEIPTS_BUCKET)
    .createSignedUploadUrl(storageKey);

  if (error && /bucket/i.test(error.message)) {
    await supabase.storage
      .createBucket(PAYMENT_RECEIPTS_BUCKET, {
        public: false,
        fileSizeLimit: MAX_RECEIPT_SIZE_BYTES,
      })
      .catch(() => undefined);
    ({ data, error } = await supabase.storage
      .from(PAYMENT_RECEIPTS_BUCKET)
      .createSignedUploadUrl(storageKey));
  }

  if (error || !data?.signedUrl) {
    return Response.json(
      { error: error?.message ?? 'No se pudo generar URL de subida para el comprobante.' },
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
