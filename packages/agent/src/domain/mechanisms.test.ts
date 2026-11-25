import { describe, expect, it } from 'vitest';

import {
  applyMechanisms,
  cite,
  override,
  prune,
  redirect,
  split,
  veto,
  type Mechanism,
  type MechanismContext,
} from './mechanism-effects.js';
import { applies, mechanismRank, noApplies } from './mechanisms.js';

const baseCtx: MechanismContext = {
  codes: ['390110', '390120'],
  exclusions: [],
  redirects: {},
  isDual: () => false,
};

describe('MECHANISM_PRECEDENCE', () => {
  it('orden: veto > override > redirect > prune > split > cite', () => {
    const order: Mechanism[] = ['veto', 'override', 'redirect', 'prune', 'split', 'cite'];
    for (let i = 0; i < order.length - 1; i++) {
      expect(mechanismRank(order[i])).toBeLessThan(mechanismRank(order[i + 1]));
    }
  });
});

describe('veto', () => {
  it('excluye códigos vetados y es terminal', () => {
    const ctx = { ...baseCtx, exclusions: ['39012'] };
    const effect = veto(ctx);
    expect(effect.codes).toEqual(['390110']);
    expect(effect.result.applies).toBe(true);
    expect(effect.result.terminal).toBe(true);
  });

  it('no aplica cuando no hay exclusiones', () => {
    const effect = veto(baseCtx);
    expect(effect.codes).toEqual(['390110', '390120']);
    expect(effect.result.applies).toBe(false);
  });
});

describe('override', () => {
  it('sustituye un código por otro', () => {
    const ctx = { ...baseCtx, redirects: { '390110': '390111' } };
    const effect = override(ctx);
    expect(effect.codes).toEqual(['390111', '390120']);
    expect(effect.result.applies).toBe(true);
  });

  it('no aplica sin redirecciones', () => {
    const effect = override(baseCtx);
    expect(effect.result.applies).toBe(false);
  });
});

describe('redirect', () => {
  it('reenvía un código a otro destino', () => {
    const ctx = { ...baseCtx, redirects: { '390110': '390111' } };
    const effect = redirect(ctx);
    expect(effect.codes).toEqual(['390111', '390120']);
    expect(effect.result.applies).toBe(true);
    expect(effect.result.terminal).toBe(false);
  });
});

describe('prune', () => {
  it('descarta códigos que no pasan la condición', () => {
    const ctx = { ...baseCtx };
    const effect = prune(ctx, (code) => code === '390110');
    expect(effect.codes).toEqual(['390110']);
    expect(effect.result.applies).toBe(true);
    expect(effect.result.terminal).toBe(false);
  });

  it('prune a cero es terminal (exclusión legal)', () => {
    const ctx = { ...baseCtx };
    const effect = prune(ctx, () => false);
    expect(effect.codes).toEqual([]);
    expect(effect.result.terminal).toBe(true);
  });
});

describe('split', () => {
  it('divide candidatos por grupos (RGI 3(b))', () => {
    const ctx = { ...baseCtx };
    const effect = split(ctx, [['390110'], ['390120']]);
    expect(effect.result.applies).toBe(true);
    expect(effect.result.mechanism).toBe('split');
  });

  it('no aplica con un solo grupo', () => {
    const ctx = { ...baseCtx };
    const effect = split(ctx, [['390110', '390120']]);
    expect(effect.result.applies).toBe(false);
  });
});

describe('cite', () => {
  it('adjunta cita sin transformar el conjunto', () => {
    const ctx = { ...baseCtx };
    const effect = cite(ctx, 'nota de capítulo 39');
    expect(effect.codes).toEqual(['390110', '390120']);
    expect(effect.result.applies).toBe(true);
    expect(effect.result.terminal).toBe(false);
  });
});

describe('noApplies / applies', () => {
  it('noApplies devuelve applies false', () => {
    expect(noApplies('veto')).toMatchObject({ applies: false, terminal: false });
  });

  it('applies devuelve applies true con regla', () => {
    expect(applies('veto', 'nota', true)).toMatchObject({
      applies: true,
      terminal: true,
      rule: 'nota',
    });
  });
});

describe('applyMechanisms', () => {
  it('aplica en orden de precedencia y se detiene en terminal', () => {
    const ctx = { ...baseCtx, exclusions: ['39012'] };
    const { effects, codes, terminal } = applyMechanisms(['390110', '390120'], ctx);
    expect(terminal).toBe(true);
    expect(codes).toEqual(['390110']);
    expect(effects[0].mechanism).toBe('veto');
  });

  it('veto detiene antes de override/redirect', () => {
    const ctx = {
      ...baseCtx,
      exclusions: ['39012'],
      redirects: { '390110': '390111' },
    };
    const { effects, codes } = applyMechanisms(['390110', '390120'], ctx);
    expect(codes).toEqual(['390110']);
    expect(effects.some((e) => e.mechanism === 'override')).toBe(false);
  });
});
