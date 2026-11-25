/**
 * Caché de transcripción por hash de página (F2-09).
 *
 * La clave de caché es SHA-256 de los bytes de la imagen de la página. La
 * segunda lectura de la misma página NO llama al modelo.
 *
 * Nota: esta caché es CORRECCIÓN, no optimización. Cuando un operador
 * corrige la transcripción de una página, el resultado corregido se guarda
 * bajo el mismo hash y prevalece sobre cualquier lectura posterior del
 * modelo.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Region, RawDocument } from '../../domain/intake.js';
import type { VisionReader } from '../vision-reader.js';

export interface CachedTranscription {
  text: string;
  readerModel: string;
  regions: Region[];
  cachedAt: number;
}

export interface VisionCache {
  get(key: string): Promise<CachedTranscription | null>;
  set(key: string, value: CachedTranscription): Promise<void>;
}

export async function hashPage(image: Uint8Array): Promise<string> {
  const buffer = image.buffer.slice(
    image.byteOffset,
    image.byteOffset + image.byteLength,
  ) as ArrayBuffer;
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  const bytes = new Uint8Array(digest);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

export function cacheDir(): string {
  return process.env.VISION_CACHE_DIR ?? '.cache/vision';
}

export class FileVisionCache implements VisionCache {
  constructor(private readonly dir: string = cacheDir()) {}

  private path(key: string): string {
    return join(this.dir, `${key}.json`);
  }

  async get(key: string): Promise<CachedTranscription | null> {
    try {
      const text = await readFile(this.path(key), 'utf8');
      return JSON.parse(text) as CachedTranscription;
    } catch {
      return null;
    }
  }

  async set(key: string, value: CachedTranscription): Promise<void> {
    await mkdir(this.dir, { recursive: true });
    await writeFile(this.path(key), JSON.stringify(value), 'utf8');
  }
}

export async function cachedRead(
  reader: VisionReader,
  image: Uint8Array,
  cache: VisionCache,
): Promise<RawDocument | null> {
  const key = await hashPage(image);
  const hit = await cache.get(key);
  if (hit) {
    return {
      source: { kind: 'text', ref: `cached:${key}` },
      text: hit.text,
      claims: [],
      reader: 'vision',
      readerModel: hit.readerModel,
      regions: hit.regions,
    };
  }

  const doc = await reader.read(image);
  if (!doc) return null;

  await cache.set(key, {
    text: doc.text,
    readerModel: doc.readerModel ?? 'unknown',
    regions: doc.regions ?? [],
    cachedAt: Date.now(),
  });
  return doc;
}
