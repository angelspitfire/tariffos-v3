import { describe, expect, it } from 'vitest';
import { ZodError } from 'zod';
import {
  ClassificationDiagnosticV1Schema,
  MerceologicalSheetSchema,
  isClassificationDiagnosticV1,
} from '../index.js';

/** Golden fixture — docs/program/classification-diagnostic-schema.md §10.1. */
const VAPEADOR_V1 = {
  meta: {
    timestamp: '2026-05-19T12:00:00.000Z',
    paisDestino: 'VE',
    idioma: 'es',
    sessionId: 'session-vape-001',
    tenantId: 'tenant-demo',
    schemaVersion: '1',
  },
  analisisMerceologicoUniversal: {
    nombreComercial: 'Vapeador desechable ElfBar sandía',
    morfologia: {
      materiaPrimaria: 'Solución con nicotina (propilenglicol/glicerina)',
      materiaSecundaria: 'Carcasa plástica con batería de litio integrada',
      componentesCriticos: ['Nicotina 5%', 'Resistencia integrada', 'Un solo cuerpo cerrado'],
    },
    funcionPrincipal: 'Inhalación de vapor con nicotina sin combustión, listo para uso',
    presentacionComercial: 'Unidad desechable cerrada, venta al por menor',
    codigoOma6Digitos: '2404.12',
    reglasGeneralesInterpretacion: [1, 6],
    sustentoTecnico:
      'Partida 24.04 — preparaciones con nicotina para inhalación sin combustión, en dispositivo desechable de un solo cuerpo (7.ª Enmienda OMA).',
  },
  localizacionPais: {
    codigoArancelarioNacional: '2404.12.00.00',
    descripcionArancelLocal: 'Los demás, que contengan nicotina',
    regimenLegalYPermisos: [
      {
        entidadReguladora: 'MPPS',
        tipoPermiso: 'Registro sanitario — productos con nicotina',
        obligatorioParaDespacho: true,
        explicacionAmigable:
          'Al contener nicotina, necesitas registro sanitario antes del embarque.',
      },
    ],
    cargaImpositiva: {
      arancelGeneralAdv: 0,
      iva: 16,
      dataSource: 'pending',
    },
  },
  interfazUsuario: {
    explicacionColoquial:
      'Tu vapeador desechable con nicotina entra en la categoría internacional de sustitutos del tabaco para inhalación, no como aparato eléctrico suelto.',
    alertasCriticas: [
      'Tramita registro sanitario antes de importar.',
      'Confirma restricciones de transporte para baterías de litio.',
    ],
  },
  status: 'COMPLETED',
  confidence: 0.88,
};

describe('ClassificationDiagnosticV1Schema', () => {
  it('parses the §10.1 golden fixture', () => {
    const parsed = ClassificationDiagnosticV1Schema.parse(VAPEADOR_V1);
    expect(parsed.meta.schemaVersion).toBe('1');
    expect(parsed.analisisMerceologicoUniversal.codigoOma6Digitos).toBe('2404.12');
    expect(parsed.status).toBe('COMPLETED');
    expect(parsed.interfazUsuario.alertasCriticas).toHaveLength(2);
  });

  it('passes the type guard for v1 payloads and rejects others', () => {
    expect(isClassificationDiagnosticV1(VAPEADOR_V1)).toBe(true);
    expect(isClassificationDiagnosticV1({ meta: { schemaVersion: '2' } })).toBe(false);
    expect(isClassificationDiagnosticV1(null)).toBe(false);
  });

  it('accepts NEEDS_INFO diagnostics with missingDocuments', () => {
    const needsInfo = {
      ...VAPEADOR_V1,
      status: 'NEEDS_INFO',
      missingDocuments: ['MSDS del e-liquid'],
    };
    expect(ClassificationDiagnosticV1Schema.parse(needsInfo).missingDocuments).toEqual([
      'MSDS del e-liquid',
    ]);
  });

  it('rejects an out-of-range confidence and unknown status', () => {
    expect(() => ClassificationDiagnosticV1Schema.parse({ ...VAPEADOR_V1, confidence: 1.2 })).toThrow(
      ZodError,
    );
    expect(() => ClassificationDiagnosticV1Schema.parse({ ...VAPEADOR_V1, status: 'RUNNING' })).toThrow(
      ZodError,
    );
  });

  it('rejects a malformed OMA hs6 code', () => {
    const bad = {
      ...VAPEADOR_V1,
      analisisMerceologicoUniversal: {
        ...VAPEADOR_V1.analisisMerceologicoUniversal,
        codigoOma6Digitos: '240412',
      },
    };
    expect(() => ClassificationDiagnosticV1Schema.parse(bad)).toThrow(ZodError);
  });
});

describe('MerceologicalSheetSchema', () => {
  const SHEET = {
    nombreComercial: 'Harina keto lista para usar',
    morfologia: {
      materiaPrimaria: 'Harina de almendra 70%',
      materiaSecundaria: 'Eritritol',
      componentesCriticos: ['Proteína de suero de leche (alérgeno lácteo)'],
    },
    funcionPrincipal: 'Sustituto de harina para repostería baja en carbohidratos',
    presentacionComercial: 'Bolsa 500 g, venta al por menor',
    categoria: 'CONSUMO',
    idioma: 'es',
  };

  it('parses a complete sheet, defaulting idioma and componentesCriticos', () => {
    const parsed = MerceologicalSheetSchema.parse({
      ...SHEET,
      morfologia: { materiaPrimaria: 'Harina de almendra 70%' },
      idioma: undefined,
    });
    expect(parsed.idioma).toBe('es');
    expect(parsed.morfologia.componentesCriticos).toEqual([]);
    expect(parsed.categoria).toBe('CONSUMO');
  });

  it('carries clarifReq so the pipeline can gate adjudication', () => {
    const parsed = MerceologicalSheetSchema.parse({
      ...SHEET,
      clarifReq: ['¿La harina contiene alérgenos declarables?'],
    });
    expect(parsed.clarifReq).toHaveLength(1);
  });

  it('rejects a sheet without a commercial name', () => {
    expect(() => MerceologicalSheetSchema.parse({ ...SHEET, nombreComercial: '' })).toThrow(ZodError);
  });
});
