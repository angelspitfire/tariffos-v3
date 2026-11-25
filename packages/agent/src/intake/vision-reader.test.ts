import { describe, expect, it } from 'vitest';

import { emptyVisionDocument, type VisionReader } from './vision-reader.js';
import type { RawDocument } from '../domain/intake.js';

class FakeReader implements VisionReader {
  constructor(private readonly result: RawDocument | null) {}
  async read(_image: Uint8Array): Promise<RawDocument | null> {
    return this.result;
  }
}

describe('VisionReader (F2-06)', () => {
  it('el puerto lee una imagen y devuelve RawDocument con reader "vision"', async () => {
    const doc: RawDocument = {
      source: { kind: 'text', ref: 'page-1' },
      text: 'texto transcrito',
      claims: [],
      reader: 'vision',
      readerModel: 'gpt-4o-mini',
      regions: [],
    };
    const reader: VisionReader = new FakeReader(doc);
    const out = await reader.read(new Uint8Array([1, 2, 3]));
    expect(out!.reader).toBe('vision');
    expect(out!.readerModel).toBe('gpt-4o-mini');
    expect(out!.claims).toEqual([]);
    expect(out!.regions).toEqual([]);
  });

  it('puede devolver null cuando no hay contenido', async () => {
    const reader: VisionReader = new FakeReader(null);
    expect(await reader.read(new Uint8Array([1]))).toBeNull();
  });

  it('emptyVisionDocument produce un documento vacío marcado como visión', () => {
    const doc = emptyVisionDocument({ kind: 'text', ref: 'pagina' }, 'modelo-x');
    expect(doc.reader).toBe('vision');
    expect(doc.readerModel).toBe('modelo-x');
    expect(doc.text).toBe('');
    expect(doc.claims).toEqual([]);
    expect(doc.regions).toEqual([]);
  });
});
