import { describe, expect, it } from 'vitest';

import { TextExtractor } from './text-extractor.js';
import type { RawDocument, Source } from '../domain/intake.js';

const source: Source = { kind: 'text', ref: 'factura de muestra' };

class FakeExtractor implements TextExtractor {
  async extract(_source: Source): Promise<RawDocument | null> {
    return {
      source: _source,
      text: 'texto extraído',
      claims: [],
      reader: 'text-layer',
    };
  }
}

describe('TextExtractor (puerto F2-01)', () => {
  it('extrae texto plano y devuelve reader "text-layer"', async () => {
    const extractor: TextExtractor = new FakeExtractor();
    const doc = await extractor.extract(source);
    expect(doc).not.toBeNull();
    expect(doc!.reader).toBe('text-layer');
    expect(doc!.text).toBe('texto extraído');
    expect(doc!.claims).toEqual([]);
  });

  it('devuelve el source recibido', async () => {
    const extractor: TextExtractor = new FakeExtractor();
    const doc = await extractor.extract(source);
    expect(doc!.source).toBe(source);
  });
});
