export interface HeroSampleCase {
  readonly key: string;
  readonly prompt: string;
  readonly shortLabel: string;
  readonly expediente: string;
  readonly jurisdiction: string;
  readonly confidence: number;
  readonly merchandise: string;
  readonly hsCode: string;
  readonly hsDescription: string;
  readonly badges: readonly string[];
  readonly taxes: readonly { label: string; value: string; pct: number }[];
  readonly hitlNote: string;
  readonly latency: string;
}

export const HERO_SAMPLE_CASES: readonly HeroSampleCase[] = [
  {
    key: 'bomba',
    prompt: 'Bomba sumergible acero inox 2HP 120 L/min',
    shortLabel: 'Bomba sumergible 2HP',
    expediente: 'EXP-2026-0842',
    jurisdiction: 'VE-SENIAT',
    confidence: 96,
    merchandise:
      'Bomba centrífuga sumergible trifásica 2 HP, cuerpo de acero inoxidable AISI 304, caudal 120 L/min, para pozo profundo.',
    hsCode: '8413.70.10.00',
    hsDescription: 'Las demás bombas centrífugas: electrobombas sumergibles.',
    badges: ['RGI 1', 'RGI 6', 'Decreto 4.944'],
    taxes: [
      { label: 'Ad Valorem', value: '12%', pct: 60 },
      { label: 'IVA', value: '16%', pct: 80 },
      { label: 'Tasa Aduanal', value: '1%', pct: 18 },
    ],
    hitlNote: '7/7 atributos técnicos verificados sin brechas críticas.',
    latency: '2.4 s',
  },
  {
    key: 'laptop',
    prompt: 'Laptop Dell Latitude i7 16GB RAM SSD 512GB',
    shortLabel: 'Laptop Dell Latitude i7',
    expediente: 'EXP-2026-0915',
    jurisdiction: 'VE-SENIAT',
    confidence: 98,
    merchandise:
      'Computador portátil Dell Latitude, procesador Intel Core i7, 16 GB RAM, unidad SSD 512 GB, pantalla 14 pulgadas.',
    hsCode: '8471.30.00.00',
    hsDescription:
      'Máquinas automáticas para tratamiento de datos, portátiles, de peso inferior o igual a 10 kg.',
    badges: ['RGI 1', 'Nota Legal 6 Cap. 84', 'Decreto 4.944'],
    taxes: [
      { label: 'Ad Valorem', value: '0%', pct: 12 },
      { label: 'IVA', value: '16%', pct: 80 },
      { label: 'Tasa Aduanal', value: '1%', pct: 18 },
    ],
    hitlNote: '6/6 atributos técnicos verificados (peso, CPU y uso).',
    latency: '1.9 s',
  },
  {
    key: 'aceite',
    prompt: 'Aceite de oliva virgen extra en botella vidrio 1L',
    shortLabel: 'Aceite de oliva 1L',
    expediente: 'EXP-2026-0931',
    jurisdiction: 'VE-SENIAT',
    confidence: 95,
    merchandise:
      'Aceite de oliva virgen extra obtenido por presión en frío, acidez menor a 0,8%, envasado en botella de vidrio de 1 L.',
    hsCode: '1509.20.00.00',
    hsDescription: 'Aceite de oliva virgen extra, sin modificar químicamente.',
    badges: ['RGI 1', 'RGI 6', 'Régimen Legal 3'],
    taxes: [
      { label: 'Ad Valorem', value: '20%', pct: 95 },
      { label: 'IVA', value: '16%', pct: 80 },
      { label: 'Tasa Aduanal', value: '1%', pct: 18 },
    ],
    hitlNote: '5/5 atributos verificados (acidez, extracción y envase).',
    latency: '2.1 s',
  },
] as const;
