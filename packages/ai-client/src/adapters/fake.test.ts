import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { createFakeProvider, defaultVector } from './fake.js';
import { EmbeddingDimensionMismatchError, SchemaViolationError } from '../port.js';

describe('createFakeProvider', () => {
  it('answers a programmed text response', async () => {
    const fake = createFakeProvider({ text: 'respuesta' });
    expect(await fake.generateText('hola')).toBe('respuesta');
  });

  it('falls back to a deterministic default', async () => {
    const fake = createFakeProvider();
    const first = await fake.generateText('hola');
    const second = await fake.generateText('hola');
    expect(first).toBe(second);
  });

  it('records every call so a test can assert on it', async () => {
    const fake = createFakeProvider();
    await fake.generateText('uno');
    await fake.embedText('dos', { dims: 4 });
    expect(fake.calls.map((c) => c.operation)).toEqual(['generateText', 'embedText']);
    expect(fake.calls[1].prompt).toBe('dos');
  });

  it('forgets recorded calls on reset but keeps the programmed responses', async () => {
    const fake = createFakeProvider({ text: 'respuesta' });
    await fake.generateText('hola');
    fake.reset();
    expect(fake.calls).toHaveLength(0);
    expect(await fake.generateText('hola')).toBe('respuesta');
  });

  it('gives two instances independent state', async () => {
    const first = createFakeProvider({ text: 'primero' });
    const second = createFakeProvider({ text: 'segundo' });
    expect(await first.generateText('x')).toBe('primero');
    expect(await second.generateText('x')).toBe('segundo');
    expect(first.calls).toHaveLength(1);
    expect(second.calls).toHaveLength(1);
  });

  describe('generateJson', () => {
    it('returns data validated against the caller schema', async () => {
      const fake = createFakeProvider({ json: { ok: true } });
      const schema = z.object({ ok: z.boolean() });
      expect(await fake.generateJson('p', schema)).toEqual({ ok: true });
    });

    it('enforces the barrier: a non-conforming answer throws SchemaViolationError', async () => {
      const fake = createFakeProvider({ json: { ok: 'not-a-boolean' } });
      const schema = z.object({ ok: z.boolean() });
      await expect(fake.generateJson('p', schema)).rejects.toThrow(SchemaViolationError);
    });

    it('accepts a function as the programmed answer', async () => {
      const fake = createFakeProvider({ json: (prompt: string) => ({ echo: prompt }) });
      const schema = z.object({ echo: z.string() });
      expect(await fake.generateJson('hola', schema)).toEqual({ echo: 'hola' });
    });
  });

  describe('streamText', () => {
    it('delivers the text in fragments', async () => {
      const fake = createFakeProvider({ text: 'respuesta completa' });
      const fragments: string[] = [];
      for await (const fragment of fake.streamText('hola')) {
        fragments.push(fragment);
      }
      expect(fragments.length).toBeGreaterThan(1);
      expect(fragments.join('')).toBe('respuesta completa');
    });

    it('records the call', async () => {
      const fake = createFakeProvider({ text: 'x' });
      // Drain the stream so the call is registered.
      for await (const _ of fake.streamText('hola')) { /* drain */ }
      expect(fake.calls.map((c) => c.operation)).toEqual(['streamText']);
    });
  });

  describe('embedText', () => {
    it('returns a vector of the requested width', async () => {
      const fake = createFakeProvider();
      const vector = await fake.embedText('texto', { dims: 16 });
      expect(vector).toHaveLength(16);
    });

    it('does not return a constant vector: the signal varies with the input', async () => {
      const fake = createFakeProvider();
      const first = await fake.embedText('uno', { dims: 8 });
      const second = await fake.embedText('dos', { dims: 8 });
      expect(first).not.toEqual(second);
      expect(new Set(first).size).toBeGreaterThan(1);
    });

    it('is deterministic for the same input', async () => {
      const fake = createFakeProvider();
      expect(await fake.embedText('texto', { dims: 8 })).toEqual(
        await fake.embedText('texto', { dims: 8 }),
      );
    });

    it('rejects a programmed vector of the wrong width', async () => {
      const fake = createFakeProvider({ embedding: [0.1, 0.2] });
      await expect(fake.embedText('t', { dims: 4 })).rejects.toThrow(
        EmbeddingDimensionMismatchError,
      );
    });
  });
});

describe('defaultVector', () => {
  it('has the requested width', () => {
    expect(defaultVector('x', 32)).toHaveLength(32);
  });

  it('differs between inputs', () => {
    expect(defaultVector('uno', 8)).not.toEqual(defaultVector('dos', 8));
  });
});
