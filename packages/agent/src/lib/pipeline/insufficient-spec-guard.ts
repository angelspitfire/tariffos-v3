import { formatHsCode } from '@tariffos/shared-types';
import { buildMerceologicalSheet } from './merceological-hitl.js';
import { hasRichAttachedSpecs } from './orchestrator-helpers.js';
import type { InvoiceItemInput, RgiModelOutput, TariffCandidateRecord } from './types.js';

const INSUFFICIENT_SPEC_CONFIDENCE_CAP = 68;
export const INSUFFICIENT_SPEC_SOURCE = 'Insufficient Technical Specs';

/**
 * Deterministic anti-hallucination guard (Audit Test 3):
 * When an unverified commercial description lacks critical merceological attributes
 * (material, operating principle, composition) AND multiple sibling 6-digit subheadings
 * compete under the same 4-digit heading without web/broker confirmation, prevent the
 * LLM from claiming High (>=85%) certainty on a single 10-digit code.
 */
export function applyInsufficientSpecGuard(
  item: InvoiceItemInput,
  rgi: RgiModelOutput,
  candidates: TariffCandidateRecord[],
  webContext?: string,
): RgiModelOutput {
  if (webContext || item.brokerNote?.trim() || hasRichAttachedSpecs(item.description)) {
    return rgi;
  }

  const chosenDigits = rgi.hsCode.replace(/\D/g, '');
  const heading4 = chosenDigits.slice(0, 4);
  if (heading4.length < 4) return rgi;

  const sameHeadingCandidates = candidates.filter(
    (c) => c.hsCode.replace(/\D/g, '').slice(0, 4) === heading4,
  );
  const distinctSubheadings6 = new Set(
    sameHeadingCandidates.map((c) => c.hsCode.replace(/\D/g, '').slice(0, 6)).filter((s) => s.length === 6),
  );
  if (distinctSubheadings6.size < 2) {
    return rgi;
  }

  const sheet = buildMerceologicalSheet({ description: item.description });
  const criticalFilled = sheet.attributes.filter(
    (a) => a.critical && a.provenance !== 'missing' && a.value.trim().length > 0,
  );
  if (criticalFilled.length >= 2) {
    return rgi;
  }

  const cappedPct = Math.min(rgi.confidencePct, INSUFFICIENT_SPEC_CONFIDENCE_CAP);
  const existingAltCodes = new Set(rgi.alternatives.map((a) => a.code.replace(/\D/g, '')));
  existingAltCodes.add(chosenDigits);

  const injectedAlternatives = sameHeadingCandidates
    .filter((c) => !existingAltCodes.has(c.hsCode.replace(/\D/g, '')))
    .slice(0, 3)
    .map((c) => ({
      code: formatHsCode(c.hsCode),
      desc: c.description,
      confLevel: 'medio' as const,
      confPct: 55,
      whyApply: `Subpartida candidata dentro de la partida ${heading4.slice(0, 2)}.${heading4.slice(2)} pendiente de atributos técnicos.`,
      whyNot: 'Faltan especificaciones técnicas del fabricante/proveedor en el documento.',
    }));

  const missingLabels = sheet.attributes
    .filter((a) => a.critical && a.provenance === 'missing')
    .map((a) => a.label.toLowerCase());
  const questionText =
    missingLabels.length > 0
      ? `Solicitar al proveedor ficha técnica que confirme ${missingLabels.join(', ')} para definir subpartida exacta dentro de la partida ${heading4.slice(0, 2)}.${heading4.slice(2)}.`
      : `Solicitar al proveedor ficha técnica (material constitutivo y principio de accionamiento) para desempatar la partida ${heading4.slice(0, 2)}.${heading4.slice(2)}.`;

  return {
    ...rgi,
    confidenceLevel: cappedPct < 60 ? 'Bajo' : 'Medio',
    confidencePct: cappedPct,
    alternatives: [...rgi.alternatives, ...injectedAlternatives],
    unresolved: [
      ...rgi.unresolved,
      {
        item: questionText,
        source: INSUFFICIENT_SPEC_SOURCE,
        resolved: false,
      },
    ],
  };
}
