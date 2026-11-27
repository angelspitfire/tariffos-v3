import { z } from 'zod';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { BatchFileExtractionError } from './batch-file-extractor';
import {
  BATCH_INVOICES_BUCKET,
  MAX_BATCH_STORAGE_BYTES,
  SIGNED_UPLOAD_THRESHOLD_BYTES,
} from './batch-storage-constants';

export { BATCH_INVOICES_BUCKET, MAX_BATCH_STORAGE_BYTES, SIGNED_UPLOAD_THRESHOLD_BYTES };

const ALLOWED_BATCH_EXTENSIONS = ['.xlsx', '.xls', '.csv', '.txt', '.pdf', '.png', '.jpg', '.jpeg', '.webp'] as const;

const MIME_BY_EXTENSION: Record<string, string> = {
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.xls': 'application/vnd.ms-excel',
  '.csv': 'text/csv',
  '.txt': 'text/plain',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};

export const BatchUploadUrlRequestSchema = z.object({
  fileName: z
    .string()
    .trim()
    .min(1)
    .max(180)
    .refine(
      (name) => ALLOWED_BATCH_EXTENSIONS.some((ext) => name.toLowerCase().endsWith(ext)),
      { message: 'Formato no soportado. Usa XLSX, CSV, TXT, PDF o imagen (PNG/JPG/WEBP).' },
    ),
  contentType: z.string().trim().min(1).max(120).default('application/octet-stream'),
  sizeBytes: z.number().int().positive().max(MAX_BATCH_STORAGE_BYTES),
});

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 140) || 'invoice.bin';
}

function inferMimeFromFileName(fileName: string): string {
  const lower = fileName.toLowerCase();
  const ext = Object.keys(MIME_BY_EXTENSION).find((k) => lower.endsWith(k));
  return ext ? MIME_BY_EXTENSION[ext]! : 'application/octet-stream';
}

export async function createBatchSignedUploadUrl(
  tenantId: string,
  fileName: string,
): Promise<{ storageKey: string; signedUrl: string }> {
  const storageKey = `${tenantId}/${Date.now()}-${sanitizeFileName(fileName)}`;
  const supabase = createSupabaseAdminClient();

  let { data, error } = await supabase.storage
    .from(BATCH_INVOICES_BUCKET)
    .createSignedUploadUrl(storageKey);

  if (error && /bucket/i.test(error.message)) {
    await supabase.storage
      .createBucket(BATCH_INVOICES_BUCKET, {
        public: false,
        fileSizeLimit: MAX_BATCH_STORAGE_BYTES,
      })
      .catch(() => undefined);
    ({ data, error } = await supabase.storage
      .from(BATCH_INVOICES_BUCKET)
      .createSignedUploadUrl(storageKey));
  }

  if (error || !data?.signedUrl) {
    throw new Error(error?.message ?? 'No se pudo generar URL de subida para el lote.');
  }

  return { storageKey, signedUrl: data.signedUrl };
}

export async function downloadBatchFileFromStorage(
  storageKey: string,
  expectedTenantId: string,
  fileNameHint?: string,
): Promise<File> {
  const cleanKey = storageKey.trim();
  if (!cleanKey || cleanKey.includes('..') || !cleanKey.startsWith(`${expectedTenantId}/`)) {
    throw new BatchFileExtractionError('Referencia de archivo inválida o no autorizada.', 403);
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage.from(BATCH_INVOICES_BUCKET).download(cleanKey);
  if (error || !data) {
    throw new BatchFileExtractionError(
      `No se pudo descargar el archivo desde Storage (${error?.message ?? 'vacío'}).`,
      404,
    );
  }

  const fallbackName = cleanKey.split('/').pop() ?? 'invoice.bin';
  const fileName = fileNameHint?.trim() || fallbackName;
  const mime = data.type || inferMimeFromFileName(fileName);
  const bytes = await data.arrayBuffer();
  return new File([bytes], fileName, { type: mime });
}
