import { describe, expect, it } from 'vitest';

import {
  normalizeMaterial,
  normalizeUnit,
  normalizePresentation,
} from './vocab.js';

describe('normalizeMaterial (F2-21)', () => {
  it('reconoce el material canónico', () => {
    expect(normalizeMaterial('algodón').normalized).toBe('algodon');
    expect(normalizeMaterial('acero').normalized).toBe('acero');
  });

  it('reconoce sinónimos', () => {
    expect(normalizeMaterial('cotton').normalized).toBe('algodon');
    expect(normalizeMaterial('poliester').normalized).toBe('poliester');
    expect(normalizeMaterial('steel').normalized).toBe('acero');
  });

  it('desconocido → unknown con texto original preservado', () => {
    const r = normalizeMaterial('fibra exótica desconocida');
    expect(r.normalized).toBe('unknown');
    expect(r.original).toBe('fibra exótica desconocida');
  });

  it('es insensible a mayúsculas y espacios', () => {
    expect(normalizeMaterial('  ALGODÓN  ').normalized).toBe('algodon');
  });
});

describe('normalizeUnit (F2-22)', () => {
  it('cubre las unidades del arancel', () => {
    expect(normalizeUnit('kg').normalized).toBe('kg');
    expect(normalizeUnit('u').normalized).toBe('u');
    expect(normalizeUnit('m²').normalized).toBe('m²');
    expect(normalizeUnit('m³').normalized).toBe('m³');
    expect(normalizeUnit('ℓ').normalized).toBe('ℓ');
    expect(normalizeUnit('2u').normalized).toBe('2u');
    expect(normalizeUnit('1000 u').normalized).toBe('1000 u');
  });

  it('mapea sinónimos de unidad', () => {
    expect(normalizeUnit('kilogramo').normalized).toBe('kg');
    expect(normalizeUnit('unidad').normalized).toBe('u');
    expect(normalizeUnit('litro').normalized).toBe('ℓ');
  });

  it('desconocido → unknown con texto original', () => {
    const r = normalizeUnit('libras');
    expect(r.normalized).toBe('unknown');
    expect(r.original).toBe('libras');
  });
});

describe('normalizePresentation (F2-23)', () => {
  it('reconoce las presentaciones controladas', () => {
    expect(normalizePresentation('granel').normalized).toBe('bulk');
    expect(normalizePresentation('menudeo').normalized).toBe('retail');
    expect(normalizePresentation('dosificado').normalized).toBe('dosified');
    expect(normalizePresentation('desmontado').normalized).toBe('disassembled');
    expect(normalizePresentation('surtido').normalized).toBe('assortment');
  });

  it('reconoce sinónimos en inglés', () => {
    expect(normalizePresentation('bulk').normalized).toBe('bulk');
    expect(normalizePresentation('retail').normalized).toBe('retail');
  });

  it('desconocido → unknown con texto original', () => {
    const r = normalizePresentation('empaque especial');
    expect(r.normalized).toBe('unknown');
    expect(r.original).toBe('empaque especial');
  });
});
