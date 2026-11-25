/**
 * Puerto de lectura por visión (F2-06).
 *
 * Transcribe una imagen de página en un `RawDocument`. El modelo de visión
 * transcribe, nunca afirma: la salida no contiene `Claim`, solo texto y
 * regiones. `reader: 'vision'` con `readerModel`.
 */

import type { RawDocument, Source } from '../domain/intake.js';

export interface VisionReader {
  /**
   * Lee una imagen de página y devuelve su transcripción.
   * Devuelve `null` cuando la página no puede leerse (sin contenido).
   */
  read(image: Uint8Array): Promise<RawDocument | null>;
}

export function emptyVisionDocument(
  source: Source,
  readerModel: string,
): RawDocument {
  return {
    source,
    text: '',
    claims: [],
    reader: 'vision',
    readerModel,
    regions: [],
  };
}
