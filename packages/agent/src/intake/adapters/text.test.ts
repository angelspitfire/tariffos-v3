import { describe, expect, it } from 'vitest';

import { DirectTextAdapter, extractText } from './text.js';
import type { Source } from '../../domain/intake.js';

const source: Source = { kind: 'text', ref: 'HOJA DE DATOS DEL PRODUCTO' };

describe('DirectTextAdapter (F2-02)', () => {
  it('convierte texto plano en RawDocument con reader "text-layer"', async () => {
    const adapter = new DirectTextAdapter();
    const doc = await adapter.extract(source);
    expect(doc).not.toBeNull();
    expect(doc!.reader).toBe('text-layer');
    expect(doc!.text).toBe('HOJA DE DATOS DEL PRODUCTO');
    expect(doc!.claims).toEqual([]);
    expect(doc!.readerModel).toBeUndefined();
  });

  it('no llama al modelo (claims vacíos)', async () => {
    const adapter = new DirectTextAdapter();
    const doc = await adapter.extract(source);
    expect(doc!.claims).toHaveLength(0);
  });

  it('helper extractText devuelve el mismo resultado', async () => {
    const direct = await new DirectTextAdapter().extract(source);
    const helper = await extractText(source);
    expect(helper).toEqual(direct);
  });

  it('rechaza un source cuyo kind no es "text"', async () => {
    const adapter = new DirectTextAdapter();
    const badSource = { kind: 'invoice', ref: 'x' } as Source;
    await expect(adapter.extract(badSource)).rejects.toThrow();
  });

  it('RawDocument queda válido contra el esquema del dominio', async () => {
    const { RawDocumentSchema } = await import('../../domain/intake.js');
    const adapter = new DirectTextAdapter();
    const doc = await adapter.extract(source);
    expect(() => RawDocumentSchema.parse(doc!)).not.toThrow();
  });
});
