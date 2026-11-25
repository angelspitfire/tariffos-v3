/**
 * Adaptador único OpenAI-compatible para visión (F2-07).
 *
 * Configuración vía entorno: `VISION_BASE_URL`, `VISION_API_KEY`,
 * `VISION_MODEL`. Cambiar el proveedor no requiere tocar código. Temperatura
 * 0 y seed fijo para determinismo.
 */

import type { RawDocument } from '../../domain/intake.js';
import { VisionReader } from '../vision-reader.js';
import { TranscriptionSchema } from './validate.js';

const VISION_SEED = 4213;
const VISION_TEMPERATURE = 0;
const CHAT_COMPLETIONS_PATH = '/chat/completions';

function readEnv(): {
  baseUrl: string;
  apiKey: string | undefined;
  model: string;
} {
  const baseUrl = (process.env.VISION_BASE_URL ?? '').replace(/\/$/, '');
  const apiKey = process.env.VISION_API_KEY ?? undefined;
  const model = process.env.VISION_MODEL ?? 'gpt-4o-mini';
  return { baseUrl, apiKey, model };
}

export class OpenAIVisionAdapter implements VisionReader {
  async read(image: Uint8Array): Promise<RawDocument | null> {
    const { baseUrl, apiKey, model } = readEnv();
    if (!baseUrl) {
      throw new Error('VISION_BASE_URL no está configurado');
    }

    const payload = {
      model,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text:
                'Transcribe TODO el texto visible de esta página de documento. ' +
                'Devuelve SOLO un objeto JSON con las claves "text" (texto completo) ' +
                'y "regions" (array de {bbox: [x,y,w,h], text}). ' +
                'No inventes códigos arancelarios ni clasificaciones.',
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${toBase64(image)}`,
              },
            },
          ],
        },
      ],
      temperature: VISION_TEMPERATURE,
      seed: VISION_SEED,
      response_format: { type: 'json_object' },
    };

    const response = await fetch(`${baseUrl}${CHAT_COMPLETIONS_PATH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`vision provider respondió ${response.status}`);
    }

    const body = (await response.json()) as {
      choices?: Array<{ message?: { content?: string | null } }>;
    };
    const content = body.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || content.length === 0) {
      return null;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new Error('la visión no devolvió JSON válido');
    }

    const transcription = TranscriptionSchema.parse(parsed);

    return {
      source: { kind: 'text', ref: 'vision-page' },
      text: transcription.text,
      claims: [],
      reader: 'vision',
      readerModel: model,
      regions: transcription.regions ?? [],
    };
  }
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export { VISION_SEED, VISION_TEMPERATURE };
