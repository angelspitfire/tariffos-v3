import type {
  AttributeProvenance,
  MerceologicalAttribute,
  MerceologicalAttributeKey,
  MerceologicalConfidenceBreakdown,
} from '@tariffos/shared-types';

export interface CanonicalAttributeSpec {
  key: MerceologicalAttributeKey;
  label: string;
  category: MerceologicalAttribute['category'];
  weight: number;
  critical: boolean;
  placeholder: string;
  questionPrompt: string;
  suggestedOptions?: string[];
  keyAliases: RegExp[];
}

export const CANONICAL_MERCEOLOGICAL_ATTRIBUTES: CanonicalAttributeSpec[] = [
  {
    key: 'naturaleza_materia',
    label: 'Naturaleza / Materia constitutiva',
    category: 'morphological',
    weight: 22,
    critical: true,
    placeholder: 'Ej. Acero inoxidable, policarbonato, aluminio, mezcla algodón/poliéster',
    questionPrompt: '¿Cuál es el material o materia constitutiva principal del producto?',
    keyAliases: [/naturaleza/i, /materia/i, /material/i, /constitutiv/i, /aleaci/i],
  },
  {
    key: 'composicion',
    label: 'Composición / Proporción de materiales',
    category: 'morphological',
    weight: 14,
    critical: true,
    placeholder: 'Ej. 80% algodón 20% elastano, AISI 304, pura sin aditivos',
    questionPrompt: '¿Cuál es la composición o proporción porcentual de materiales?',
    keyAliases: [/composici/i, /porcent/i, /pureza/i, /concentraci/i, /f[oó]rmula/i],
  },
  {
    key: 'funcion_uso',
    label: 'Función principal / Uso previsto',
    category: 'functional',
    weight: 22,
    critical: true,
    placeholder: 'Ej. Bombeo de fluidos industriales, monitoreo biométrico, ensamblaje',
    questionPrompt: '¿Cuál es la función principal o uso previsto de la mercancía?',
    keyAliases: [/funci[oó]n/i, /uso/i, /destino/i, /aplicaci[oó]n/i],
  },
  {
    key: 'principio_funcionamiento',
    label: 'Principio de funcionamiento / Mecanismo',
    category: 'functional',
    weight: 14,
    critical: true,
    placeholder: 'Ej. Eléctrico trifásico, centrífugo, óptico-digital, manual mecánico',
    questionPrompt: '¿Cómo opera o cuál es el principio de funcionamiento / accionamiento?',
    suggestedOptions: ['Eléctrico / Electrónico', 'Mecánico / Manual', 'Hidráulico / Neumático', 'Químico / Pasivo'],
    keyAliases: [/principio/i, /funcionamiento/i, /mecanismo/i, /accionamiento/i, /motor/i, /sistema/i],
  },
  {
    key: 'estado_elaboracion',
    label: 'Estado / Grado de elaboración',
    category: 'morphological',
    weight: 10,
    critical: false,
    placeholder: 'Ej. Producto terminado nuevo, semielaborado, en bruto, ensamblado',
    questionPrompt: '¿En qué estado o grado de elaboración se importa?',
    suggestedOptions: ['Terminado nuevo', 'Semielaborado', 'En bruto / Materia prima', 'Usado / Remanufacturado'],
    keyAliases: [/estado/i, /elaboraci[oó]n/i, /acabado/i, /condici[oó]n/i, /nuevo/i, /usado/i],
  },
  {
    key: 'presentacion',
    label: 'Presentación / Acondicionamiento',
    category: 'presentation',
    weight: 8,
    critical: false,
    placeholder: 'Ej. En caja individual retail, granel, bobina de 50 kg, set de 10 uds',
    questionPrompt: '¿Cómo viene acondicionada o empacada la mercancía?',
    keyAliases: [/presentaci[oó]n/i, /acondicionamiento/i, /envase/i, /empaque/i, /embalaje/i, /formato/i],
  },
  {
    key: 'especificaciones_tecnicas',
    label: 'Especificaciones técnicas medibles',
    category: 'technical',
    weight: 10,
    critical: true,
    placeholder: 'Ej. 220V, 1.5 kW, 450 g, IP68, Bluetooth 5.3 / GPS, rosca M8x30mm',
    questionPrompt: '¿Qué especificaciones técnicas medibles tiene (peso, potencia, voltaje, dimensiones)?',
    keyAliases: [/especificaci/i, /t[eé]cnic/i, /potencia/i, /volt/i, /peso/i, /dimensi/i, /capacidad/i, /conectividad/i],
  },
];

