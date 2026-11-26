export interface OfflinePresetSpec {
  hsCode: string;
  title: string;
  officialDesc: string;
  adValorem: number;
  regimeCode: string;
  regimeSummary: string;
  severity: 'info' | 'warning' | 'restricted';
  permits: Array<{ code: string; name: string; organism: string; mandatory: boolean }>;
  origin: string;
  rgi2: string;
  rejectedCode: string;
  rejectedReason: string;
}

export function resolveOfflinePreset(query: string): OfflinePresetSpec {
  const q = query.toLowerCase();
  if (/ec[oó]graf|ultrasonid|doppler/.test(q)) {
    return {
      hsCode: '9018.12.10.00',
      title: 'Ecógrafo portátil Doppler a color',
      officialDesc: 'Aparatos de diagnóstico por exploración ultrasónica (ecógrafos Doppler)',
      adValorem: 0,
      regimeCode: 'R3 (SACS)',
      regimeSummary: 'Requiere Registro Sanitario vigente de equipo médico ante SACS / MinSalud.',
      severity: 'warning',
      permits: [
        { code: 'R3', name: 'Registro Sanitario de Equipo Médico', organism: 'SACS / MinSalud', mandatory: true },
      ],
      origin: 'Alemania',
      rgi2: 'Subpartida 9018.12 designa específicamente aparatos de diagnóstico por exploración ultrasónica.',
      rejectedCode: '9018.19.80.00',
      rejectedReason: 'Residual "Los demás" descartada por especificidad de 9018.12 (RGI 6).',
    };
  }
  if (/caf[eé]|tostad|ar[aá]bica/.test(q)) {
    return {
      hsCode: '0901.21.00.00',
      title: 'Café tostado molido sin descafeinar',
      officialDesc: 'Café tostado, sin descafeinar, molido en empaque al por menor',
      adValorem: 15,
      regimeCode: 'R3 / R5',
      regimeSummary: 'Requiere Permiso Sanitario de Alimentos (SACS) y Certificado Fitosanitario (INSAI).',
      severity: 'restricted',
      permits: [
        { code: 'R3', name: 'Registro Sanitario de Alimentos', organism: 'SACS', mandatory: true },
        { code: 'R5', name: 'Certificado Fitosanitario de Importación', organism: 'INSAI', mandatory: true },
      ],
      origin: 'Colombia',
      rgi2: 'Subpartida 0901.21 comprende café tostado sin descafeinar (en grano o molido).',
      rejectedCode: '0901.11.10.00',
      rejectedReason: 'Aplica únicamente a café sin tostar (verde); excluido por RGI 1 y 6.',
    };
  }
  if (/motor\s+el[eé]ctric|motor\s+trif[aá]sic|8501/.test(q)) {
    return {
      hsCode: '8501.52.10.00',
      title: 'Motor eléctrico trifásico industrial (750W – 75kW)',
      officialDesc: 'Motores de corriente alterna, polifásicos, de potencia > 750 W y ≤ 75 kW',
      adValorem: 12,
      regimeCode: 'Libre',
      regimeSummary: 'Importación ordinaria; mantener placa de características y ficha técnica.',
      severity: 'info',
      permits: [],
      origin: 'Brasil',
      rgi2: 'Subpartida 8501.52 agrupa motores CA polifásicos con potencia nominal > 750 W y ≤ 75 kW.',
      rejectedCode: '8501.51.00.00',
      rejectedReason: 'Excluida porque aplica únicamente a motores de potencia ≤ 750 W (RGI 6).',
    };
  }
  return {
    hsCode: '8504.40.90.00',
    title: /inversor|solar/.test(q) ? 'Inversor cargador solar híbrido 5 kW' : query.slice(0, 72),
    officialDesc: 'Convertidores estáticos (inversores DC/AC con controlador MPPT integrado)',
    adValorem: 10,
    regimeCode: 'Libre',
    regimeSummary: 'Libre importación ordinaria; conservar ficha técnica y certificado de conformidad eléctrica.',
    severity: 'info',
    permits: [],
    origin: 'China',
    rgi2: 'Subpartida 8504.40 cubre convertidores estáticos de potencia eléctrica.',
    rejectedCode: '8501.72.10.00',
    rejectedReason: 'Aplica a generadores fotovoltaicos, no a inversores/convertidores estáticos.',
  };
}
