import type { IncotermCode } from '@tariffos/shared-types';
import {
  INCOTERM_RULES,
  ORIGIN_COUNTRIES,
  type IncotermRule,
  type OriginCountryOption,
} from './trade-preferences-data';

export { INCOTERM_RULES, ORIGIN_COUNTRIES, type IncotermRule, type OriginCountryOption };

export interface PreferentialAgreementResult {
  hasAgreement: boolean;
  agreementName: string;
  discountPercent: number;
  waivesCustomsFee?: boolean;
  certificateRequired: string;
  note: string;
}

export interface TradeRemedyFlag {
  code: string;
  severity: 'high' | 'medium' | 'info';
  title: string;
  description: string;
  suggestedExtraDutyPercent: number;
}

function getChapterNumber(hsCode: string): number {
  return Number(hsCode.replace(/\D/g, '').slice(0, 2)) || 0;
}

export function resolvePreferentialTreatment(params: {
  jurisdictionId: string;
  originCode: string;
  hsCode: string;
}): PreferentialAgreementResult {
  const { jurisdictionId, originCode, hsCode } = params;
  const chapter = getChapterNumber(hsCode);
  const country = ORIGIN_COUNTRIES.find((c) => c.code === originCode);
  const isEu = country?.region === 'eu';

  if (!originCode || originCode === 'OTHER') {
    return {
      hasAgreement: false,
      agreementName: 'Nación Más Favorecida (NMF / Erga Omnes)',
      discountPercent: 0,
      certificateRequired: 'No aplica',
      note: 'Aplica arancel general vigente sin desgravación preferencial.',
    };
  }

  if (jurisdictionId === 've-seniat') {
    if (originCode === 'BR' || originCode === 'AR') {
      const isCapital = [84, 85, 90, 30].includes(chapter);
      return {
        hasAgreement: true,
        agreementName: 'MERCOSUR / ACE-59 (ALADI)',
        discountPercent: isCapital ? 100 : 80,
        certificateRequired: 'Certificado de Origen MERCOSUR / ALADI',
        note: 'Preferencia referencial sujeta a certificado de origen vigente y lista Decreto 4.944.',
      };
    }
    if (originCode === 'CO') {
      return {
        hasAgreement: true,
        agreementName: 'AAP.AC N° 28 (Venezuela – Colombia)',
        discountPercent: 70,
        certificateRequired: 'Certificado de Origen ALADI / AAP.AC 28',
        note: 'Preferencia referencial del 70% sobre Ad Valorem general según anexo bilateral.',
      };
    }
  }

  if (jurisdictionId === 'co-dian' && (originCode === 'EC' || originCode === 'PE' || originCode === 'US' || isEu)) {
    return {
      hasAgreement: true,
      agreementName: isEu ? 'Acuerdo Comercial UE – Colombia' : 'Acuerdo Preferencial CAN / TLC',
      discountPercent: 100,
      certificateRequired: isEu ? 'EUR.1 / Declaración en Factura' : 'Certificado de Origen',
      note: 'Desgravación total referencial sujeta a norma de origen específica.',
    };
  }

  if (jurisdictionId === 'mx-tigie' && (originCode === 'US' || originCode === 'CA' || isEu)) {
    return {
      hasAgreement: true,
      agreementName: isEu ? 'TLCUEM (México – UE)' : 'T-MEC (USMCA)',
      discountPercent: 100,
      certificateRequired: 'Certificación de Origen vigente',
      note: 'Exención de IGI (0% Ad Valorem) cumpliendo valor de contenido regional.',
    };
  }

  if (jurisdictionId === 'us-htsus' && (originCode === 'MX' || originCode === 'CA')) {
    return {
      hasAgreement: true,
      agreementName: 'USMCA (Column 1 Special)',
      discountPercent: 100,
      waivesCustomsFee: true,
      certificateRequired: 'USMCA Certification of Origin',
      note: 'Duty-free under USMCA plus MPF exemption for originating goods.',
    };
  }

  return {
    hasAgreement: false,
    agreementName: 'Nación Más Favorecida (NMF / Tarifa General)',
    discountPercent: 0,
    certificateRequired: 'No aplica tratado preferencial',
    note: `Sin preferencia arancelaria automática para ${country?.name ?? originCode}.`,
  };
}

export function evaluateTradeRemedies(params: {
  jurisdictionId: string;
  originCode: string;
  hsCode: string;
}): TradeRemedyFlag[] {
  const { jurisdictionId, originCode, hsCode } = params;
  const chapter = getChapterNumber(hsCode);
  const flags: TradeRemedyFlag[] = [];
  if (!originCode || originCode === 'OTHER') return flags;

  if (jurisdictionId === 'us-htsus' && originCode === 'CN') {
    const highList = [84, 85, 87, 90, 94, 73].includes(chapter);
    flags.push({
      code: 'SEC-301',
      severity: 'high',
      title: 'Arancel adicional Section 301 (Origen China)',
      description: 'Mercancía originaria de China potencialmente sujeta a sobretasa Section 301.',
      suggestedExtraDutyPercent: highList ? 25 : 7.5,
    });
  }

  if (
    ['ve-seniat', 'co-dian', 'mx-tigie'].includes(jurisdictionId) &&
    [72, 73, 76].includes(chapter) &&
    ['CN', 'TR', 'IN'].includes(originCode)
  ) {
    flags.push({
      code: 'AD-METAL',
      severity: 'high',
      title: 'Posible derecho antidumping en acero/aluminio',
      description: 'Manufacturas siderúrgicas o de aluminio de Asia/Turquía sujetas a revisión de cuotas.',
      suggestedExtraDutyPercent: jurisdictionId === 'mx-tigie' ? 35 : 20,
    });
  }

  return flags;
}

export function detectOriginCodeFromText(text: string): string | null {
  const lower = (text || '').toLowerCase();
  if (!lower.trim()) return null;
  for (const country of ORIGIN_COUNTRIES) {
    if (country.code === 'OTHER') continue;
    for (const alias of country.aliases) {
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (new RegExp(`\\b${escaped}\\b`, 'i').test(lower)) return country.code;
    }
  }
  return null;
}

export function detectIncotermFromText(text: string): IncotermCode | null {
  const upper = (text || '').toUpperCase();
  if (/\bDDP\b/.test(upper)) return 'DDP';
  if (/\bCIF\b/.test(upper)) return 'CIF';
  if (/\bCFR\b|\bC&F\b/.test(upper)) return 'CFR';
  if (/\bFOB\b|\bFCA\b/.test(upper)) return 'FOB';
  if (/\bEXW\b/.test(upper)) return 'EXW';
  return null;
}
