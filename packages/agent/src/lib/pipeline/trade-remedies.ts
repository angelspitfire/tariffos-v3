import { digits } from '../util/code.js';

export interface TradeRemedyFlag {
  code: string;
  severity: 'high' | 'medium' | 'info';
  title: string;
  description: string;
  suggestedExtraDutyPercent: number;
}

const US_SEC301_HIGH_CHAPTERS = new Set([73, 84, 85, 87, 90, 94]);
const METAL_CHAPTERS = new Set([72, 73, 76]);
const TEXTILE_FOOTWEAR_CHAPTERS = new Set([61, 62, 63, 64]);
const LATAM_REMEDY_JURISDICTIONS = new Set(['ve-seniat', 'co-dian', 'mx-tigie']);

export function evaluateTradeRemedies(params: {
  jurisdictionId: string;
  originCode: string;
  hsCode: string;
}): TradeRemedyFlag[] {
  const { jurisdictionId, originCode, hsCode } = params;
  const rawDigits = digits(hsCode);
  const chapter = Number(rawDigits.slice(0, 2)) || 0;
  const heading = rawDigits.slice(0, 4);
  const flags: TradeRemedyFlag[] = [];

  if (!originCode || originCode === 'OTHER') return flags;

  if (jurisdictionId === 'us-htsus') {
    if (originCode === 'CN') {
      const highRate = US_SEC301_HIGH_CHAPTERS.has(chapter);
      flags.push({
        code: 'SEC-301',
        severity: 'high',
        title: 'Arancel adicional Section 301 (Origen China)',
        description: highRate
          ? 'Mercancía industrial/tecnológica originaria de China sujeta típicamente a sobretasa Section 301 (+25% Listas 1-3 o +7.5% Lista 4A).'
          : 'Verifica inclusión en Listas 1-4A de Section 301 para origen China (+7.5% a +25% adicional).',
        suggestedExtraDutyPercent: highRate ? 25 : 7.5,
      });
    }
    if (METAL_CHAPTERS.has(chapter)) {
      const pct = chapter === 76 ? 10 : 25;
      flags.push({
        code: 'SEC-232',
        severity: 'high',
        title: `Medida Section 232 (${chapter === 76 ? 'Aluminio +10%' : 'Acero +25%'})`,
        description:
          'Productos siderúrgicos y de aluminio enfrentan sobretasas Section 232 salvo cuota o exclusión aprobada por DOC/BIS.',
        suggestedExtraDutyPercent: pct,
      });
    }
  }

  if (jurisdictionId === 'eu-taric') {
    if (METAL_CHAPTERS.has(chapter) || heading === '2523') {
      flags.push({
        code: 'CBAM / SALV.',
        severity: 'high',
        title: 'Control CBAM y posible salvaguardia siderúrgica UE',
        description:
          'Importación sujeta a declaración de emisiones CBAM (hierro, acero, aluminio o cemento) y contingentes de salvaguardia TARIC.',
        suggestedExtraDutyPercent: chapter === 72 || chapter === 73 ? 25 : 0,
      });
    }
  }

  if (LATAM_REMEDY_JURISDICTIONS.has(jurisdictionId)) {
    if (METAL_CHAPTERS.has(chapter) && (originCode === 'CN' || originCode === 'TR' || originCode === 'IN')) {
      flags.push({
        code: 'AD-METAL',
        severity: 'high',
        title: 'Posible derecho antidumping / salvaguardia en acero y aluminio',
        description:
          'Láminas, perfiles, tuberías y manufacturas de hierro/acero o aluminio procedentes de Asia/Turquía cuentan frecuentemente con derechos antidumping o licencias previas.',
        suggestedExtraDutyPercent: jurisdictionId === 'mx-tigie' ? 35 : 20,
      });
    }

    if (TEXTILE_FOOTWEAR_CHAPTERS.has(chapter) && (originCode === 'CN' || originCode === 'IN')) {
      flags.push({
        code: 'PRECIOS-REF',
        severity: 'medium',
        title: 'Control de precios referenciales / umbral textil y calzado',
        description:
          'Textiles, confecciones y calzado originarios de Asia están sujetos a umbrales aduaneros, arancel mixto/específico o verificación de subvaluación.',
        suggestedExtraDutyPercent: 15,
      });
    }

    if (heading === '4011' && originCode === 'CN') {
      flags.push({
        code: 'AD-4011',
        severity: 'medium',
        title: 'Revisión de cuotas compensatorias / neumáticos radiales (4011)',
        description:
          'Neumáticos nuevos de caucho originarios de China presentan investigaciones o cuotas antidumping vigentes en múltiples aranceles latinoamericanos.',
        suggestedExtraDutyPercent: 22,
      });
    }

    if ((heading === '6907' || heading === '6908') && (originCode === 'CN' || originCode === 'IN')) {
      flags.push({
        code: 'AD-CERAM',
        severity: 'medium',
        title: 'Posible cuota compensatoria en recubrimientos cerámicos (6907)',
        description:
          'Baldosas y porcelanatos de origen asiático suelen estar sujetos a derechos antidumping o precios mínimos de referencia.',
        suggestedExtraDutyPercent: 18,
      });
    }
  }

  return flags;
}
