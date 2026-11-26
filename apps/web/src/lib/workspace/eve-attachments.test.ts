import { describe, expect, it } from 'vitest';
import { buildEvePayloadWithAttachments } from './eve-attachments';
import type { WorkspaceAttachment } from './types';

describe('buildEvePayloadWithAttachments', () => {
  it('returns plain trimmed string when there are no attachments', () => {
    expect(buildEvePayloadWithAttachments('  Clasificar laptop  ', [])).toBe('Clasificar laptop');
  });

  it('combines extracted document text and base64 image files into EveMessageContent parts', () => {
    const attachments: WorkspaceAttachment[] = [
      {
        id: 'att-1',
        name: 'factura.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 1200,
        extractedText: '20 cajas de tornillos M8 acero inoxidable',
      },
      {
        id: 'att-2',
        name: 'etiqueta.png',
        mimeType: 'image/png',
        sizeBytes: 512,
        imageDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==',
      },
    ];

    const payload = buildEvePayloadWithAttachments('Clasifica esta mercancía', attachments);
    expect(Array.isArray(payload)).toBe(true);
    expect(payload).toEqual([
      {
        type: 'text',
        text: 'Clasifica esta mercancía\n\n[Adjunto: factura.pdf]\n20 cajas de tornillos M8 acero inoxidable',
      },
      {
        type: 'file',
        data: 'iVBORw0KGgoAAAANSUhEUg==',
        mediaType: 'image/png',
        filename: 'etiqueta.png',
      },
    ]);
  });
});
