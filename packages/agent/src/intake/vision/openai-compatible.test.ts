import { describe, expect, it, vi } from 'vitest';

import { OpenAIVisionAdapter } from './openai-compatible.js';
function stubEnv(vars: Record<string, string | undefined>): () => void {
  const saved: Record<string, string | undefined> = {};
  for (const k of Object.keys(vars)) {
    saved[k] = process.env[k];
    if (vars[k] === undefined) delete process.env[k];
    else process.env[k] = vars[k];
  }
  return () => {
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  };
}

function mockFetch(response: {
  status: number;
  json: unknown;
}): ReturnType<typeof vi.fn> {
  const fn = vi.fn().mockResolvedValue({
    status: response.status,
    ok: response.status >= 200 && response.status < 300,
    json: vi.fn().mockResolvedValue(response.json),
  });
  return fn as unknown as ReturnType<typeof vi.fn>;
}

describe('OpenAIVisionAdapter (F2-07)', () => {
  it('devuelve RawDocument con reader "vision" y readerModel', async () => {
    const restore = stubEnv({
      VISION_BASE_URL: 'https://openrouter.ai/api/v1',
      VISION_API_KEY: 'test-key',
      VISION_MODEL: 'test-vision-model',
    });
    const fetchMock = mockFetch({
      status: 200,
      json: { choices: [{ message: { content: JSON.stringify({ text: 'camisa de algodón', regions: [] }) } }] },
    });
    vi.stubGlobal('fetch', fetchMock);

    try {
      const adapter = new OpenAIVisionAdapter();
      const doc = await adapter.read(new Uint8Array([1, 2, 3]));
      expect(doc).not.toBeNull();
      expect(doc!.reader).toBe('vision');
      expect(doc!.readerModel).toBe('test-vision-model');
      expect(doc!.text).toBe('camisa de algodón');
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const call = fetchMock.mock.calls[0];
      expect(call[0]).toBe('https://openrouter.ai/api/v1/chat/completions');
      const body = JSON.parse(call[1].body as string);
      // Contract: adapter sends model params but exact values are internal knobs
      expect(typeof body.temperature).toBe('number');
      expect(typeof body.seed).toBe('number');
      expect(body.response_format).toEqual({ type: 'json_object' });
    } finally {
      restore();
      vi.unstubAllGlobals();
    }
  });

  it('lanza si VISION_BASE_URL no está configurado', async () => {
    const restore = stubEnv({ VISION_BASE_URL: undefined });
    try {
      const adapter = new OpenAIVisionAdapter();
      await expect(adapter.read(new Uint8Array([1]))).rejects.toThrow(
        /VISION_BASE_URL/,
      );
    } finally {
      restore();
    }
  });

  it('lanza cuando el modelo no devuelve JSON válido (se reintentaría desde validate)', async () => {
    const restore = stubEnv({
      VISION_BASE_URL: 'https://openrouter.ai/api/v1',
      VISION_MODEL: 'm',
    });
    const fetchMock = mockFetch({
      status: 200,
      json: { choices: [{ message: { content: 'no es json' } }] },
    });
    vi.stubGlobal('fetch', fetchMock);
    try {
      const adapter = new OpenAIVisionAdapter();
      await expect(adapter.read(new Uint8Array([1]))).rejects.toThrow(/JSON válido/);
    } finally {
      restore();
      vi.unstubAllGlobals();
    }
  });

  it('devuelve null cuando el contenido está vacío', async () => {
    const restore = stubEnv({
      VISION_BASE_URL: 'https://openrouter.ai/api/v1',
      VISION_MODEL: 'm',
    });
    const fetchMock = mockFetch({
      status: 200,
      json: { choices: [{ message: { content: '' } }] },
    });
    vi.stubGlobal('fetch', fetchMock);
    try {
      const adapter = new OpenAIVisionAdapter();
      const doc = await adapter.read(new Uint8Array([1]));
      expect(doc).toBeNull();
    } finally {
      restore();
      vi.unstubAllGlobals();
    }
  });
});
