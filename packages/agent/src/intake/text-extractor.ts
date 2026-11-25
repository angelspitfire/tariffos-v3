/**
 * Puerto de extracción de texto: convierte una fuente (texto plano o PDF con
 * capa de texto) en un `RawDocument` leído por capa de texto (`reader:
 * 'text-layer'`). No llama al modelo de visión.
 *
 * Implementaciones: `adapters/text` (texto directo) y `adapters/pdf-text`
 * (PDF con capa de texto vía unpdf).
 */

import type { RawDocument, Source } from '../domain/intake.js';

export interface TextExtractor {
  /**
   * Extrae el texto de `source`. Devuelve `null` cuando la fuente no contiene
   * capa de texto legible (p. ej. PDF escaneado): nunca inventa contenido.
   */
  extract(source: Source): Promise<RawDocument | null>;
}
