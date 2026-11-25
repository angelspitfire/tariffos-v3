/**
 * Idempotencia por hash de documento (F2-30).
 *
 * Calcula SHA-256 de los bytes crudos del documento (o de las imágenes de
 * página para visión) y construye la clave de caché como `hash:tipo`. El
 * mismo archivo produce las mismas aserciones sin repetir llamadas al
 * modelo.
 */

import type { DocType } from './doc-type.js';

/** Máximo de longitud de segmento de clave (constante, no literal mágico). */
export const HASH_HEX_LENGTH = 64;

/** Separador entre hash y tipo de documento en la clave de caché. */
export const CACHE_KEY_SEPARATOR = ':';

/**
 * Calcula SHA-256 de los bytes crudos del documento. Devuelve hex de 64
 * caracteres. En entornos sin `crypto.subtle` usa una implementación de
 * respaldo determinista.
 */
export async function hashDocument(bytes: Uint8Array): Promise<string> {
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  const digest = await crypto.subtle.digest('SHA-256', buffer as ArrayBuffer);
  const bytesOut = new Uint8Array(digest);
  let hex = '';
  for (let i = 0; i < bytesOut.length; i++) {
    hex += bytesOut[i].toString(16).padStart(2, '0');
  }
  return hex;
}

/**
 * Construye la clave de caché: `hash:tipoDocumento`.
 */
export function cacheKey(hash: string, docType: DocType): string {
  return `${hash}${CACHE_KEY_SEPARATOR}${docType}`;
}

/**
 * Extrae el hash de una clave de caché válida.
 */
export function hashFromKey(key: string): string | null {
  const sep = key.indexOf(CACHE_KEY_SEPARATOR);
  if (sep === -1 || sep === 0 || sep === key.length - 1) return null;
  const hash = key.slice(0, sep);
  if (hash.length !== HASH_HEX_LENGTH) return null;
  return hash;
}

/**
 * Extrae el tipo de documento de una clave de caché válida.
 */
export function docTypeFromKey(key: string): DocType | null {
  const sep = key.indexOf(CACHE_KEY_SEPARATOR);
  if (sep === -1 || sep === key.length - 1) return null;
  const docType = key.slice(sep + 1);
  if (
    docType === 'invoice' ||
    docType === 'packing' ||
    docType === 'bol' ||
    docType === 'datasheet' ||
    docType === 'catalog' ||
    docType === 'unknown'
  ) {
    return docType as DocType;
  }
  return null;
}

/**
 * Resultado de comprobación de idempotencia.
 */
export interface IdempotencyResult {
  /** true si el documento ya fue procesado (misma clave de caché). */
  cached: boolean;
  /** Clave de caché utilizada. */
  key: string;
  /** Hash del documento. */
  hash: string;
}

/**
 * Puerto de caché de idempotencia (inyección, no estado global).
 */
export interface IdempotencyCache {
  get(key: string): Promise<unknown | null>;
  set(key: string, value: unknown): Promise<void>;
}

/**
 * Comprueba si un documento ya fue procesado y registra el resultado.
 */
export class IdempotencyChecker {
  constructor(private readonly cache: IdempotencyCache) {}

  async check(hash: string, docType: DocType): Promise<IdempotencyResult> {
    const key = cacheKey(hash, docType);
    const cached = (await this.cache.get(key)) !== null;
    return { cached, key, hash };
  }

  async record(hash: string, docType: DocType, value: unknown): Promise<void> {
    const key = cacheKey(hash, docType);
    await this.cache.set(key, value);
  }
}

/** Caché en memoria para pruebas y entornos sin persistencia. */
export class MemoryIdempotencyCache implements IdempotencyCache {
  private _store = new Map<string, unknown>();

  async get(key: string): Promise<unknown | null> {
    return this._store.get(key) ?? null;
  }

  async set(key: string, value: unknown): Promise<void> {
    this._store.set(key, value);
  }

  clear(): void {
    this._store.clear();
  }

  size(): number {
    return this._store.size;
  }
}
