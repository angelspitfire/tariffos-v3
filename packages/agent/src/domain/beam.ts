/**
 * Beam de descenso: ancho 2 por ruta.
 *
 * Cada ruta activa se expande de forma independiente. Se conserva el
 * ganador y el subcampeón **por ruta** (no de forma global). Las hojas
 * están protegidas: nunca se podan por el ancho del haz.
 */

import type { GoodsSheet } from './sheet.js';
import type { CompareResult, DecisionEngine, LegalCorpus, TariffTree } from './ports.js';
import type { Route } from './route.js';

export const BEAM_WIDTH = 2;

export interface BeamContext {
  sheet: GoodsSheet;
  tree: TariffTree;
  corpus: LegalCorpus;
  engine: DecisionEngine;
}

/**
 * Resultado de expandir una ruta en un nivel: las rutas hijas viables.
 * Siempre incluye al ganador y, cuando aplica, al subcampeón de esa ruta.
 */
export interface Expansion {
  routes: Route[];
  /** Si la ruta terminó porque el nodo es hoja o exclusión terminal. */
  terminal: boolean;
}

/**
 * Expands a route one level down the descent.
 *
 * - Gets the children of the current node.
 * - corpus.exclusions(node) filters before comparing (veto > prune).
 * - engine.compare(children, sheet) returns { winner, runnerUp, margin }.
 * - Keeps the winner and runner-up per route.
 * - Leaves are never pruned by beam width.
 */
export async function expand(
  route: Route,
  _level: number,
  ctx: BeamContext,
): Promise<Expansion> {
  const { sheet, tree, corpus, engine } = ctx;
  const last = route.steps[route.steps.length - 1];
  const code = last.code;

  // Leaf protection: a leaf is never pruned by beam width.
  if (tree.isLeaf(code)) {
    return { routes: [route], terminal: true };
  }

  const children = await tree.children(code);

  // Exclusions first (veto > prune): the corpus filters before comparing.
  const exclusions = await corpus.exclusions(code);
  const viable = children.filter((c) => !isExcluded(c, exclusions));

  if (viable.length === 0) {
    // Pruning to zero = legal exclusion with its rule, the route ends here.
    return { routes: [route], terminal: true };
  }

  // Viable leaves: all are protected, none is discarded by width.
  const leafChildren = viable.filter((c) => tree.isLeaf(c));
  const nonLeafChildren = viable.filter((c) => !tree.isLeaf(c));

  const routes: Route[] = [];

  for (const leaf of leafChildren) {
    routes.push(await advance(route, leaf, tree));
  }

  if (nonLeafChildren.length > 0) {
    const comparison: CompareResult = await engine.compare(nonLeafChildren, sheet);
    const winner = comparison.winner;
    routes.push(await advance(route, winner, tree));

    if (comparison.runnerUp) {
      routes.push(await advance(route, comparison.runnerUp, tree));
    }
  }

  return { routes, terminal: false };
}

async function advance(
  route: Route,
  code: string,
  tree: TariffTree,
): Promise<Route> {
  const description = await tree.description(code);
  return {
    steps: [
      ...route.steps,
      {
        code,
        level: tree.level(code),
        scope: description,
        instrument: 'rgi-6',
        legalBasis: 'comparación de hermanos (RGI 6)',
      },
    ],
  };
}

function isExcluded(code: string, exclusions: string[]): boolean {
  const d = digits(code);
  return exclusions.some((e) => d.startsWith(digits(e)));
}

function digits(code: string): string {
  return code.replace(/[^0-9]/g, '');
}
