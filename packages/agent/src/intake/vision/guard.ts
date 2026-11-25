/**
 * Guardas de arranque y de salida del lector de visión (F2-08, F2-11).
 *
 * 1. Arranque: en despliegue, `VISION_BASE_URL` no puede apuntar a loopback
 *    (127.0.0.1, localhost, ::1). No se permiten modelos locales en producción.
 * 2. Salida: el lector de visión nunca debe emitir códigos arancelarios
 *    (patrones de 4+ dígitos). Cualquier coincidencia se rechaza.
 */

const LOOPBACK_HOSTS: string[] = ['localhost', '127.0.0.1', '::1', '0.0.0.0'];

/** Códigos arancelarios: 4+ dígitos, opcionalmente con grupos .NN (ej. 8708.29.00.00). */
export const TARIFF_CODE_PATTERN = /\b\d{4}(?:\.\d{2}){0,3}\b/;

export function isLoopbackHost(host: string): boolean {
  const lower = host.replace(/^\[|\]$/g, '').toLowerCase();
  return LOOPBACK_HOSTS.includes(lower) || lower.endsWith('.local');
}

export function isLoopbackUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return isLoopbackHost(parsed.hostname);
  } catch {
    return false;
  }
}

export function isDeployed(): boolean {
  return process.env.DEPLOYED === 'true' || process.env.NODE_ENV === 'production';
}

/**
 * Comprueba que el arranque no use un modelo local en despliegue.
 * Lanza con un mensaje explícito si falla.
 */
export function assertProductionSafe(baseUrl: string): void {
  if (isDeployed() && isLoopbackUrl(baseUrl)) {
    throw new Error(
      'VISION_BASE_URL apunta a un endpoint de bucle (loopback) en despliegue. ' +
        'No se permiten modelos locales en producción. Configure VISION_BASE_URL ' +
        'a un endpoint remoto (p. ej. OpenRouter).',
    );
  }
}

/**
 * Rechaza cualquier texto del lector que contenga un código arancelario.
 * El lector transcribe; nunca clasifica ni emite partidas de 4+ dígitos.
 */
export function assertNoTariffCodes(text: string): void {
  const matches = text.match(TARIFF_CODE_PATTERN);
  if (matches && matches.length > 0) {
    throw new Error(
      `el lector de visión emitió códigos arancelarios prohibidos: ${matches.join(', ')}`,
    );
  }
}
