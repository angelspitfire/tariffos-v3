/**
 * Validación de salida del lector de visión (F2-10).
 *
 * La respuesta del modelo debe cumplir el esquema de transcripción. Se
 * permite un reintento ante fallo de esquema. Si falla, se devuelve el
 * estado `unreadable`: nunca texto parcial ni invenciones.
 */

import { z } from 'zod';
import type { RawDocument, Source } from '../../domain/intake.js';

export const TranscriptionSchema = z.object({
  text: z.string().min(1),
  regions: z
    .array(
      z.object({
        bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]),
        text: z.string(),
      }),
    )
    .optional(),
});

export type Transcription = z.infer<typeof TranscriptionSchema>;

/** Máximo de intentos de lectura del modelo (1 intento + 1 reintento). */
const MAX_ATTEMPTS = 2;

/**
 * Llama al modelo hasta `MAX_ATTEMPTS` veces obteniendo un JSON ya parseado.
 * Devuelve la transcripción validada o `null` si todos los intentos fallan.
 */
export async function validateWithRetry(
  fetchJson: () => Promise<unknown>,
): Promise<Transcription | null> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const raw = await fetchJson();
      return TranscriptionSchema.parse(raw);
    } catch {
      // se reintenta hasta agotar MAX_ATTEMPTS
    }
  }
  return null;
}

/**
 * Documento en estado `unreadable`: el lector no pudo producir texto fiable.
 * Nunca devuelve texto parcial ni vacío sin esta marca.
 */
export function unreadableDocument(
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
    unreadable: true,
  };
}
