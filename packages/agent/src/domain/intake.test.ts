import { describe, expect, it } from 'vitest';

import { ClaimSchema, RawDocumentSchema, SourceSchema } from './intake.js';
import type { Claim, RawDocument, Source } from './intake.js';

const source: Source = { kind: 'invoice', ref: 'INV-001' };

function claim(overrides: Partial<Claim> = {}): Claim {
  return {
    value: 'algodón',
    unit: null,
    target: null,
    source,
    method: 'rule',
    confidence: 'high',
    ...overrides,
  };
}

describe('Claim', () => {
  it('rechaza un target con forma de código arancelario (4+ dígitos)', () => {
    for (const target of ['8708', '8708.29', '8708.29.00.00', '3901', '9999']) {
      expect(() => ClaimSchema.parse({ ...claim(), target })).toThrow();
    }
  });

  it('acepta un target de ficha válido y nulo', () => {
    expect(ClaimSchema.parse({ ...claim(), target: 'what' }).target).toBe('what');
    expect(ClaimSchema.parse({ ...claim(), target: 'presentation' }).target).toBe('presentation');
    expect(ClaimSchema.parse({ ...claim(), target: null }).target).toBeNull();
  });

  it('valida method y confidence', () => {
    expect(() => ClaimSchema.parse({ ...claim(), method: 'adivinado' as never })).toThrow();
    expect(() => ClaimSchema.parse({ ...claim(), confidence: 'total' as never })).toThrow();
  });
});

describe('RawDocument', () => {
  const base: RawDocument = {
    source,
    text: 'factura PDF',
    claims: [],
    reader: 'text-layer',
  };

  it('reader distingue text-layer de vision', () => {
    const textLayer = RawDocumentSchema.parse({ ...base, reader: 'text-layer' });
    expect(textLayer.reader).toBe('text-layer');

    const vision = RawDocumentSchema.parse({
      ...base,
      reader: 'vision',
      readerModel: 'gpt-4o',
      claims: [{ ...claim(), value: 'camisa', target: 'what', method: 'model' }],
    });
    expect(vision.reader).toBe('vision');
    expect(vision.readerModel).toBe('gpt-4o');
    expect(vision.claims).toHaveLength(1);
  });

  it('rechaza un reader desconocido', () => {
    expect(() => RawDocumentSchema.parse({ ...base, reader: 'ocr' as never })).toThrow();
  });

  it('SourceSchema se re-exporta desde intake y valida el origen', () => {
    expect(SourceSchema.parse({ kind: 'broker', ref: 'corredor-1' }).kind).toBe('broker');
  });
});
