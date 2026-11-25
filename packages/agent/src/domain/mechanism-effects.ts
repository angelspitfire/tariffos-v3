/**
 * Mecanismos como funciones que transforman el conjunto de candidatos.
 * Cada función recibe un contexto y devuelve el conjunto transformado
 * junto con el efecto aplicado. Se aplican en secuencia (mechanisms.ts
 * define el orden de precedencia).
 */

import { z } from 'zod';
import { noApplies, applies, type MechanismResult } from './mechanisms.js';

export type Mechanism = 'veto' | 'override' | 'redirect' | 'prune' | 'split' | 'cite';

/**
 * Conjunto de candidatos y el efecto de aplicar un mecanismo.
 */
export interface MechanismEffect {
  mechanism: Mechanism;
  result: MechanismResult;
  codes: string[];
}

/**
 * Contexto mínimo que necesita cada mecanismo para decidir.
 */
export interface MechanismContext {
  /** Códigos candidatos actuales. */
  codes: string[];
  /** Reglas de exclusión aplicables (veto/prune). */
  exclusions: string[];
  /** Redirecciones aplicables. */
  redirects: Record<string, string>;
  /** ¿El código tiene base legal diferente (dual)? */
  isDual: (code: string) => boolean;
}

/**
 * Veto: excluye códigos por nota de sección/capítulo. Es terminal.
 */
export function veto(ctx: MechanismContext): MechanismEffect {
  const surviving = ctx.codes.filter(
    (code) => !ctx.exclusions.some((e) => digits(code).startsWith(digits(e))),
  );
  const result = surviving.length < ctx.codes.length
    ? applies('veto', 'nota de sección/capítulo', true)
    : noApplies('veto');
  return { mechanism: 'veto', result, codes: surviving };
}

/**
 * Override: sustituye un código por otro por norma superior.
 */
export function override(ctx: MechanismContext): MechanismEffect {
  const next = [...ctx.codes];
  let changed = false;
  for (const [from, to] of Object.entries(ctx.redirects)) {
    const idx = next.indexOf(from);
    if (idx !== -1) {
      next[idx] = to;
      changed = true;
    }
  }
  const result = changed
    ? applies('override', 'norma superior', false)
    : noApplies('override');
  return { mechanism: 'override', result, codes: next };
}

/**
 * Redirect: reenvía un código a otro destino (no terminal).
 */
export function redirect(ctx: MechanismContext): MechanismEffect {
  const next = [...ctx.codes];
  let redirected = false;
  for (const [from, to] of Object.entries(ctx.redirects)) {
    const idx = next.indexOf(from);
    if (idx !== -1) {
      next[idx] = to;
      redirected = true;
    }
  }
  const result = redirected
    ? applies('redirect', 'nota de redirección', false)
    : noApplies('redirect');
  return { mechanism: 'redirect', result, codes: next };
}

/**
 * Prune: descarta códigos que no pasan una condición. Puede quedar en cero.
 */
export function prune(ctx: MechanismContext, keep: (code: string) => boolean): MechanismEffect {
  const surviving = ctx.codes.filter(keep);
  const result =
    surviving.length === 0
      ? applies('prune', 'exclusión legal', true)
      : surviving.length < ctx.codes.length
        ? applies('prune', 'exclusión legal', false)
        : noApplies('prune');
  return { mechanism: 'prune', result, codes: surviving };
}

/**
 * Split: divide candidatos por carácter esencial (RGI 3(b)).
 */
export function split(ctx: MechanismContext, groups: string[][]): MechanismEffect {
  const flat = groups.flat();
  const kept = ctx.codes.filter((code) => flat.includes(code));
  const result = groups.length > 1 ? applies('split', 'RGI 3(b)', false) : noApplies('split');
  return { mechanism: 'split', result, codes: kept };
}

/**
 * Cite: adjunta cita legal a cada candidato (no transforma el conjunto).
 */
export function cite(ctx: MechanismContext, citation: string): MechanismEffect {
  const result = applies('cite', citation, false);
  return { mechanism: 'cite', result, codes: [...ctx.codes] };
}

function digits(code: string): string {
  return code.replace(/[^0-9]/g, '');
}

/**
 * Aplica los mecanismos en orden de precedencia:
 * veto > override > redirect > prune > split > cite.
 *
 * Devuelve el conjunto final de candidatos y la lista de efectos aplicados.
 * Se detiene en el primer mecanismo terminal (veto/prune a cero).
 */
export function applyMechanisms(
  initial: string[],
  ctx: MechanismContext,
): { effects: MechanismEffect[]; codes: string[]; terminal: boolean } {
  const registry: Record<Mechanism, (ctx: MechanismContext) => MechanismEffect> = {
    veto,
    override,
    redirect,
    prune: (c) => prune(c, () => true),
    split: (c) => split(c, []),
    cite: (c) => cite(c, ''),
  };

  let codes = [...initial];
  const effects: MechanismEffect[] = [];
  let terminal = false;

  const sequence: Mechanism[] = ['veto', 'override', 'redirect', 'prune', 'split', 'cite'];

  for (const mechanism of sequence) {
    const effect = registry[mechanism]({ ...ctx, codes });
    effects.push(effect);
    codes = effect.codes;
    if (effect.result.terminal) {
      terminal = true;
      break;
    }
    if (codes.length === 0) {
      terminal = true;
      break;
    }
  }

  return { effects, codes, terminal };
}

export const MechanismEffectSchema = z.object({
  mechanism: z.enum([
    'veto',
    'override',
    'redirect',
    'prune',
    'split',
    'cite',
  ]),
  result: z.object({
    mechanism: z.enum([
      'veto',
      'override',
      'redirect',
      'prune',
      'split',
      'cite',
    ]),
    applies: z.boolean(),
    terminal: z.boolean(),
    rule: z.string().optional(),
    redirectTo: z.string().optional(),
  }),
  codes: z.array(z.string()),
});
