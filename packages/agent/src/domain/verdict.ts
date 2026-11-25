/**
 * Niveles de confianza por señal estructural (margen, fan-out, nota aplicada,
 * precedente, ficha completa). Nunca usar la probabilidad que el modelo
 * declara sobre sí mismo.
 */
export type Confidence = 'firm' | 'arguable' | 'weak';

/**
 * Veredicto por candidato: sugerencia, no decisión. El usuario elige.
 * Restricciones y permisos se adjuntan a cada candidato como recomendación.
 */
export type Verdict = 'clear' | 'requires-permit' | 'prohibited';

export interface ConfidenceLevel {
  level: Confidence;
  /** Cuándo se aplica este nivel. */
  when: string;
  /** Qué se entrega en este nivel de confianza. */
  delivery: string;
}

export const CONFIDENCE_LEVELS: ConfidenceLevel[] = [
  {
    level: 'firm',
    when: 'Margen amplio, nota legal aplicada, ficha completa',
    delivery: '2: la recomendada y un control de sanidad',
  },
  {
    level: 'arguable',
    when: 'Margen corto, o falta un dato menor',
    delivery: '3–4, con una de otra rama',
  },
  {
    level: 'weak',
    when: 'Ficha incompleta o sin precedente que la sostenga',
    delivery: '5 y una pregunta antes de firmar',
  },
] as const;

/** Umbral de margen corto entre ganador y subcampeón (señal estructural). */
export const CLOSE_MARGIN_THRESHOLD = 0.05;

/** Número mínimo de candidatos en la shortlist (nunca truncar para decidir). */
export const MIN_CANDIDATES = 3;

/** Máximo de candidatos abiertos al inicio; el resto colapsado. */
export const OPEN_CANDIDATES = 3;
