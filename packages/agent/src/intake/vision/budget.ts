/**
 * Presupuesto medido de lectura por visión (F2-12).
 *
 * Configura `VISION_MAX_SECONDS_PER_PAGE` y `VISION_MAX_PAGES`. Los valores
 * se miden en la máquina objetivo y se configuran vía entorno. El tope se
 * aplica ANTES de llamar al modelo.
 */

export const ENV_MAX_SECONDS_PER_PAGE = 'VISION_MAX_SECONDS_PER_PAGE';
export const ENV_MAX_PAGES = 'VISION_MAX_PAGES';

export interface VisionBudget {
  maxSecondsPerPage: number | undefined;
  maxPages: number | undefined;
}

export function resolveBudget(): VisionBudget {
  return {
    maxSecondsPerPage: envPositiveSeconds(ENV_MAX_SECONDS_PER_PAGE),
    maxPages: envPositiveInt(ENV_MAX_PAGES),
  };
}

function envPositiveSeconds(name: string): number | undefined {
  const raw = process.env[name];
  if (!raw) return undefined;
  const v = Number(raw);
  return Number.isFinite(v) && v > 0 ? v : undefined;
}

function envPositiveInt(name: string): number | undefined {
  const raw = process.env[name];
  if (!raw) return undefined;
  const v = Number.parseInt(raw, 10);
  return Number.isFinite(v) && v > 0 ? v : undefined;
}

export class PageBudget {
  private pagesRead = 0;
  private lastPageSeconds = 0;

  constructor(private readonly budget: VisionBudget) {}

  /** Devuelve true solo si se puede leer otra página (antes de llamar al modelo). */
  canReadPage(): boolean {
    if (this.budget.maxPages !== undefined && this.pagesRead >= this.budget.maxPages) {
      return false;
    }
    if (
      this.budget.maxSecondsPerPage !== undefined &&
      this.lastPageSeconds >= this.budget.maxSecondsPerPage
    ) {
      return false;
    }
    return true;
  }

  /** Registra una página leída y los segundos que tardó. */
  recordPage(seconds: number): void {
    this.pagesRead++;
    this.lastPageSeconds = seconds;
  }

  get pagesReadCount(): number {
    return this.pagesRead;
  }
}

/**
 * Mide el tiempo de ejecución de una operación asíncrona en segundos.
 */
export async function measure<T>(fn: () => Promise<T>): Promise<{
  result: T;
  seconds: number;
}> {
  const start = Date.now();
  const result = await fn();
  const seconds = (Date.now() - start) / 1000;
  return { result, seconds };
}
