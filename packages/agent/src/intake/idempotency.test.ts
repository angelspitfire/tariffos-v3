import { describe, expect, it } from 'vitest';

import {
  cacheKey,
  docTypeFromKey,
  hashDocument,
  hashFromKey,
  type IdempotencyCache,
  IdempotencyChecker,
  MemoryIdempotencyCache,
} from './idempotency.js';

class CaptureCache implements IdempotencyCache {
  calls: Array<{ op: 'get' | 'set'; key: string; value?: unknown }> = [];
  store = new Map<string, unknown>();
  async get(key: string): Promise<unknown | null> {
    this.calls.push({ op: 'get', key });
    return this.store.get(key) ?? null;
  }
  async set(key: string, value: unknown): Promise<void> {
    this.calls.push({ op: 'set', key, value });
    this.store.set(key, value);
  }
}

describe('hashDocument (F2-30)', () => {
  it('produce SHA-256 hex de 64 caracteres para bytes vacíos', async () => {
    const hash = await hashDocument(new Uint8Array(0));
    expect(hash.length).toBe(64);
    expect(/^[0-9a-f]{64}$/.test(hash)).toBe(true);
  });

  it('misma entrada produce mismo hash', async () => {
    const bytes = new TextEncoder().encode('factura de prueba');
    const a = await hashDocument(bytes);
    const b = await hashDocument(bytes);
    expect(a).toBe(b);
  });

  it('entrada distinta produce hash distinto', async () => {
    const a = await hashDocument(new TextEncoder().encode('a'));
    const b = await hashDocument(new TextEncoder().encode('b'));
    expect(a).not.toBe(b);
  });
});

describe('cacheKey (F2-30)', () => {
  it('construye hash:tipoDocumento', () => {
    const key = cacheKey('abc123', 'invoice');
    expect(key).toBe('abc123:invoice');
  });

  it('incluye el tipo en la clave', () => {
    const key = cacheKey('abc123', 'packing');
    expect(key).toContain(':packing');
  });
});

describe('hashFromKey / docTypeFromKey (F2-30)', () => {
  it('extrae hash y tipo de una clave válida', () => {
    const key = cacheKey('a'.repeat(64), 'datasheet');
    expect(hashFromKey(key)).toBe('a'.repeat(64));
    expect(docTypeFromKey(key)).toBe('datasheet');
  });

  it('clave sin separador devuelve null', () => {
    expect(hashFromKey('sinseparador')).toBeNull();
    expect(docTypeFromKey('sinseparador')).toBeNull();
  });

  it('tipo desconocido devuelve null', () => {
    const key = 'a'.repeat(64) + ':' + 'otro';
    expect(docTypeFromKey(key)).toBeNull();
  });
});

describe('IdempotencyChecker (F2-30)', () => {
  it('misma clave → cached=true, sin repetir modelo', async () => {
    const cache = new CaptureCache();
    const checker = new IdempotencyChecker(cache);
    const hash = 'a'.repeat(64);

    const first = await checker.check(hash, 'invoice');
    expect(first.cached).toBe(false);
    await checker.record(hash, 'invoice', { result: 'x' });

    const second = await checker.check(hash, 'invoice');
    expect(second.cached).toBe(true);

    const gets = cache.calls.filter((c) => c.op === 'get');
    expect(gets).toHaveLength(2);
    expect(gets[0].key).toBe(gets[1].key);
  });

  it('diferente tipo de documento → clave distinta', async () => {
    const cache = new MemoryIdempotencyCache();
    const checker = new IdempotencyChecker(cache);
    const hash = 'b'.repeat(64);

    await checker.record(hash, 'invoice', { a: 1 });
    await checker.record(hash, 'packing', { b: 2 });

    const inv = await checker.check(hash, 'invoice');
    const pack = await checker.check(hash, 'packing');
    expect(inv.cached).toBe(true);
    expect(pack.cached).toBe(true);
    expect(inv.key).not.toBe(pack.key);
    expect(cache.size()).toBe(2);
  });
});
