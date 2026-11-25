/**
 * Núcleo del descenso: siete estaciones en orden.
 *
 * 1. Compuerta: ficha incompleta → { question, missing } (sin lanzar).
 * 2. Perfil de país: declara la profundidad terminal.
 * 3. Exclusiones primero: notas de sección/capítulo antes de cualquier búsqueda.
 * 4. Descenso por haz (beam) nivel a nivel.
 * 5. Terminal: profundidad declarada por el perfil.
 * 6. Shortlist completa, sin truncación.
 * 7. Bitácora mediante `CaseLog` inyectado (sin randomUUID en el dominio).
 *
 * No conoce Prisma, Laya, ni UI. Todo entra y sale por puertos.
 */

import type { ClassifyLine, ClassifyResult, ClassifyCandidate } from './classify-line.js';
import { CountryProfile } from './profile.js';
import { GoodsSheet } from './sheet.js';
import type {
  TariffTree,
  LegalCorpus,
  DecisionEngine,
  VerdictRules,
  CaseLog,
} from './ports.js';
import { expand, type BeamContext } from './beam.js';
import { gateByImpact, type GateResult } from './gate.js';
import type { Route } from './route.js';

export function createDescentEngine(input: {
  tariffTree: TariffTree;
  legalCorpus: LegalCorpus;
  decisionEngine: DecisionEngine;
  verdictRules: VerdictRules;
  caseLog: CaseLog;
}): ClassifyLine {
  const { tariffTree, legalCorpus, decisionEngine, verdictRules, caseLog } = input;

  async function classify(
    sheet: GoodsSheet,
    profile: CountryProfile,
  ): Promise<ClassifyResult> {
    // Station 1: gate — incomplete record does not descend (does not throw).
    const gate: GateResult = gateByImpact(sheet);
    if (gate.missing.length > 0 || hasMaterialConflict(gate.conflicts)) {
      return {
        candidates: [],
        askedQuestion: `Missing data or unresolved conflicts: ${gate.missing.join(', ')}`,
      };
    }

    // Station 2: country profile declares the terminal depth.
    const terminalDepth = profile.terminal;

    // Station 3: exclusions first at chapter level.
    const chapter = chapterOf(sheet);
    const chapterExclusions = await legalCorpus.exclusions(chapter);
    if (chapterExclusions.length > 0) {
      return {
        candidates: [],
        askedQuestion: `Legal exclusion for chapter ${chapter}: ${chapterExclusions.join('; ')}`,
      };
    }

    // Station 4-5: beam descent level by level until terminal depth.
    const rootRoute: Route = {
      steps: [
        {
          code: chapter,
          level: 2,
          scope: `chapter ${chapter}`,
          instrument: 'grl',
          legalBasis: 'RGI 1',
        },
      ],
    };

    let active: Route[] = [rootRoute];
    for (const level of profile.levels) {
      const next: Route[] = [];
      const ctx: BeamContext = {
        sheet,
        tree: tariffTree,
        corpus: legalCorpus,
        engine: decisionEngine,
      };
      for (const route of active) {
        const expansion = await expand(route, level, ctx);
        next.push(...expansion.routes);
      }
      active = next;
      if (active.length === 0) break;
    }

    // Station 6: complete shortlist — leaves at terminal depth, no truncation.
    const candidates: ClassifyCandidate[] = [];
    for (const route of active) {
      const code = route.steps[route.steps.length - 1].code;
      if (!tariffTree.isLeaf(code)) continue;
      if (digits(code).length !== terminalDepth) continue;

      const verdict = await verdictRules.verdict(code);
      candidates.push({
        code,
        recommended: candidates.length === 0,
        confidence: 'firm',
        route: route.steps,
        verdict,
      });
    }

    // Station 7: bitácora mediante puerto inyectado (sin randomUUID en el dominio).
    // Log every active route's trace, not just the first one.
    for (const route of active) {
      await caseLog.log({
        caseId: 'pending-external-id',
        model: 'descent-engine-v2',
        hash: '',
        route: route.steps,
      });
    }

    return { candidates };
  }

  return { classify };
}

function hasMaterialConflict(conflicts: { type: string }[]): boolean {
  return conflicts.some((c) => c.type === 'material');
}

function chapterOf(sheet: GoodsSheet): string {
  return digits(sheet.what.value).slice(0, 2);
}

function digits(code: string): string {
  return code.replace(/[^0-9]/g, '');
}
