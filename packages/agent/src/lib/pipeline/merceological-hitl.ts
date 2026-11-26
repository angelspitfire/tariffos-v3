import {
  A2UIMerceologicalSheetSchema,
  ClassificationDecisionContractSchema,
  type A2UIMerceologicalSheet,
  type AttributeProvenance,
  type ClassificationDecisionContract,
  type ClassificationWorkflowState,
  type GroundingSource,
  type HitlClarifyingQuestion,
  type HitlTentativeProposal,
  type MerceologicalAttribute,
  type MerceologicalAttributeKey,
} from '@tariffos/shared-types';
import {
  CANONICAL_MERCEOLOGICAL_ATTRIBUTES,
  computeMerceologicalConfidence,
  isMissingAttributeText,
} from './merceological-specs.js';

export { CANONICAL_MERCEOLOGICAL_ATTRIBUTES, computeMerceologicalConfidence };
export const HITL_CONFIDENCE_THRESHOLD = 75;

const TEXT_EXTRACTORS: Array<[MerceologicalAttributeKey, RegExp]> = [
  ['naturaleza_materia', /\b(acero(?:\s+inoxidable)?|aluminio|cobre|bronce|lat[oó]n|hierro|titanio|pl[aá]stico|policarbonato|polipropileno|polietileno|pvc|abs|silicona|caucho|vidrio|cer[aá]mica|madera|cart[oó]n|papel|algod[oó]n|poli[eé]ster|nylon|cuero|litio|aleaci[oó]n)\b/i],
  ['composicion', /\b(\d{1,3}\s*%\s*[a-záéíóúñ]+(?:\s*(?:,|y|\/)\s*\d{1,3}\s*%\s*[a-záéíóúñ]+)*|100\s*%\s*[a-záéíóúñ]+|aisi\s*\d{3,4}[a-z]?|grado\s+alimenticio)\b/i],
  ['funcion_uso', /\b(para\s+[a-záéíóúñ\s]{4,45}|uso\s+(?:industrial|m[eé]dico|dom[eé]stico|comercial|agr[ií]cola|automotriz|alimenticio|el[eé]ctrico)|ensamblaje|bombeo|medici[oó]n|transmisi[oó]n|filtraci[oó]n|protecci[oó]n|control|monitoreo|corte|soldadura|embalaje)\b/i],
  ['principio_funcionamiento', /\b(el[eé]ctric[oa]|electr[oó]nic[oa]|trif[aá]sic[oa]|monof[aá]sic[oa]|hidr[aá]ulic[oa]|neum[aá]tic[oa]|mec[aá]nic[oa]|manual|autom[aá]tic[oa]|centr[ií]fug[oa]|[oó]ptic[oa]|digital|inal[aá]mbric[oa]|solar|combusti[oó]n|inducci[oó]n)\b/i],
  ['estado_elaboracion', /\b(terminad[oa]|acabado|ensamblado|semielaborado|en\s+bruto|laminado|forjado|fundido|moldeado|nuevo|usado|remanufacturado)\b/i],
  ['presentacion', /\b(caja(?:s)?(?:\s+de\s+\d+\s*\w*)?|bl[ií]ster|bolsa(?:s)?|saco(?:s)?|tambor(?:es)?|bobina(?:s)?|rollo(?:s)?|frasco(?:s)?|botella(?:s)?|pallet|granel|retail|set\s+de\s+\d+|kit\s+de\s+\d+|paquete(?:s)?)\b/i],
];
const TECH_SPECS_PATTERN =
  /\b(\d+(?:[.,]\d+)?\s*(?:v|vac|vdc|kv|w|kw|mw|hp|a|ma|mah|wh|hz|khz|mhz|ghz|kg|g|mg|lb|ton|l|ml|cm|mm|m|in|pulgadas|bar|psi|rpm|gb|tb|mp|ip\d{2}|awg)\b|wi-?fi|bluetooth|gps|4g|5g|nfc|rosca\s+[a-z0-9x.-]+|aisi\s*\d+|iso\s*\d+)\b/gi;

export interface AttributeOverrideEntry {
  value: string;
  provenance?: AttributeProvenance;
  sourceNote?: string;
  sourceUri?: string;
}

export interface BuildMerceologicalSheetInput {
  id?: string;
  description: string;
  productName?: string;
  brandModel?: string;
  technicalSpecs?: Array<{ key: string; value: string }>;
  attributesOverride?: Partial<Record<MerceologicalAttributeKey, AttributeOverrideEntry>>;
  webSources?: GroundingSource[];
  webSearchTriggered?: boolean;
  webSearchReason?: string;
  competingCandidatesCount?: number;
  confirmedByUser?: boolean;
}

function extractDetectedFromText(text: string): Partial<Record<MerceologicalAttributeKey, string>> {
  const detected: Partial<Record<MerceologicalAttributeKey, string>> = {};
  for (const [key, pattern] of TEXT_EXTRACTORS) {
    const val = text.match(pattern)?.[0].trim();
    if (val) detected[key] = val;
  }
  const specs = Array.from(new Set(Array.from(text.matchAll(TECH_SPECS_PATTERN)).map((m) => m[0].trim()))).slice(0, 6);
  if (specs.length > 0) detected.especificaciones_tecnicas = specs.join(' · ');
  return detected;
}

