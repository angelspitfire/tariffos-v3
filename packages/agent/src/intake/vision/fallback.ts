/**
 * Fallback del lector de visión (F2-13).
 *
 * Timeout o errores devuelven el estado `unreadable`. Nunca devuelve texto
 * parcial ni vacío sin la marca `unreadable: true`.
 */

import type { RawDocument, Source } from '../../domain/intake.js';
import type { VisionReader } from '../vision-reader.js';
import { unreadableDocument } from './validate.js';

/**
 * Ejecuta la lectura con un tiempo de espera. Si se agota, rechaza.
 */
export async function readWithTimeout(
  reader: VisionReader,
  image: Uint8Array,
  ms: number,
): Promise<RawDocument | null> {
  const timeout = new Promise<never>((_resolve, reject) => {
    setTimeout(
      () => reject(new Error(`lectura de visión superó ${ms} ms`)),
      ms,
    );
  });
  return Promise.race([reader.read(image), timeout]);
}

/**
 * Lee con fallback: cualquier error o timeout produce `unreadable`, nunca
 * texto parcial ni vacío sin marcarlo.
 */
export async function readWithFallback(
  reader: VisionReader,
  image: Uint8Array,
  timeoutMs: number,
  source: Source,
  readerModel: string,
): Promise<RawDocument> {
  try {
    const doc = await readWithTimeout(reader, image, timeoutMs);
    if (!doc) {
      return unreadableDocument(source, readerModel);
    }
    return doc;
  } catch {
    return unreadableDocument(source, readerModel);
  }
}
