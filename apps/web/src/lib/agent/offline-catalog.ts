export interface OfflineCatalogRule {
  pattern: RegExp;
  hsCode: string;
  officialDescription: string;
  adValoremRate: number;
  ivaRate: number;
  unit: string;
  rgiRule: string;
  rgiNote: string;
  permits: string[];
  altCode?: string;
  altDesc?: string;
}

export const OFFLINE_CATALOG: readonly OfflineCatalogRule[] = [
  {
    pattern: /\b(motor|motores)\b/i,
    hsCode: '8501.52.10.00',
    officialDescription:
      'Motores de corriente alterna, polifásicos, de potencia superior a 750 W pero inferior o igual a 75 kW',
    adValoremRate: 14,
    ivaRate: 16,
    unit: 'u',
    rgiRule: 'RGI 1 y RGI 6',
    rgiNote: 'Partida 85.01; subpartida 8501.52 según potencia nominal y fases.',
    permits: ['SENCAMER'],
    altCode: '8501.51.10.00',
    altDesc: 'Motores CA polifásicos de potencia inferior o igual a 750 W',
  },
  {
    pattern: /\b(inversor|inverter|solar|mppt)\b/i,
    hsCode: '8504.40.90.00',
    officialDescription: 'Convertidores estáticos — Los demás inversores eléctricos',
    adValoremRate: 14,
    ivaRate: 16,
    unit: 'u',
    rgiRule: 'RGI 1 y RGI 6',
    rgiNote: 'Partida 85.04 (Convertidores estáticos) según Nota 2 de la Sección XVI.',
    permits: ['SENCAMER'],
    altCode: '8504.40.21.00',
    altDesc: 'Convertidores de corriente continua',
  },
  {
    pattern: /\b(laptop|macbook|port[aá]til|notebook)\b/i,
    hsCode: '8471.30.90.90',
    officialDescription:
      'Máquinas automáticas para tratamiento o procesamiento de datos, portátiles, de peso <= 10 kg',
    adValoremRate: 0,
    ivaRate: 16,
    unit: 'u',
    rgiRule: 'RGI 1 y RGI 6',
    rgiNote: 'Nota 5(B) del Capítulo 84 — CPU, entrada y salida en una misma envoltura.',
    permits: [],
    altCode: '8471.30.19.00',
    altDesc: 'Portátiles de peso inferior a 3,5 kg con pantalla <= 560 cm2',
  },
  {
    pattern: /\b(smartwatch|apple watch|reloj inteligente)\b/i,
    hsCode: '9102.19.00.00',
    officialDescription: 'Los demás relojes de pulsera, eléctricos, multifunción',
    adValoremRate: 20,
    ivaRate: 16,
    unit: 'u',
    rgiRule: 'RGI 1 y RGI 6',
    rgiNote:
      'Capítulo 91 Nota 2; excluye 9102.12 por funciones múltiples más allá de indicador optoelectrónico.',
    permits: ['CONATEL'],
    altCode: '8517.62.99.00',
    altDesc: 'Aparatos para recepción, conversión y transmisión de datos',
  },
];

export const DEFAULT_OFFLINE_RULE: OfflineCatalogRule = {
  pattern: /.*/,
  hsCode: '8479.89.99.00',
  officialDescription:
    'Máquinas y aparatos mecánicos con función propia, no expresados ni comprendidos en otra parte',
  adValoremRate: 14,
  ivaRate: 16,
  unit: 'u',
  rgiRule: 'RGI 1 y RGI 6',
  rgiNote: 'Clasificación preliminar determinista sujeta a verificación en Decreto 4.944.',
  permits: [],
};
