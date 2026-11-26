import type { WorkspaceAttachment } from './types';

const MAX_INLINE_TEXT_CHARS = 8_000;

/**
 * Extracts text or base64 image previews from user-selected workspace attachments
 * via `/api/attachments/extract`, falling back gracefully to filename metadata.
 */
export async function extractWorkspaceAttachments(
  files: FileList,
): Promise<WorkspaceAttachment[]> {
  const added: WorkspaceAttachment[] = [];

  for (const file of Array.from(files)) {
    let extractedText: string | undefined;
    let imageDataUrl: string | undefined;
    const isText = /text|csv|json/i.test(file.type) || /\.(txt|csv)$/i.test(file.name);
    const isPdfOrImage =
      /pdf|image\/(png|jpeg|webp)/i.test(file.type) || /\.(pdf|png|jpe?g|webp)$/i.test(file.name);

    if (isText) {
      try {
        extractedText = (await file.text()).slice(0, MAX_INLINE_TEXT_CHARS);
      } catch {
        extractedText = undefined;
      }
    } else if (isPdfOrImage && typeof fetch !== 'undefined') {
      try {
        const form = new FormData();
        form.append('file', file);
        const res = await fetch('/api/attachments/extract', { method: 'POST', body: form });
        if (res.ok) {
          const payload = (await res.json()) as {
            text?: string;
            dataUrl?: string;
          };
          if (payload.text) extractedText = payload.text;
          if (payload.dataUrl) imageDataUrl = payload.dataUrl;
        }
      } catch {
        // Graceful fallback to filename attachment
      }
    }

    added.push({
      id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: file.name,
      mimeType: file.type || 'application/octet-stream',
      sizeBytes: file.size,
      ...(extractedText ? { extractedText } : {}),
      ...(imageDataUrl ? { imageDataUrl } : {}),
    });
  }

  return added;
}
