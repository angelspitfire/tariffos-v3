// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  upload: vi.fn(),
  download: vi.fn(),
  createBucket: vi.fn(),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createSupabaseAdminClient: () => ({
    storage: {
      createBucket: mocks.createBucket,
      from: () => ({
        upload: mocks.upload,
        download: mocks.download,
      }),
    },
  }),
}));

import {
  BROKER_SIGNATURES_BUCKET,
  MAX_SIGNATURE_BYTES,
  downloadBrokerSignatureAsDataUrl,
  parseSignatureDataUrl,
  uploadBrokerSignature,
} from './signature-storage';

describe('signature-storage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('parses PNG base64 and SVG utf8 signature data URLs', () => {
    const pngBase64 = Buffer.from('fake-png-bytes').toString('base64');
    const parsedPng = parseSignatureDataUrl(`data:image/png;base64,${pngBase64}`);
    expect(parsedPng).toEqual({
      mimeType: 'image/png',
      ext: 'png',
      bytes: Buffer.from('fake-png-bytes'),
    });

    const svgText = '<svg xmlns="http://www.w3.org/2000/svg"><text>Firma</text></svg>';
    const parsedSvg = parseSignatureDataUrl(`data:image/svg+xml;utf8,${encodeURIComponent(svgText)}`);
    expect(parsedSvg?.mimeType).toBe('image/svg+xml');
    expect(parsedSvg?.ext).toBe('svg');
    expect(parsedSvg?.bytes.toString('utf8')).toBe(svgText);
  });

  it('rejects non-image, malformed, or oversized data URLs', () => {
    expect(parseSignatureDataUrl('data:text/html;base64,PGgxPkJhZDwvaDE+')).toBeNull();
    expect(parseSignatureDataUrl('javascript:alert(1)')).toBeNull();
    expect(parseSignatureDataUrl('not-a-data-url')).toBeNull();

    const oversized = Buffer.alloc(MAX_SIGNATURE_BYTES + 16, 0x41).toString('base64');
    expect(parseSignatureDataUrl(`data:image/png;base64,${oversized}`)).toBeNull();
  });

  it('uploads signature to broker-signatures bucket and auto-creates bucket if missing', async () => {
    mocks.upload
      .mockResolvedValueOnce({ error: { message: 'Bucket not found' } })
      .mockResolvedValueOnce({ error: null });
    mocks.createBucket.mockResolvedValueOnce({ error: null });

    const pngBase64 = Buffer.from('sig-png').toString('base64');
    const storageKey = await uploadBrokerSignature('user-123', `data:image/png;base64,${pngBase64}`);

    expect(storageKey).toBe('user-123/signature.png');
    expect(mocks.createBucket).toHaveBeenCalledWith(BROKER_SIGNATURES_BUCKET, {
      public: false,
      fileSizeLimit: MAX_SIGNATURE_BYTES,
    });
    expect(mocks.upload).toHaveBeenCalledTimes(2);
    expect(mocks.upload).toHaveBeenLastCalledWith(
      'user-123/signature.png',
      Buffer.from('sig-png'),
      { contentType: 'image/png', upsert: true },
    );
  });

  it('downloads stored signature as data URL and rejects traversal or download failures gracefully', async () => {
    expect(await downloadBrokerSignatureAsDataUrl('../secret/key.png')).toBeUndefined();
    expect(await downloadBrokerSignatureAsDataUrl('flatkey.png')).toBeUndefined();

    mocks.download.mockResolvedValueOnce({
      data: new Blob([Buffer.from('stored-png')], { type: 'image/png' }),
      error: null,
    });

    const dataUrl = await downloadBrokerSignatureAsDataUrl('user-123/signature.png');
    expect(dataUrl).toBe(`data:image/png;base64,${Buffer.from('stored-png').toString('base64')}`);

    mocks.download.mockResolvedValueOnce({
      data: null,
      error: { message: 'Object not found' },
    });
    expect(await downloadBrokerSignatureAsDataUrl('user-123/signature.png')).toBeUndefined();
  });
});
