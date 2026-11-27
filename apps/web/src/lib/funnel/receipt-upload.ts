import { isCloudModeEnabled } from '@/lib/runtime-config';

export const PAYMENT_RECEIPTS_BUCKET = 'payment-receipts';
export const MAX_RECEIPT_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_RECEIPT_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/pdf',
] as const;

interface UploadUrlResponse {
  directInline?: boolean;
  storageKey?: string;
  signedUrl?: string;
}

export async function uploadPaymentReceipt(
  file: File,
): Promise<{ storageKey: string; uploaded: boolean }> {
  if (!isCloudModeEnabled()) {
    return { storageKey: file.name, uploaded: false };
  }

  try {
    const signRes = await fetch('/api/billing/receipts/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type || 'application/octet-stream',
        sizeBytes: file.size,
      }),
    });
    if (!signRes.ok) {
      return { storageKey: file.name, uploaded: false };
    }

    const signed = (await signRes.json()) as UploadUrlResponse;
    if (signed.directInline || !signed.signedUrl || !signed.storageKey) {
      return { storageKey: file.name, uploaded: false };
    }

    const putRes = await fetch(signed.signedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
        'x-upsert': 'false',
      },
      body: file,
    });
    if (!putRes.ok) {
      return { storageKey: file.name, uploaded: false };
    }

    return { storageKey: signed.storageKey, uploaded: true };
  } catch {
    return { storageKey: file.name, uploaded: false };
  }
}
