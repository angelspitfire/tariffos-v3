import type { IncotermCode } from '@tariffos/shared-types';

export interface OriginCountryOption {
  code: string;
  name: string;
  aliases: string[];
  region: 'mercosur' | 'can' | 'aladi' | 'usmca' | 'eu' | 'asia' | 'other';
}

export const ORIGIN_COUNTRIES: OriginCountryOption[] = [
  { code: 'CN', name: 'China', aliases: ['china', 'prc', 'shenzhen', 'shanghai', 'ningbo', 'yantian', 'guangzhou'], region: 'asia' },
  { code: 'US', name: 'Estados Unidos', aliases: ['estados unidos', 'ee.uu.', 'eeuu', 'usa', 'u.s.a.', 'united states', 'miami', 'houston'], region: 'usmca' },
  { code: 'CO', name: 'Colombia', aliases: ['colombia', 'bogota', 'bogotá', 'medellin', 'cartagena', 'barranquilla'], region: 'can' },
  { code: 'BR', name: 'Brasil', aliases: ['brasil', 'brazil', 'sao paulo', 'santos'], region: 'mercosur' },
  { code: 'MX', name: 'México', aliases: ['mexico', 'méxico', 'cdmx', 'monterrey', 'veracruz', 'manzanillo'], region: 'usmca' },
  { code: 'DE', name: 'Alemania (UE)', aliases: ['alemania', 'germany', 'deutschland', 'hamburg', 'hamburgo'], region: 'eu' },
  { code: 'ES', name: 'España (UE)', aliases: ['espana', 'españa', 'spain', 'valencia', 'barcelona', 'madrid'], region: 'eu' },
  { code: 'IT', name: 'Italia (UE)', aliases: ['italia', 'italy', 'milano', 'genova'], region: 'eu' },
  { code: 'TR', name: 'Turquía', aliases: ['turquia', 'turquía', 'turkey', 'turkiye', 'istanbul'], region: 'other' },
  { code: 'IN', name: 'India', aliases: ['india', 'mumbai', 'nhava sheva', 'delhi'], region: 'asia' },
  { code: 'JP', name: 'Japón', aliases: ['japon', 'japón', 'japan', 'tokyo', 'osaka', 'yokohama'], region: 'asia' },
  { code: 'KR', name: 'Corea del Sur', aliases: ['corea', 'corea del sur', 'south korea', 'korea', 'busan', 'seoul'], region: 'asia' },
  { code: 'AR', name: 'Argentina', aliases: ['argentina', 'buenos aires'], region: 'mercosur' },
  { code: 'CL', name: 'Chile', aliases: ['chile', 'santiago', 'valparaiso'], region: 'aladi' },
  { code: 'PE', name: 'Perú', aliases: ['peru', 'perú', 'lima', 'callao'], region: 'can' },
  { code: 'EC', name: 'Ecuador', aliases: ['ecuador', 'quito', 'guayaquil'], region: 'can' },
  { code: 'PA', name: 'Panamá', aliases: ['panama', 'panamá', 'colon', 'colón'], region: 'aladi' },
  { code: 'CA', name: 'Canadá', aliases: ['canada', 'canadá', 'toronto', 'vancouver', 'montreal'], region: 'usmca' },
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
    shortDesc: 'Puesto a bordo: suma flete internacional y seguro para conformar el valor CIF.',
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
    shortDesc: 'Valor completo en puerto de destino; base directa del valor en aduana.',
    includesOriginCharges: true,
    includesFreight: true,
    includesInsurance: true,
  },
  DDP: {
    code: 'DDP',
    label: 'DDP (Delivered Duty Paid)',
    shortDesc: 'Entrega con derechos pagados; utiliza el valor aduanero sin tributos locales.',
    includesOriginCharges: true,
    includesFreight: true,
    includesInsurance: true,
  },
};
