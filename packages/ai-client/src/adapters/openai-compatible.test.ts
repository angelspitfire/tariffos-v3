import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { z } from 'zod';
import { embed, generateObject, generateText, streamText } from 'ai';
import {
  OpenAICompatibleAdapter,
  PROVIDER_NAME,
  repairJson,
  type ProviderLike,
} from './openai-compatible.js';
import { EmbeddingDimensionMismatchError, SchemaViolationError } from '../port.js';

vi.mock('ai', () => ({
  generateText: vi.fn(),
  generateObject: vi.fn(),
  embed: vi.fn(),
  streamText: vi.fn(),
}));

const mockedObject = generateObject as unknown as Mock;
const mockedText = generateText as unknown as Mock;
const mockedEmbed = embed as unknown as Mock;
const mockedStream = streamText as unknown as Mock;

function fakeProvider(): ProviderLike {
  return {
    chatModel: (modelId) => ({ id: modelId }) as never,
    textEmbeddingModel: (modelId) => ({ id: modelId }) as never,
  };
}

function adapter(): OpenAICompatibleAdapter {
  return new OpenAICompatibleAdapter(fakeProvider);
}

beforeEach(() => {
  mockedObject.mockReset();
  mockedText.mockReset();
  mockedEmbed.mockReset();
  mockedStream.mockReset();
});

describe('repairJson', () => {
  it('leaves valid JSON untouched', () => {
    expect(repairJson('{"ok":true}')).toBe('{"ok":true}');
  });

  it('repairs markdown-fenced JSON', () => {
    const repaired = repairJson('```json\n{"ok":true}\n```');
    expect(JSON.parse(repaired)).toEqual({ ok: true });
  });

  it('repairs trailing commas', () => {
    const repaired = repairJson('{"ok":false,}');
    expect(JSON.parse(repaired)).toEqual({ ok: false });
  });

  it('extracts a JSON object wrapped in reasoning prose or think tags', () => {
    const raw = '<think>analyzing RGI 1 and 6</think>\nAquí está el resultado:\n```json\n{"ok":true}\n```';
    expect(JSON.parse(repairJson(raw))).toEqual({ ok: true });
  });
});

