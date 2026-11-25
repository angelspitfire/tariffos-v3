import { describe, expect, it } from 'vitest';

import type { RawDocument, Source } from '../../domain/intake.js';
import type { VisionReader } from '../vision-reader.js';
import { readWithFallback, readWithTimeout } from './fallback.js';

const source: Source = { kind: 'text', ref: 'pagina' };
const readerModel = 'modelo-x';

const goodDoc: RawDocument = {
  source,
  text: 'texto transcrito',
  claims: [],
  reader: 'vision',
  readerModel,
  regions: [],
};

function readerWith(result: RawDocument | null, shouldThrow = false): VisionReader {
  return {
    async read() {
      if (shouldThrow) throw new Error('caída del lector');
      return result;
    },
  } as unknown as VisionReader;
}

describe('readWithTimeout (F2-13)', () => {
  it('devuelve el resultado cuando llega antes del timeout', async () => {
    const doc = await readWithTimeout(readerWith(goodDoc), new Uint8Array([1]), 5000);
    expect(doc).toEqual(goodDoc);
  });

  it('rechaza cuando supera el timeout', async () => {
    const slow: VisionReader = {
      async read() {
        await new Promise((r) => setTimeout(r, 200));
        return goodDoc;
      },
    } as unknown as VisionReader;
    await expect(readWithTimeout(slow, new Uint8Array([1]), 50)).rejects.toThrow(/superó/);
  });
});

describe('readWithFallback (F2-13)', () => {
  it('devuelve el documento leído con éxito', async () => {
    const doc = await readWithFallback(
      readerWith(goodDoc),
      new Uint8Array([1]),
      5000,
      source,
      readerModel,
    );
    expect(doc.unreadable).toBeUndefined();
    expect(doc.text).toBe('texto transcrito');
  });

  it('devuelve unreadable en timeout, nunca texto parcial', async () => {
    const slow: VisionReader = {
      async read() {
        await new Promise((r) => setTimeout(r, 200));
        return goodDoc;
      },
    } as unknown as VisionReader;
    const doc = await readWithFallback(slow, new Uint8Array([1]), 50, source, readerModel);
    expect(doc.unreadable).toBe(true);
    expect(doc.reader).toBe('vision');
  });

  it('devuelve unreadable cuando el lector lanza, nunca texto vacío sin marcar', async () => {
    const doc = await readWithFallback(
      readerWith(null, true),
      new Uint8Array([1]),
      5000,
      source,
      readerModel,
    );
    expect(doc.unreadable).toBe(true);
    expect(doc.text).toBe('');
  });

  it('devuelve unreadable cuando el lector devuelve null', async () => {
    const doc = await readWithFallback(
      readerWith(null),
      new Uint8Array([1]),
      5000,
      source,
      readerModel,
    );
    expect(doc.unreadable).toBe(true);
  });
});
