import { describe, expect, it } from 'vitest';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { FileVisionCache, cachedRead, hashPage } from './cache.js';
import type { RawDocument } from '../../domain/intake.js';
import type { VisionReader } from '../vision-reader.js';

function makeImage(bytes: number[]): Uint8Array {
  return Uint8Array.from(bytes);
}

function fakeReader(doc: RawDocument | null): VisionReader & { calls: number } {
  let calls = 0;
  return {
    async read() {
      calls++;
      return doc;
    },
    get calls(): number {
      return calls;
    },
  } as unknown as VisionReader & { calls: number };
}

describe('hashPage (F2-09)', () => {
  it('produce un hash SHA-256 determinista de 64 hex', async () => {
    const a = await hashPage(makeImage([1, 2, 3]));
    const b = await hashPage(makeImage([1, 2, 3]));
    const c = await hashPage(makeImage([1, 2, 4]));
    expect(a).toBe(b);
    expect(a).not.toBe(c);
    expect(a.length).toBe(64);
  });
});

describe('cachedRead (F2-09)', () => {
  const doc: RawDocument = {
    source: { kind: 'text', ref: 'page-1' },
    text: 'transcripción de prueba',
    claims: [],
    reader: 'vision',
    readerModel: 'gpt-4o-mini',
    regions: [],
  };

  it('la segunda lectura de la misma página no llama al modelo', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'vision-cache-'));
    try {
      const cache = new FileVisionCache(dir);
      const reader = fakeReader(doc);
      const image = makeImage([9, 9, 9]);

      const first = await cachedRead(reader, image, cache);
      expect(first!.text).toBe('transcripción de prueba');
      expect(reader.calls).toBe(1);

      const second = await cachedRead(reader, image, cache);
      expect(second!.text).toBe('transcripción de prueba');
      expect(second!.readerModel).toBe('gpt-4o-mini');
      expect(reader.calls).toBe(1); // no volvió a llamar al modelo
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('una imagen diferente vuelve a llamar al modelo', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'vision-cache-'));
    try {
      const cache = new FileVisionCache(dir);
      const reader = fakeReader(doc);
      await cachedRead(reader, makeImage([1]), cache);
      await cachedRead(reader, makeImage([2]), cache);
      expect(reader.calls).toBe(2);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('si el lector devuelve null no se cachea nada', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'vision-cache-'));
    try {
      const cache = new FileVisionCache(dir);
      const reader = fakeReader(null);
      const result = await cachedRead(reader, makeImage([5]), cache);
      expect(result).toBeNull();
      // No hay archivo de caché escrito
      const files = await (await import('node:fs/promises')).readdir(dir);
      expect(files).toHaveLength(0);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('FileVisionCache.set y get persisten en disco', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'vision-cache-'));
    try {
      const cache = new FileVisionCache(dir);
      await cache.set('abc', {
        text: 'persistido',
        readerModel: 'm',
        regions: [],
        cachedAt: 1,
      });
      const hit = await cache.get('abc');
      expect(hit!.text).toBe('persistido');
      expect(await cache.get('inexistente')).toBeNull();
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('escribe el archivo de caché solo tras una lectura real', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'vision-cache-'));
    try {
      const cache = new FileVisionCache(dir);
      const reader = fakeReader(doc);
      await cachedRead(reader, makeImage([7]), cache);
      const { readdir } = await import('node:fs/promises');
      const files = await readdir(dir);
      expect(files.length).toBe(1);
      await writeFile(join(dir, files[0]), '{"text":"corregido"}'); // simula corrección de operador
      const hit = await cache.get(files[0].replace('.json', ''));
      expect(hit!.text).toBe('corregido');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