export const PROVENANCE_MULTIPLIERS: Record<AttributeProvenance, number> = {
  user_input: 1.0,
  web_search: 0.92,
  inferred: 0.65,
  missing: 0,
};

const MISSING_VALUE_REGEX =
  /^(n\/a|na|desconocid[oa]|sin\s+dato|no\s+especificad[oa]|pendiente|faltante|por\s+confirmar|unknown|\?|-+)$/i;

const CRITICAL_PENALTY_FACTOR = 0.45;
const OPTIONAL_PENALTY_FACTOR = 0.25;
const MIN_CRITICAL_PENALTY = 4;
const MIN_OPTIONAL_PENALTY = 2;
const HIGH_LEVEL_CUTOFF = 80;
const MEDIUM_LEVEL_CUTOFF = 60;

export function isMissingAttributeText(value: unknown): boolean {
  if (typeof value !== 'string') return true;
  const s = value.trim();
  return !s || MISSING_VALUE_REGEX.test(s);
}

export function computeMerceologicalConfidence(
  attributes: readonly MerceologicalAttribute[],
  options: { competingCandidatesCount?: number; confirmedByUser?: boolean } = {},
): MerceologicalConfidenceBreakdown {
  let weightedSum = 0;
  let totalWeight = 0;
  let inferredCount = 0;
  let userCount = 0;
  const penalties: MerceologicalConfidenceBreakdown['penalties'] = [];

  for (const attr of attributes) {
    const w = Math.max(0, Number(attr.weight) || 0);
    totalWeight += w;

    const effProvenance: AttributeProvenance = isMissingAttributeText(attr.value)
      ? 'missing'
      : attr.provenance;
    if (effProvenance === 'inferred') inferredCount += 1;
    if (effProvenance === 'user_input') userCount += 1;

    weightedSum += w * (PROVENANCE_MULTIPLIERS[effProvenance] ?? 0);

    if (effProvenance === 'missing' && attr.critical) {
      penalties.push({
        key: attr.key,
        label: attr.label,
        points: Math.max(MIN_CRITICAL_PENALTY, Math.round(w * CRITICAL_PENALTY_FACTOR)),
        reason: `Atributo crítico faltante (${attr.label.toLowerCase()})`,
      });
    } else if (effProvenance === 'missing') {
      penalties.push({
        key: attr.key,
        label: attr.label,
        points: Math.max(MIN_OPTIONAL_PENALTY, Math.round(w * OPTIONAL_PENALTY_FACTOR)),
        reason: `Dato complementario sin confirmar (${attr.label.toLowerCase()})`,
      });
    }
  }

  const baseScore = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) : 50;

  if (!options.confirmedByUser && inferredCount >= 3 && userCount <= 1) {
    penalties.push({
      key: 'inference_dependency',
      label: 'Dependencia de inferencias',
      points: 6,
      reason: `${inferredCount} atributos inferidos sin confirmación directa del operador`,
    });
  }

  const candidatesCount = options.competingCandidatesCount ?? 0;
  if (!options.confirmedByUser && candidatesCount >= 2) {
    penalties.push({
      key: 'tariff_ambiguity',
      label: 'Ambigüedad entre subpartidas',
      points: candidatesCount >= 3 ? 10 : 6,
      reason: `Existen ${candidatesCount} subpartidas candidatas plausibles en disputa`,
    });
  }

  const penaltyPoints = penalties.reduce((acc, p) => acc + p.points, 0);
  const finalScore = Math.min(99, Math.max(5, Math.round(baseScore - penaltyPoints)));
  const level: 'Alto' | 'Medio' | 'Bajo' =
    finalScore >= HIGH_LEVEL_CUTOFF ? 'Alto' : finalScore >= MEDIUM_LEVEL_CUTOFF ? 'Medio' : 'Bajo';

  return { baseScore, penaltyPoints, finalScore, level, penalties };
}
