import type {
  A2UIMerceologicalSheet,
  MerceologicalAttribute,
  MerceologicalAttributeKey,
} from '@tariffos/shared-types';
import {
  CANONICAL_MERCEOLOGICAL_ATTRIBUTES,
  computeMerceologicalConfidence,
  isMissingAttributeText,
} from './merceological-specs.js';

export function mergeUserEditedSheet(
  sheet: A2UIMerceologicalSheet,
  draftValues: Record<MerceologicalAttributeKey, string>,
  confirmedByUser: boolean,
): A2UIMerceologicalSheet {
  const nextAttributes: MerceologicalAttribute[] = sheet.attributes.map((attr) => {
    const nextVal = (draftValues[attr.key] ?? '').trim();
    if (isMissingAttributeText(nextVal)) {
      return { ...attr, value: '', provenance: 'missing' };
    }
    const changed = nextVal !== attr.value.trim();
    if (changed || confirmedByUser) {
      return { ...attr, value: nextVal, provenance: 'user_input' };
    }
    return attr;
  });

  const missingCritical = nextAttributes.filter(
    (a) => a.critical && (a.provenance === 'missing' || isMissingAttributeText(a.value)),
  );

  return {
    ...sheet,
    attributes: nextAttributes,
    missingCriticalKeys: missingCritical.map((a) => a.key),
    missingCriticalLabels: missingCritical.map((a) => a.label),
    confidenceBreakdown: computeMerceologicalConfidence(nextAttributes, { confirmedByUser }),
    confirmedByUser: confirmedByUser || sheet.confirmedByUser,
    updatedAt: new Date().toISOString(),
  };
}

export function buildDefaultMerceologicalSheet(
  productName: string,
  overrides?: Partial<Record<MerceologicalAttributeKey, string>>,
): A2UIMerceologicalSheet {
  const attributes: MerceologicalAttribute[] = CANONICAL_MERCEOLOGICAL_ATTRIBUTES.map((spec) => {
    const raw = (overrides?.[spec.key] ?? '').trim();
    const present = !isMissingAttributeText(raw);
    return {
      key: spec.key,
      label: spec.label,
      category: spec.category,
      weight: spec.weight,
      critical: spec.critical,
      placeholder: spec.placeholder,
      value: present ? raw : '',
      provenance: present ? 'user_input' : 'missing',
    };
  });

  const missingCritical = attributes.filter((a) => a.critical && a.provenance === 'missing');
  return {
    id: `sheet-${Date.now()}`,
    productName,
    summary: productName,
    attributes,
    missingCriticalKeys: missingCritical.map((a) => a.key),
    missingCriticalLabels: missingCritical.map((a) => a.label),
    webSearchTriggered: false,
    webSearchReason: 'Evaluación directa sobre especificaciones provistas.',
    confidenceBreakdown: computeMerceologicalConfidence(attributes),
  };
}
