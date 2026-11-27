import { requireAdmin } from '@/lib/admin/http-helpers';
import { PAYMENT_RECEIPTS_BUCKET } from '@/lib/funnel/receipt-upload';
import { isCloudModeEnabled } from '@/lib/runtime-config';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

const SIGNED_READ_TTL_SECONDS = 3600;

export async function GET(request: Request): Promise<Response> {
  const guard = await requireAdmin('billing:read');
  if (!guard.ok) return guard.response;

  const key = new URL(request.url).searchParams.get('key')?.trim();
  if (!key || !key.includes('/') || key.includes('..')) {
    return Response.json({ error: 'Clave de comprobante inválida.' }, { status: 400 });
  }

  if (!isCloudModeEnabled()) {
    return Response.json({ error: 'Solo disponible en modo Cloud.' }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage
    .from(PAYMENT_RECEIPTS_BUCKET)
    .createSignedUrl(key, SIGNED_READ_TTL_SECONDS);

  if (error || !data?.signedUrl) {
    return Response.json(
      { error: error?.message ?? 'No se pudo generar el enlace del comprobante.' },
      { status: 500 },
    );
  }

  return Response.json({ signedUrl: data.signedUrl }, { status: 200 });
}
