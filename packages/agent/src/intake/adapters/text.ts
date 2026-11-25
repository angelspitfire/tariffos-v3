/**
 * Adaptador de texto directo (F2-02).
 *
 * Convierte entrada de texto plano / textarea en un `RawDocument` sin pasar
 * por el modelo de visión. `reader: 'text-layer'`, sin `readerModel` y sin
 * `claims` (la extracción de afirmaciones ocurre después).
 *
 * El contenido del texto viaja en `source.ref` cuando `source.kind ===
 * 'text'`.
 */

import type { RawDocument, Source } from '../../domain/intake.js';
import { TextExtractor } from '../text-extractor.js';
import { SourceSchema } from '../../domain/sheet.js';

const TextSourceSchema = SourceSchema.refine(
  (source) => source.kind === 'text',
  { message: 'el adaptador de texto directo requiere source.kind === "text"' },
);

export class DirectTextAdapter implements TextExtractor {
  async extract(source: Source): Promise<RawDocument | null> {
    TextSourceSchema.parse(source);
    const text = source.ref;
    if (text.length === 0) return null;
    return {
      source: { ...source },
      text,
      claims: [],
      reader: 'text-layer',
    };
  }
}

export function extractText(source: Source): Promise<RawDocument | null> {
  return new DirectTextAdapter().extract(source);
}

export { TextSourceSchema };
