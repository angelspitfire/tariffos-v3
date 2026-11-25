/**
 * Terminal `dual`: dos rutas sostenibles con base legal distinta.
 *
 * Se presentan como par, sin ranking, sin candidato recomendado.
 * Bloqueada: P-C1 (casos duales reales de la experta).
 */

import type { Route } from './route.js';

export interface Dual {
  dual: true;
  routes: Route[];
}

/**
 * Comprueba si dos rutas forman un par dual: bases legales distintas.
 */
export function isDual(routeA: Route, routeB: Route): boolean {
  const basisA = routeA.steps.map((s) => s.legalBasis);
  const basisB = routeB.steps.map((s) => s.legalBasis);
  return JSON.stringify(basisA) !== JSON.stringify(basisB);
}

/**
 * Combina dos rutas en un par dual. No impone ranking entre ellas.
 */
export function combineDual(routeA: Route, routeB: Route): Dual {
  return { dual: true, routes: [routeA, routeB] };
}
