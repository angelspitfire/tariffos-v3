import { describe, expect, it } from 'vitest';

import { CountryProfileSchema, createCountryProfile } from './profile.js';
import type { CountryProfile } from './profile.js';

describe('createCountryProfile', () => {
  it('VE declara niveles [2, 4, 6, 7, 8, 9, 10] y terminal 10', () => {
    const profile = createCountryProfile('VE');
    expect(profile.levels).toEqual([2, 4, 6, 7, 8, 9, 10]);
    expect(profile.terminal).toBe(10);
  });

  it('MX declara niveles [2, 4, 6, 7, 8] y terminal 8', () => {
    const profile = createCountryProfile('MX');
    expect(profile.levels).toEqual([2, 4, 6, 7, 8]);
    expect(profile.terminal).toBe(8);
  });

  it('SA declara niveles [2, 4, 6] y terminal 6', () => {
    const profile = createCountryProfile('SA');
    expect(profile.levels).toEqual([2, 4, 6]);
    expect(profile.terminal).toBe(6);
  });

  it('un capítulo puede marcarse sin subpartida SA o no aplicable', () => {
    const ve = createCountryProfile('VE');
    expect(ve.chapters.get('98')?.noSaSubheading).toBe(true);
    const mx = createCountryProfile('MX');
    expect(mx.chapters.get('98')?.notApplicable).toBe(true);
  });

  it('rechaza un país desconocido', () => {
    expect(() => createCountryProfile('AR')).toThrow('País no soportado');
    expect(() => createCountryProfile('')).toThrow('País no soportado');
  });
});

describe('CountryProfileSchema', () => {
  const profile: CountryProfile = createCountryProfile('SA');

  it('valida un perfil completo con capítulos como Map', () => {
    const parsed = CountryProfileSchema.parse(profile);
    expect(parsed.code).toBe('SA');
    expect(parsed.levels).toEqual([2, 4, 6]);
    expect(parsed.terminal).toBe(6);
    expect(parsed.chapters).toBeInstanceOf(Map);
    expect(parsed.chapters.size).toBe(0);
  });
});
