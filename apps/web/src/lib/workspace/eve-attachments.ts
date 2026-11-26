import type { EveMessageContent } from '@assistant-ui/eve';
import type { WorkspaceAttachment } from './types';

const DATA_URL_RE = /^data:([^;]+);base64,(.+)$/;

/**
 * Builds an Eve outbound message payload merging pending extracted document text
 * and base64 image attachments as `file` content parts.
 */
export function buildEvePayloadWithAttachments(
  text: string,
  attachments: readonly WorkspaceAttachment[],
): EveMessageContent {
  const cleanText = text.trim();
  if (attachments.length === 0) return cleanText;

  const textBlocks: string[] = cleanText ? [cleanText] : [];
  const fileParts: Extract<EveMessageContent[number], { type: 'file' }>[] = [];

  for (const att of attachments) {
    const extracted = att.extractedText?.trim();
    if (extracted) {
      textBlocks.push(`[Adjunto: ${att.name}]\n${extracted}`);
    }
    const match = att.imageDataUrl ? DATA_URL_RE.exec(att.imageDataUrl) : null;
    if (match?.[1] && match[2]) {
      fileParts.push({
        type: 'file',
        data: match[2],
        mediaType: match[1],
        filename: att.name,
      });
    }
  }

  const combinedText =
    textBlocks.join('\n\n') || `Clasificar documentos adjuntos (${attachments.length})`;

  return [{ type: 'text', text: combinedText }, ...fileParts];
}
