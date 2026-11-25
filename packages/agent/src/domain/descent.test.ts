import { describe, expect, it } from 'vitest';

import { createDescentEngine } from './descent.js';
import type { ClassifyLine } from './classify-line.js';
import type { GoodsSheet, SheetField } from './sheet.js';
import type { TariffTree, LegalCorpus, DecisionEngine, VerdictRules, CaseLog } from './ports.js';
import type { CountryProfile } from './profile.js';
import type { CaseLogEntry } from './case-log.js';

function field(
  method: 'declared' | 'absent' = 'declared',
  value = 'camisa de algodón',
): SheetField {
  return { value, unit: null, source: null, method };
}

function completeSheet(): GoodsSheet {
  return {
    what: field('declared', '3901101010'),
    madeOf: field('declared', 'algodón'),
    howMade: field('declared', 'tejido'),
    purpose: field('declared', 'vestir'),
    presentation: field('declared', 'bolsa'),
  };
}

function incompleteSheet(): GoodsSheet {
  return {
    what: field('declared', '3901101010'),
    madeOf: field('absent'),
    howMade: field('absent'),
    purpose: field('absent'),
    presentation: field('absent'),
  };
}

function tree(path: Record<string, string[]>, leaves: Set<string>): TariffTree {
  return {
    children: async (code: string): Promise<string[]> => path[code] ?? [],
    isLeaf: (code: string): boolean => leaves.has(code),
    description: async (code: string): Promise<string> => `desc ${code}`,
    level: (code: string): 2 | 4 | 6 | 7 | 8 | 9 | 10 => code.length as 2 | 4 | 6 | 7 | 8 | 9 | 10,
  };
}

function corpus(exclusions: Record<string, string[]>): LegalCorpus {
  return {
    exclusions: async (code: string): Promise<string[]> => exclusions[code] ?? [],
    redirects: async () => [],
    precedents: async () => [],
  };
}

function makeEngine(): DecisionEngine {
  return {
    split: async () => [],
    compare: async (siblings: string[]) => ({
      winner: siblings[0],
      runnerUp: siblings[1],
      margin: 0.5,
    }),
  };
}

function verdictRules(result: 'clear' | 'requires-permit' | 'prohibited'): VerdictRules {
  return { verdict: async () => result };
}

const veProfile: CountryProfile = {
  code: 'VE',
  levels: [2, 4, 6, 7, 8, 9, 10],
  terminal: 10,
  chapters: new Map([['98', { noSaSubheading: true }]]),
};

function makeCaseLog(): CaseLog & { last: CaseLogEntry | undefined } {
  let last: CaseLogEntry | undefined;
  const instance = {
    log: async (entry: CaseLogEntry): Promise<void> => {
      last = entry;
    },
    get last() {
      return last;
    },
  };
  return instance;
}

describe('createDescentEngine — siete estaciones', () => {
  it('Estación 1: ficha incompleta → { question, missing }, sin lanzar', async () => {
    const engine: ClassifyLine = createDescentEngine({
      tariffTree: tree({}, new Set()),
      legalCorpus: corpus({}),
      decisionEngine: makeEngine(),
      verdictRules: verdictRules('clear'),
      caseLog: makeCaseLog(),
    });

    const result = await engine.classify(incompleteSheet(), veProfile);

    expect(result.candidates).toHaveLength(0);
    expect(result.askedQuestion).toBeDefined();
  });

  it('Estación 2 + 3: perfil y exclusiones del capítulo antes de buscar', async () => {
    const engine: ClassifyLine = createDescentEngine({
      tariffTree: tree({}, new Set()),
      legalCorpus: corpus({ '39': ['nota de capítulo'] }),
      decisionEngine: makeEngine(),
      verdictRules: verdictRules('clear'),
      caseLog: makeCaseLog(),
    });

    const result = await engine.classify(completeSheet(), veProfile);

    expect(result.candidates).toHaveLength(0);
    expect(result.askedQuestion).toContain('Legal exclusion for chapter 39');
  });

  it('Estación 4-6: descenso por haz, terminal a profundidad 10, shortlist sin truncar', async () => {
    const path: Record<string, string[]> = {
      '39': ['3901'],
      '3901': ['390110'],
      '390110': ['3901101'],
      '3901101': ['39011010'],
      '39011010': ['390110101'],
      '390110101': ['3901101010'],
    };
    const leaves = new Set(['3901101010']);

    const caseLog = makeCaseLog();
    const engine: ClassifyLine = createDescentEngine({
      tariffTree: tree(path, leaves),
      legalCorpus: corpus({}),
      decisionEngine: makeEngine(),
      verdictRules: verdictRules('clear'),
      caseLog,
    });

    const result = await engine.classify(completeSheet(), veProfile);

    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0].code).toBe('3901101010');
    expect(result.candidates[0].route).toHaveLength(7);
    expect(result.candidates[0].verdict).toBe('clear');
  });

  it('Estación 7: bitácora vía puerto inyectado, sin randomUUID en el dominio', async () => {
    const path: Record<string, string[]> = {
      '39': ['3901'],
      '3901': ['390110'],
      '390110': ['3901101'],
      '3901101': ['39011010'],
      '39011010': ['390110101'],
      '390110101': ['3901101010'],
    };
    const leaves = new Set(['3901101010']);
    const caseLog = makeCaseLog();

    const engine: ClassifyLine = createDescentEngine({
      tariffTree: tree(path, leaves),
      legalCorpus: corpus({}),
      decisionEngine: makeEngine(),
      verdictRules: verdictRules('clear'),
      caseLog,
    });

    await engine.classify(completeSheet(), veProfile);

    expect(caseLog.last).toBeDefined();
    expect(caseLog.last!.caseId).toBe('pending-external-id');
    expect(caseLog.last!.model).toBe('descent-engine-v2');
  });
});
