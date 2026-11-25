import { describe, expect, it } from 'vitest';

import {
  TranscriptionSchema,
  unreadableDocument,
  validateWithRetry,
} from './validate.js';
import type { Source } from '../../domain/intake.js';

const source: Source = { kind: 'text', ref: 'pagina' };

describe('TranscriptionSchema (F2-10)', () => {
  it('valida una transcripción completa', () => {
    const t = TranscriptionSchema.parse({ text: 'camisa', regions: [] });
    expect(t.text).toBe('camisa');
  });

  it('rechaza texto vacío', () => {
    expect(() => TranscriptionSchema.parse({ text: '' })).toThrow();
  });
});

describe('validateWithRetry (F2-10)', () => {
  it('devuelve la transcripción al primer intento', async () => {
    const out = await validateWithRetry(async () => ({
      text: 'camisa de algodón',
      regions: [],
    }));
    expect(out!.text).toBe('camisa de algodón');
  });

  it('reintenta una vez y tiene éxito en el segundo', async () => {
    let calls = 0;
    const out = await validateWithRetry(async () => {
      calls++;
      if (calls === 1) throw new Error('esquema inválido');
      return { text: 'texto válido', regions: [] };
    });
    expect(out!.text).toBe('texto válido');
    expect(calls).toBe(2);
  });

  it('devuelve null tras dos intentos fallidos', async () => {
    const out = await validateWithRetry(async () => {
      throw new Error('siempre falla');
    });
    expect(out).toBeNull();
  });

  it('no hace más de 2 intentos', async () => {
    let calls = 0;
    await validateWithRetry(async () => {
      calls++;
      throw new Error('falla');
    });
    expect(calls).toBe(2);
  });
});

describe('unreadableDocument (F2-10/F2-13)', () => {
  it('produce un documento no legible marcado', () => {
    const doc = unreadableDocument(source, 'modelo-x');
    expect(doc.unreadable).toBe(true);
    expect(doc.text).toBe('');
    expect(doc.reader).toBe('vision');
    expect(doc.readerModel).toBe('modelo-x');
    expect(doc.claims).toEqual([]);
  });

  it('queda válido contra RawDocumentSchema', async () => {
    const { RawDocumentSchema } = await import('../../domain/intake.js');
    const doc = unreadableDocument(source, 'm');
    expect(() => RawDocumentSchema.parse(doc)).not.toThrow();
  });
});
