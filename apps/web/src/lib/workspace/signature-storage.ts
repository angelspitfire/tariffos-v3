import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const BROKER_SIGNATURES_BUCKET = 'broker-signatures';
export const MAX_SIGNATURE_BYTES = 512 * 1024;

const EXT_BY_MIME: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
};

const MIME_BY_EXT: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  svg: 'image/svg+xml',
};

export interface ParsedSignatureImage {
  mimeType: string;
  ext: string;
  bytes: Buffer;
}

export function parseSignatureDataUrl(dataUrl: string): ParsedSignatureImage | null {
  const match = dataUrl
    .trim()
    .match(/^data:(image\/(?:png|jpeg|webp|svg\+xml));(base64|utf8),([\s\S]*)$/i);
  if (!match) return null;

  const mimeType = match[1]!.toLowerCase();
  const encoding = match[2]!.toLowerCase();
  const rawPayload = match[3] ?? '';
  const ext = EXT_BY_MIME[mimeType];
  if (!ext || !rawPayload) return null;

  let bytes: Buffer;
  try {
    bytes =
      encoding === 'base64'
        ? Buffer.from(rawPayload, 'base64')
        : Buffer.from(decodeURIComponent(rawPayload), 'utf8');
  } catch {
    return null;
  }

  if (bytes.byteLength === 0 || bytes.byteLength > MAX_SIGNATURE_BYTES) {
    return null;
  }

  return { mimeType, ext, bytes };
}

export async function uploadBrokerSignature(userId: string, dataUrl: string): Promise<string | null> {
  const parsed = parseSignatureDataUrl(dataUrl);
  if (!parsed) return null;

  const storageKey = `${userId}/signature.${parsed.ext}`;
  const supabase = createSupabaseAdminClient();

  let { error } = await supabase.storage
    .from(BROKER_SIGNATURES_BUCKET)
    .upload(storageKey, parsed.bytes, { contentType: parsed.mimeType, upsert: true });

  if (error && /bucket/i.test(error.message)) {
    await supabase.storage
      .createBucket(BROKER_SIGNATURES_BUCKET, {
        public: false,
        fileSizeLimit: MAX_SIGNATURE_BYTES,
      })
      .catch(() => undefined);
    ({ error } = await supabase.storage
      .from(BROKER_SIGNATURES_BUCKET)
      .upload(storageKey, parsed.bytes, { contentType: parsed.mimeType, upsert: true }));
  }

  if (error) {
    throw new Error(error.message || 'No se pudo almacenar la firma en Supabase Storage.');
  }

  return storageKey;
}

export async function downloadBrokerSignatureAsDataUrl(
  storageKey: string | null | undefined,
): Promise<string | undefined> {
  const key = storageKey?.trim();
  if (!key || !key.includes('/') || key.includes('..')) return undefined;

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage.from(BROKER_SIGNATURES_BUCKET).download(key);
  if (error || !data) return undefined;

  const ext = key.split('.').pop()?.toLowerCase() ?? 'png';
  const mimeType = data.type && data.type.startsWith('image/')
    ? data.type
    : (MIME_BY_EXT[ext] ?? 'image/png');
  const bytes = Buffer.from(await data.arrayBuffer());
  if (bytes.byteLength === 0) return undefined;

  return `data:${mimeType};base64,${bytes.toString('base64')}`;
}
