import type { IncotermCode } from '@tariffos/shared-types';
import { digits } from '../util/code.js';
import {
  INCOTERM_RULES,
  ORIGIN_COUNTRIES,
  type IncotermRule,
  type OriginCountryOption,
} from './trade-catalog.js';

export { INCOTERM_RULES, ORIGIN_COUNTRIES, type IncotermRule, type OriginCountryOption };

export interface PreferentialAgreementResult {
  hasAgreement: boolean;
  agreementName: string;
  discountPercent: number;
  waivesCustomsFee?: boolean;
  certificateRequired: string;
  note: string;
}

const VE_CAPITAL_CHAPTERS = new Set([30, 84, 85, 90]);
const US_BILATERAL_FTAS = new Set(['CO', 'CL', 'PE', 'KR', 'PA']);
const US_MPF_WAIVER_PARTNERS = new Set(['CL', 'CO', 'KR']);
const EU_PARTNERS = new Set(['MX', 'CO', 'PE', 'CL', 'JP', 'KR', 'CA']);

function agreement(
  agreementName: string,
  discountPercent: number,
  certificateRequired: string,
  note: string,
  waivesCustomsFee?: boolean,
): PreferentialAgreementResult {
  return {
    hasAgreement: true,
    agreementName,
    discountPercent,
    ...(waivesCustomsFee ? { waivesCustomsFee: true } : {}),
    certificateRequired,
    note,
  };
}

export function resolvePreferentialTreatment(params: {
  jurisdictionId: string;
  originCode: string;
  hsCode: string;
}): PreferentialAgreementResult {
  const { jurisdictionId, originCode, hsCode } = params;
  const chapter = Number(digits(hsCode).slice(0, 2)) || 0;
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
      const isCapital = VE_CAPITAL_CHAPTERS.has(chapter);
      return agreement(
        'MERCOSUR / ACE-59 (ALADI)',
        isCapital ? 100 : 80,
        'Certificado de Origen MERCOSUR / ALADI',
        isCapital
          ? 'Preferencia referencial 100% para bienes de capital/tecnología (verificar excepciones Decreto 4.944).'
          : 'Preferencia arancelaria referencial del 80% sujeta a certificado de origen válido.',
      );
    }
    if (originCode === 'CO') {
      return agreement(
        'AAP.AC N° 28 (Venezuela – Colombia)',
        70,
        'Certificado de Origen ALADI / AAP.AC 28',
        'Preferencia referencial del 70% sobre Ad Valorem general según anexo bilateral vigente.',
      );
    }
    if (originCode === 'EC' || originCode === 'PE' || originCode === 'CL' || originCode === 'MX') {
      return agreement(
        'Acuerdos de Alcance Parcial / PAR ALADI',
        40,
        'Certificado de Origen ALADI',
        'Desgravación referencial ALADI (40%) sujeta a verificación NALADISA y norma de origen.',
      );
    }
  }

  if (jurisdictionId === 'co-dian') {
    if (originCode === 'EC' || originCode === 'PE') {
      return agreement('Comunidad Andina (CAN)', 100, 'Certificado de Origen CAN', 'Liberación total del gravamen arancelario (0%) bajo programa andino.');
    }
    if (originCode === 'US') {
      return agreement('TLC Colombia – Estados Unidos', 100, 'Certificado de Origen TLC CO-US', 'Desgravación total referencial (0%) sujeta a regla de origen.');
    }
    if (originCode === 'MX' || originCode === 'CL') {
      return agreement('Alianza del Pacífico / ACE-72', 100, 'Certificado de Origen Alianza del Pacífico', 'Preferencia 100% sobre Ad Valorem en líneas desgravadas.');
    }
    if (isEu) {
      return agreement('Acuerdo Comercial UE – Colombia/Perú/Ecuador', 100, 'Certificado EUR.1 o Declaración en Factura', 'Desgravación total referencial (0%) con prueba de origen EUR.1.');
    }
  }

  if (jurisdictionId === 'mx-tigie') {
    if (originCode === 'US' || originCode === 'CA') {
      return agreement('T-MEC (USMCA)', 100, 'Certificación de Origen T-MEC', 'Exención total de IGI (0%) cumpliendo valor de contenido regional.');
    }
    if (originCode === 'CO' || originCode === 'CL' || originCode === 'PE') {
      return agreement('Alianza del Pacífico', 100, 'Certificado de Origen Alianza del Pacífico', 'Preferencia total (0% IGI) con certificado vigente.');
    }
    if (isEu) {
      return agreement('TLCUEM (México – Unión Europea)', 100, 'Certificado EUR.1 / Declaración en Factura', 'Arancel preferencial 0% con prueba de origen europea.');
    }
    if (originCode === 'JP') {
      return agreement('AAE México – Japón / TIPAT', 100, 'Certificado de Origen AAE / TIPAT', 'Desgravación arancelaria preferencial (0%) cumpliendo regla de origen.');
    }
  }

  if (jurisdictionId === 'us-htsus') {
    if (originCode === 'MX' || originCode === 'CA') {
      return agreement('USMCA (Column 1 Special)', 100, 'USMCA Certification of Origin', 'Free (0%) under USMCA Column 1 Special plus MPF exemption.', true);
    }
    if (US_BILATERAL_FTAS.has(originCode)) {
      return agreement(
        `U.S. Bilateral FTA (${country?.name ?? originCode})`,
        100,
        'FTA Origin Certification',
        'Column 1 Special Duty-Free eligibility subject to Regional Value Content.',
        US_MPF_WAIVER_PARTNERS.has(originCode),
      );
    }
  }

  if (jurisdictionId === 'eu-taric' && EU_PARTNERS.has(originCode)) {
    return agreement(
      `Acuerdo Preferencial UE – ${country?.name ?? originCode}`,
      100,
      'EUR.1 / REX Statement on Origin',
      'Tipo preferencial 0% con prueba de origen REX o EUR.1 válida.',
    );
  }

  return {
    hasAgreement: false,
    agreementName: 'Nación Más Favorecida (NMF / Tarifa General)',
    discountPercent: 0,
    certificateRequired: 'No aplica tratado preferencial vigente',
    note: `No existe acuerdo preferencial automático entre ${country?.name ?? originCode} y esta jurisdicción.`,
  };
}

export function detectOriginCodeFromText(text: string): string | null {
  const lower = text.toLowerCase();
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
  const upper = text.toUpperCase();
  if (!upper.trim()) return null;
  if (/\bDDP\b/.test(upper)) return 'DDP';
  if (/\bCIF\b/.test(upper)) return 'CIF';
  if (/\bCFR\b|\bC&F\b|\bCNF\b/.test(upper)) return 'CFR';
  if (/\bFOB\b|\bFCA\b/.test(upper)) return 'FOB';
  if (/\bEXW\b/.test(upper)) return 'EXW';
  return null;
}
