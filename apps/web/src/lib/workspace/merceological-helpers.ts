import type {
  A2UIMerceologicalSheet,
  MerceologicalAttribute,
  MerceologicalAttributeKey,
  MerceologicalConfidenceBreakdown,
} from '@tariffos/shared-types';

const HIGH_CONFIDENCE_MIN = 85;
const MEDIUM_CONFIDENCE_MIN = 60;
const MISSING_CRITICAL_PENALTY = 18;
const MISSING_OPTIONAL_PENALTY = 6;
const INFERRED_CRITICAL_PENALTY = 8;

export function computeMerceologicalConfidence(
  attributes: readonly MerceologicalAttribute[],
  options?: { confirmedByUser?: boolean }
): MerceologicalConfidenceBreakdown {
  const baseScore = 100;
  const penalties: MerceologicalConfidenceBreakdown['penalties'] = [];

  for (const attr of attributes) {
    const empty = attr.value.trim().length === 0 || attr.provenance === 'missing';
    if (empty) {
      penalties.push({
        key: attr.key,
        label: attr.label,
        points: attr.critical ? MISSING_CRITICAL_PENALTY : MISSING_OPTIONAL_PENALTY,
        reason: attr.critical
          ? `Falta atributo crítico: ${attr.label}`
          : `Atributo complementario sin especificar: ${attr.label}`,
      });
    } else if (attr.critical && attr.provenance === 'inferred' && !options?.confirmedByUser) {
      penalties.push({
        key: attr.key,
        label: attr.label,
        points: INFERRED_CRITICAL_PENALTY,
        reason: `${attr.label} inferido por IA (sin confirmación directa)`,
      });
    }
  }

  const penaltyPoints = penalties.reduce((sum, p) => sum + p.points, 0);
  const finalScore = Math.max(15, Math.min(100, baseScore - penaltyPoints));
  const level: MerceologicalConfidenceBreakdown['level'] =
    finalScore >= HIGH_CONFIDENCE_MIN
      ? 'Alto'
      : finalScore >= MEDIUM_CONFIDENCE_MIN
        ? 'Medio'
        : 'Bajo';

  return { baseScore, penaltyPoints, finalScore, level, penalties };
}

export function mergeUserEditedSheet(
  sheet: A2UIMerceologicalSheet,
  draftValues: Record<MerceologicalAttributeKey, string>,
  confirmedByUser: boolean
): A2UIMerceologicalSheet {
  const nextAttributes: MerceologicalAttribute[] = sheet.attributes.map((attr) => {
    const nextVal = (draftValues[attr.key] ?? '').trim();
    const changed = nextVal !== attr.value.trim();
    if (!nextVal) {
      return { ...attr, value: '', provenance: 'missing' };
    }
    if (changed || confirmedByUser) {
      return { ...attr, value: nextVal, provenance: 'user_input' };
    }
    return attr;
  });

  const missingCritical = nextAttributes.filter(
    (a) => a.critical && (a.provenance === 'missing' || a.value.trim().length === 0)
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
  overrides?: Partial<Record<MerceologicalAttributeKey, string>>
): A2UIMerceologicalSheet {
  const defs: Array<Omit<MerceologicalAttribute, 'value' | 'provenance'>> = [
    {
      key: 'naturaleza_materia',
      label: 'Naturaleza y materia constitutiva',
      category: 'morphological',
      weight: 20,
      critical: true,
      placeholder: 'Ej. Acero inoxidable, plástico ABS, aluminio...',
    },
    {
      key: 'composicion',
      label: 'Composición porcentual / partes',
      category: 'morphological',
      weight: 15,
      critical: false,
      placeholder: 'Ej. 85% cobre, 15% polímero aislante',
    },
    {
      key: 'funcion_uso',
      label: 'Función principal y uso',
      category: 'functional',
      weight: 20,
      critical: true,
      placeholder: 'Ej. Diagnóstico médico, bombeo industrial...',
    },
    {
      key: 'principio_funcionamiento',
      label: 'Principio de funcionamiento',
      category: 'functional',
      weight: 15,
      critical: true,
      placeholder: 'Ej. Eléctrico trifásico AC, ultrasonido Doppler...',
    },
    {
      key: 'estado_elaboracion',
      label: 'Estado de elaboración',
      category: 'morphological',
      weight: 10,
      critical: false,
      placeholder: 'Ej. Nuevo, ensamblado completo, semielaborado',
    },
    {
      key: 'presentacion',
      label: 'Presentación comercial / empaque',
      category: 'presentation',
      weight: 10,
      critical: false,
      placeholder: 'Ej. Caja individual, bolsa 500g, pallet industrial',
    },
    {
      key: 'especificaciones_tecnicas',
      label: 'Especificaciones técnicas clave',
      category: 'technical',
      weight: 10,
      critical: true,
      placeholder: 'Ej. Potencia kW, voltaje, capacidad, frecuencia',
    },
  ];

  const attributes: MerceologicalAttribute[] = defs.map((def) => {
    const val = (overrides?.[def.key] ?? '').trim();
    return {
      ...def,
      value: val,
      provenance: val ? 'user_input' : 'missing',
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
