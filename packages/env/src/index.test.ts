import { afterEach, describe, expect, it } from 'vitest';
import {
  assertEnv,
  DEFAULT_MODEL,
  llmModel,
  missingEnv,
  shouldValidateEnv,
  type EnvRequirement,
} from './index.js';
import { restoreEnv, stubEnv } from './stub-env.js';

afterEach(restoreEnv);

describe('missingEnv', () => {
  it('lists keys that are unset or blank', () => {
    stubEnv({ FOO_KEY: '', BAR_KEY: 'set' });
    expect(missingEnv([{ name: 'FOO_KEY' }, { name: 'BAR_KEY' }])).toEqual(['FOO_KEY']);
  });

  it('accepts any name in an altNames group', () => {
    stubEnv({ FOO_KEY: undefined, FOO_ALT: 'google-style' });
    expect(missingEnv([{ name: 'FOO_KEY', altNames: ['FOO_ALT'] }])).toEqual([]);
  });

  it('skips requirements whose when() is false', () => {
    stubEnv({ GATE_KEY: undefined });
    const reqs: EnvRequirement[] = [{ name: 'GATE_KEY', when: () => false }];
    expect(missingEnv(reqs)).toEqual([]);
  });
});

describe('assertEnv', () => {
  it('throws one readable error listing every missing key with its note', () => {
    stubEnv({ FOO_KEY: undefined, BAR_KEY: undefined });
    expect(() =>
      assertEnv('filings', [
        { name: 'FOO_KEY', note: 'always required' },
        { name: 'BAR_KEY', altNames: ['FOO_ALT'], note: 'insforge' },
        { name: 'GATE_KEY', when: () => false },
      ]),
    ).toThrow(
      '[filings] missing required environment variables: FOO_KEY — always required; ' +
        'BAR_KEY (or FOO_ALT) — insforge. See .env.example.',
    );
  });

  it('returns an empty list when nothing is missing', () => {
    stubEnv({ FOO_KEY: 'ok' });
    expect(assertEnv('web', [{ name: 'FOO_KEY' }])).toEqual([]);
  });
});

describe('llmModel', () => {
  it('defaults to the workspace model', () => {
    stubEnv({ LLM_MODEL: undefined });
    expect(llmModel()).toBe(DEFAULT_MODEL);
  });

  it('is overridable per deployment', () => {
    stubEnv({ LLM_MODEL: 'qwen3:8b' });
    expect(llmModel()).toBe('qwen3:8b');
  });

  it('treats a blank value as unset, so an empty var cannot pick the model', () => {
    stubEnv({ LLM_MODEL: '   ' });
    expect(llmModel()).toBe(DEFAULT_MODEL);
  });

  it('is read per call, not cached at module load', () => {
    stubEnv({ LLM_MODEL: 'qwen3:8b' });
    expect(llmModel()).toBe('qwen3:8b');
    stubEnv({ LLM_MODEL: 'qwen3:14b' });
    expect(llmModel()).toBe('qwen3:14b');
  });
});


describe('shouldValidateEnv', () => {
  it('is false under vitest', () => {
    expect(shouldValidateEnv()).toBe(false);
  });

  it('is false during the production build phase', () => {
    const prevVitest = process.env.VITEST;
    const prevPhase = process.env.NEXT_PHASE;
    delete process.env.VITEST;
    process.env.NEXT_PHASE = 'phase-production-build';
    try {
      expect(shouldValidateEnv()).toBe(false);
    } finally {
      if (prevVitest === undefined) delete process.env.VITEST;
      else process.env.VITEST = prevVitest;
      if (prevPhase === undefined) delete process.env.NEXT_PHASE;
      else process.env.NEXT_PHASE = prevPhase;
    }
  });

  it('is true on a normal server boot', () => {
    const prevVitest = process.env.VITEST;
    const prevPhase = process.env.NEXT_PHASE;
    delete process.env.VITEST;
    delete process.env.NEXT_PHASE;
    try {
      expect(shouldValidateEnv()).toBe(true);
    } finally {
      if (prevVitest === undefined) delete process.env.VITEST;
      else process.env.VITEST = prevVitest;
      if (prevPhase === undefined) delete process.env.NEXT_PHASE;
      else process.env.NEXT_PHASE = prevPhase;
    }
  });
});
