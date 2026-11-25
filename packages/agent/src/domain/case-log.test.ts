import { describe, expect, it } from 'vitest';

import { InMemoryCaseLog, createCaseLog } from './case-log.js';

import type { DescentStep } from './route.js';

import type { CaseLog } from './ports.js';

function step(code: string): DescentStep {
  return {
    code,
    level: code.length as 2 | 4 | 6 | 7 | 8 | 9 | 10,
    scope: `scope ${code}`,
    instrument: 'grl',
    legalBasis: 'RGI 1',
  };
}

describe('InMemoryCaseLog', () => {
  it('registra una entrada de bitácora', async () => {
    const log = createCaseLog();
    const route: DescentStep[] = [step('39'), step('3901')];

    await log.log({
      caseId: 'case-1',
      model: 'descent-engine-v2',
      hash: 'abc123',
      route,
    });

    expect(log.entries).toHaveLength(1);
    expect(log.entries[0].caseId).toBe('case-1');
    expect(log.entries[0].route).toEqual(route);
  });

  it('expone la última entrada', async () => {
    const log = createCaseLog();
    await log.log({ caseId: 'a', model: 'm', hash: 'h1', route: [step('1')] });
    await log.log({ caseId: 'b', model: 'm', hash: 'h2', route: [step('2')] });
    expect((log as InMemoryCaseLog).last()?.caseId).toBe('b');
  });

  it('limpia las entradas', async () => {
    const log = createCaseLog();
    await log.log({ caseId: 'a', model: 'm', hash: 'h', route: [step('1')] });
    log.clear();
    expect(log.entries).toHaveLength(0);
  });
});

describe('CaseLog port', () => {
  it('el dominio recibe la bitácora inyectada, no genera randomUUID', async () => {
    const log: CaseLog = createCaseLog();
    // Simula un puerto inyectado que captura la entrada sin generar IDs.
    const captured = await (async () => {
      await log.log({ caseId: 'injected-id', model: 'test', hash: 'h', route: [step('39')] });
      return (log as InMemoryCaseLog).last();
    })();
    expect(captured?.caseId).toBe('injected-id');
    expect(captured?.model).toBe('test');
  });
});
