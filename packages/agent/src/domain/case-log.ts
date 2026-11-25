/**
 * Bitácora de casos fuera del dominio.
 *
 * El dominio no genera identificadores (no llama a randomUUID). La bitácora
 * se inyecta a través del puerto `CaseLog`. Esta implementación en memoria es
 * un doble de prueba; en producción se adapta a ClassificationSession (F4-05).
 */

import type { CaseLog } from './ports.js';
import type { DescentStep } from './route.js';

export interface CaseLogEntry {
  caseId: string;
  model: string;
  hash: string;
  route: DescentStep[];
}

export class InMemoryCaseLog implements CaseLog {
  private _entries: CaseLogEntry[] = [];

  async log(entry: {
    caseId: string;
    model: string;
    hash: string;
    route: DescentStep[];
  }): Promise<void> {
    this._entries.push({ ...entry });
  }

  get entries(): readonly CaseLogEntry[] {
    return this._entries;
  }

  clear(): void {
    this._entries = [];
  }

  last(): CaseLogEntry | undefined {
    return this._entries[this._entries.length - 1];
  }
}

export function createCaseLog(): InMemoryCaseLog {
  return new InMemoryCaseLog();
}
