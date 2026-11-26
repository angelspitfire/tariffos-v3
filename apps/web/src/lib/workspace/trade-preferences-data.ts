import type { IncotermCode } from '@tariffos/shared-types';

export interface OriginCountryOption {
  code: string;
  name: string;
  aliases: string[];
  region: 'mercosur' | 'can' | 'aladi' | 'usmca' | 'eu' | 'asia' | 'other';
}

export const ORIGIN_COUNTRIES: readonly OriginCountryOption[] = [
  { code: 'CN', name: 'China', aliases: ['china', 'prc', 'shenzhen', 'shanghai', 'yantian'], region: 'asia' },
  { code: 'US', name: 'Estados Unidos', aliases: ['estados unidos', 'ee.uu.', 'usa', 'united states', 'miami'], region: 'usmca' },
  { code: 'CO', name: 'Colombia', aliases: ['colombia', 'bogota', 'medellin', 'cartagena'], region: 'can' },
  { code: 'BR', name: 'Brasil', aliases: ['brasil', 'brazil', 'sao paulo', 'santos'], region: 'mercosur' },
  { code: 'MX', name: 'México', aliases: ['mexico', 'méxico', 'cdmx', 'veracruz'], region: 'usmca' },
  { code: 'DE', name: 'Alemania (UE)', aliases: ['alemania', 'germany', 'hamburgo'], region: 'eu' },
  { code: 'ES', name: 'España (UE)', aliases: ['espana', 'españa', 'spain', 'madrid'], region: 'eu' },
  { code: 'IT', name: 'Italia (UE)', aliases: ['italia', 'italy', 'milano'], region: 'eu' },
  { code: 'TR', name: 'Turquía', aliases: ['turquia', 'turquía', 'turkey'], region: 'other' },
  { code: 'IN', name: 'India', aliases: ['india', 'mumbai'], region: 'asia' },
  { code: 'JP', name: 'Japón', aliases: ['japon', 'japón', 'japan'], region: 'asia' },
  { code: 'KR', name: 'Corea del Sur', aliases: ['corea', 'south korea'], region: 'asia' },
  { code: 'AR', name: 'Argentina', aliases: ['argentina', 'buenos aires'], region: 'mercosur' },
  { code: 'CL', name: 'Chile', aliases: ['chile', 'santiago'], region: 'aladi' },
  { code: 'PE', name: 'Perú', aliases: ['peru', 'perú', 'lima'], region: 'can' },
  { code: 'EC', name: 'Ecuador', aliases: ['ecuador', 'guayaquil'], region: 'can' },
  { code: 'CA', name: 'Canadá', aliases: ['canada', 'canadá'], region: 'usmca' },
  { code: 'OTHER', name: 'Otro origen (NMF general)', aliases: [], region: 'other' },
];

export interface IncotermRule {
  code: IncotermCode;
  label: string;
  shortDesc: string;
  includesOriginCharges: boolean;
  includesFreight: boolean;
  includesInsurance: boolean;
}

export const INCOTERM_RULES: Record<IncotermCode, IncotermRule> = {
  EXW: {
    code: 'EXW',
    label: 'EXW (Ex Works)',
    shortDesc: 'En fábrica: suma gastos en origen, flete y seguro para conformar el valor CIF.',
    includesOriginCharges: false,
    includesFreight: false,
    includesInsurance: false,
  },
  FOB: {
    code: 'FOB',
    label: 'FOB (Free On Board)',
    shortDesc: 'Puesto a bordo: suma flete internacional y seguro para obtener el valor CIF.',
    includesOriginCharges: true,
    includesFreight: false,
    includesInsurance: false,
  },
  CFR: {
    code: 'CFR',
    label: 'CFR (Cost and Freight)',
    shortDesc: 'Incluye flete internacional; suma el seguro para obtener el valor CIF.',
    includesOriginCharges: true,
    includesFreight: true,
    includesInsurance: false,
  },
  CIF: {
    code: 'CIF',
    label: 'CIF (Cost, Insurance & Freight)',
    shortDesc: 'Base directa del valor en aduana (salvo CBP EE.UU. que valora sobre FOB).',
    includesOriginCharges: true,
    includesFreight: true,
    includesInsurance: true,
  },
  DDP: {
    code: 'DDP',
    label: 'DDP (Delivered Duty Paid)',
    shortDesc: 'Entrega con derechos pagados; introduce valor sin tributos locales.',
    includesOriginCharges: true,
    includesFreight: true,
    includesInsurance: true,
  },
};