export function buildMerceologicalSheet(input: BuildMerceologicalSheetInput): A2UIMerceologicalSheet {
  const text = input.description.trim();
  const detected = extractDetectedFromText(text);
  for (const sp of input.technicalSpecs ?? []) {
    if (!sp.key.trim() || isMissingAttributeText(sp.value)) continue;
    for (const spec of CANONICAL_MERCEOLOGICAL_ATTRIBUTES) {
      if (spec.keyAliases.some((rx) => rx.test(sp.key)) && !detected[spec.key]) detected[spec.key] = sp.value.trim();
    }
  }

  const attributes: MerceologicalAttribute[] = CANONICAL_MERCEOLOGICAL_ATTRIBUTES.map((spec) => {
    const override = input.attributesOverride?.[spec.key];
    if (override && !isMissingAttributeText(override.value)) {
      return {
        key: spec.key,
        label: spec.label,
        category: spec.category,
        value: override.value.trim(),
        provenance: override.provenance ?? 'user_input',
        weight: spec.weight,
        critical: spec.critical,
        placeholder: spec.placeholder,
        ...(override.sourceNote ? { sourceNote: override.sourceNote } : {}),
        ...(override.sourceUri ? { sourceUri: override.sourceUri } : {}),
      };
    }
    const detectedVal = detected[spec.key] ?? '';
    const hasVal = !isMissingAttributeText(detectedVal);
    return {
      key: spec.key,
      label: spec.label,
      category: spec.category,
      value: hasVal ? detectedVal : '',
      provenance: hasVal ? 'user_input' : 'missing',
      weight: spec.weight,
      critical: spec.critical,
      placeholder: spec.placeholder,
    };
  });

  const missingCritical = attributes.filter((a) => a.critical && a.provenance === 'missing');
  const confidenceBreakdown = computeMerceologicalConfidence(attributes, {
    competingCandidatesCount: input.competingCandidatesCount,
    confirmedByUser: input.confirmedByUser,
  });
  const webSources = input.webSources ?? [];
  const webSearchTriggered = Boolean(input.webSearchTriggered ?? webSources.length > 0);
  const productName = (input.productName?.trim() || text.slice(0, 120) || 'Mercancía por analizar').slice(0, 140);

  return A2UIMerceologicalSheetSchema.parse({
    id: input.id ?? `sheet-${Date.now()}`,
    productName,
    ...(input.brandModel ? { brandModel: input.brandModel } : {}),
    summary: text.slice(0, 260) || productName,
    attributes,
    missingCriticalKeys: missingCritical.map((a) => a.key),
    missingCriticalLabels: missingCritical.map((a) => a.label),
    webSearchTriggered,
    webSearchReason: input.webSearchReason ??
      (webSearchTriggered ? 'Especificaciones enriquecidas mediante búsqueda web.' : 'Evaluación merceológica a partir de la descripción ingresada.'),
    ...(webSources.length > 0 ? { webSources } : {}),
    confidenceBreakdown,
    ...(input.confirmedByUser ? { confirmedByUser: true } : {}),
    updatedAt: new Date().toISOString(),
  });
}

export interface HitlGateInput {
  sheet: A2UIMerceologicalSheet;
  confidencePct?: number;
  confidenceThreshold?: number;
  topCandidate?: HitlTentativeProposal;
  mode?: 'individual' | 'batch';
}

export interface HitlGateResult {
  needsInput: boolean;
  workflowState: ClassificationWorkflowState;
  reason: string;
  missingCriticalFields: string[];
  clarifyingQuestions: HitlClarifyingQuestion[];
  tentativeProposal?: HitlTentativeProposal;
  decision: ClassificationDecisionContract;
}

export function evaluateHitlGate(input: HitlGateInput): HitlGateResult {
  const threshold = input.confidenceThreshold ?? HITL_CONFIDENCE_THRESHOLD;
  const confidencePct = input.confidencePct ?? input.sheet.confidenceBreakdown.finalScore;
  const missingKeys = input.sheet.confirmedByUser ? [] : input.sheet.missingCriticalKeys;
  const missingCriticalFields = input.sheet.confirmedByUser ? [] : input.sheet.missingCriticalLabels;
  const clarifyingQuestions: HitlClarifyingQuestion[] = missingKeys.map((key) => {
    const spec = CANONICAL_MERCEOLOGICAL_ATTRIBUTES.find((s) => s.key === key);
    return {
      id: `q-${key}`,
      fieldKey: key,
      question: spec?.questionPrompt ?? `Confirmar atributo: ${key}`,
      inputType: spec?.suggestedOptions ? 'select' : 'text',
      ...(spec?.suggestedOptions ? { options: spec.suggestedOptions } : {}),
      placeholder: spec?.placeholder,
      critical: true,
    };
  });

  const needsInput = missingKeys.length > 0 || confidencePct < threshold;
  const workflowState: ClassificationWorkflowState = needsInput ? 'needs_input' : 'classified';
  const reason = !needsInput
    ? 'Información merceológica completa y confianza suficiente para clasificación directa.'
    : missingCriticalFields.length > 0
      ? `Faltan ${missingCriticalFields.length} atributo(s) merceológico(s) crítico(s): ${missingCriticalFields.join(', ')}.`
      : `Confianza (${confidencePct}%) por debajo del umbral requerido (${threshold}%).`;

  const tentativeProposal = needsInput ? input.topCandidate : undefined;
  const decision = ClassificationDecisionContractSchema.parse({
    mode: input.mode ?? 'individual',
    outcome: workflowState,
    confidencePct,
    reason,
    missingCriticalFields,
    clarifyingQuestions,
    ...(tentativeProposal ? { tentativeProposal } : {}),
  });

  return { needsInput, workflowState, reason, missingCriticalFields, clarifyingQuestions, ...(tentativeProposal ? { tentativeProposal } : {}), decision };
}