describe('OpenAICompatibleAdapter', () => {
  const schema = z.object({ ok: z.boolean() });

  it('generateText posts the prompt to the chat model', async () => {
    mockedText.mockResolvedValueOnce({ text: 'resp' });
    await adapter().generateText('hi');
    expect(mockedText.mock.calls[0][0]).toMatchObject({ prompt: 'hi' });
  });

  it('generateText honors an explicit model and temperature', async () => {
    mockedText.mockResolvedValueOnce({ text: 'resp' });
    await adapter().generateText('hi', { model: 'qwen3:8b', temperature: 0.4 });
    expect(mockedText.mock.calls[0][0]).toMatchObject({
      model: { id: 'qwen3:8b' },
      temperature: 0.4,
    });
  });

  it('generateJson takes the generateObject fast path with maxRetries: 0', async () => {
    mockedObject.mockResolvedValueOnce({ object: { ok: true } });
    expect(await adapter().generateJson('hi', schema)).toEqual({ ok: true });
    expect(mockedObject.mock.calls[0][0]).toMatchObject({ maxRetries: 0 });
    expect(mockedText).not.toHaveBeenCalled();
  });

  it('falls back to text + repair when object mode is rejected', async () => {
    mockedObject.mockRejectedValueOnce(new Error('json_object unsupported'));
    mockedText.mockResolvedValueOnce({ text: '{"ok":false}' });
    expect(await adapter().generateJson('hi', schema)).toEqual({ ok: false });
    expect(mockedText).toHaveBeenCalledTimes(1);
  });

  it('the fallback enforces the barrier: garbage becomes SchemaViolationError', async () => {
    mockedObject.mockRejectedValueOnce(new Error('json_object unsupported'));
    mockedText.mockResolvedValueOnce({ text: 'I am not json' });
    await expect(adapter().generateJson('hi', schema)).rejects.toThrow(SchemaViolationError);
  });

  it('the fallback repairs fenced JSON before validating', async () => {
    mockedObject.mockRejectedValueOnce(new Error('json_object unsupported'));
    mockedText.mockResolvedValueOnce({ text: '```json\n{"ok":true}\n```' });
    expect(await adapter().generateJson('hi', schema)).toEqual({ ok: true });
  });

  it('uses direct generateText + repairJson when LLM_PROVIDER is nvidia', async () => {
    vi.stubEnv('LLM_PROVIDER', 'nvidia');
    mockedText.mockResolvedValueOnce({ text: '<think>reasoning</think>{"ok":true}' });
    expect(await adapter().generateJson('hi', schema)).toEqual({ ok: true });
    expect(mockedObject).not.toHaveBeenCalled();
    expect(mockedText).toHaveBeenCalledTimes(1);
    vi.unstubAllEnvs();
  });

  it('embedText posts the embedding model', async () => {
    mockedEmbed.mockResolvedValueOnce({ embedding: [0.5, 0.25] });
    const vector = await adapter().embedText('tarifa', { dims: 2 });
    expect(vector).toEqual([0.5, 0.25]);
    expect(mockedEmbed.mock.calls[0][0]).toMatchObject({ value: 'tarifa' });
  });

  it('embedText requests the width under the provider name key', async () => {
    mockedEmbed.mockResolvedValueOnce({ embedding: [0.1, 0.2] });
    await adapter().embedText('tarifa', { dims: 2 });
    // The key must be the provider's `name`, NOT 'openai': the SDK ignores
    // an unknown key silently and the server never receives `dimensions`.
    expect(mockedEmbed.mock.calls[0][0].providerOptions).toEqual({
      [PROVIDER_NAME]: { dimensions: 2 },
    });
  });

  it('embedText passes input_type for nvidia asymmetric embedding models', async () => {
    vi.stubEnv('LLM_PROVIDER', 'nvidia');
    mockedEmbed.mockResolvedValueOnce({ embedding: [0.1, 0.2] });
    await adapter().embedText('tarifa', { dims: 2, inputType: 'passage' });
    expect(mockedEmbed.mock.calls[0][0].providerOptions).toEqual({
      [PROVIDER_NAME]: { dimensions: 2, input_type: 'passage' },
    });
    vi.unstubAllEnvs();
  });

  it('embedText throws typed when the server returns an empty vector', async () => {
    mockedEmbed.mockResolvedValueOnce({ embedding: [] });
    await expect(adapter().embedText('t', { dims: 2 })).rejects.toThrow('no values');
  });

  it('embedText throws when the returned width differs from the requested one', async () => {
    mockedEmbed.mockResolvedValueOnce({ embedding: [0.1, 0.2, 0.3] });
    await expect(adapter().embedText('t', { dims: 2 })).rejects.toThrow(
      EmbeddingDimensionMismatchError,
    );
  });

  it('the width mismatch reports both widths', async () => {
    mockedEmbed.mockResolvedValueOnce({ embedding: [0.1, 0.2, 0.3] });
    await expect(adapter().embedText('t', { dims: 768 })).rejects.toThrow(/768.*3|3.*768/);
  });

  describe('attachments', () => {
    it('carries a text-only prompt as a plain prompt', async () => {
      mockedText.mockResolvedValueOnce({ text: 'resp' });
      await adapter().generateText('hola');
      expect(mockedText.mock.calls[0][0]).toMatchObject({ prompt: 'hola' });
      expect(mockedText.mock.calls[0][0].messages).toBeUndefined();
    });

    it('sends an inline document as a data-URL file part', async () => {
      mockedText.mockResolvedValueOnce({ text: 'resp' });
      await adapter().generateText('describe', {
        attachments: [
          {
            type: 'inline',
            dataUrl: 'data:image/jpeg;base64,JVBERi0=',
            mimeType: 'image/jpeg',
          },
        ],
      });
      const call = mockedText.mock.calls[0][0];
      expect(call.messages[0].content).toEqual([
        { type: 'text', text: 'describe' },
        { type: 'file', mediaType: 'image/jpeg', data: 'data:image/jpeg;base64,JVBERi0=' },
      ]);
    });

    it('refuses a provider file id: this provider takes bytes, not a handle', async () => {
      mockedText.mockResolvedValueOnce({ text: 'resp' });
      await expect(
        adapter().generateText('read', {
          attachments: [{ type: 'reference', uri: 'file-123', mimeType: 'application/pdf' }],
        }),
      ).rejects.toThrow(/cannot reference a provider file id/);
    });

    it('accepts a reference that is a URL', async () => {
      mockedText.mockResolvedValueOnce({ text: 'resp' });
      await adapter().generateText('read', {
        attachments: [
          { type: 'reference', uri: 'https://example.com/doc.pdf', mimeType: 'application/pdf' },
        ],
      });
      const call = mockedText.mock.calls[0][0];
      expect(call.messages[0].content[1]).toEqual({
        type: 'file',
        mediaType: 'application/pdf',
        data: 'https://example.com/doc.pdf',
      });
    });

    it('keeps a text attachment alongside the prompt', async () => {
      mockedText.mockResolvedValueOnce({ text: 'resp' });
      await adapter().generateText('base', {
        attachments: [{ type: 'text', text: 'extra' }],
      });
      const call = mockedText.mock.calls[0][0];
      expect(call.messages[0].content).toEqual([
        { type: 'text', text: 'base' },
        { type: 'text', text: 'extra' },
      ]);
    });

    it('carries the attachments through generateJson too', async () => {
      mockedObject.mockResolvedValueOnce({ object: { ok: true } });
      await adapter().generateJson('read', z.object({ ok: z.boolean() }), {
        attachments: [
          {
            type: 'inline',
            dataUrl: 'data:image/jpeg;base64,JVBERi0=',
            mimeType: 'image/jpeg',
          },
        ],
      });
      const call = mockedObject.mock.calls[0][0];
      expect(call.messages[0].content[1]).toMatchObject({
        type: 'file',
        data: 'data:image/jpeg;base64,JVBERi0=',
      });
    });
  });

  describe('streamText', () => {
    it('returns the SDK stream as the port stream', async () => {
      async function* fragments(): AsyncGenerator<string> {
        yield 'a';
        yield 'b';
      }
      mockedStream.mockReturnValueOnce({ textStream: fragments() });

      const collected: string[] = [];
      for await (const fragment of adapter().streamText('hi')) {
        collected.push(fragment);
      }

      expect(collected).toEqual(['a', 'b']);
    });

    it('passes the prompt and model to the SDK', () => {
      mockedStream.mockReturnValueOnce({ textStream: (async function* () {})() });
      adapter().streamText('hola', { model: 'qwen3:8b', temperature: 0.2 });
      expect(mockedStream.mock.calls[0][0]).toMatchObject({
        prompt: 'hola',
        model: { id: 'qwen3:8b' },
        temperature: 0.2,
      });
    });
  });
});
