import { describe, expect, it } from 'vitest';
import {
  formatLeadNotesPayload,
  hasLeadFormErrors,
  MAX_LEAD_NOTES_LENGTH,
  validateLeadForm,
  type LeadFormValues,
} from './lead-form-validation';

const VALID_FORM: LeadFormValues = {
  intents: ['demo'],
  name: 'Carlos Mendoza',
  company: 'Aduanas del Caribe C.A.',
  email: 'carlos@caribe.ve',
  phone: '+58 412 555 0199',
  country: 'VE',
  volume: '2,500-5,000/mes',
  enterpriseTeam: '10-25 usuarios',
  enterpriseModules: ['Carga inicial catálogo SKU'],
  notes: 'Necesitamos validar lotes de 40 SKUs.',
};

describe('validateLeadForm', () => {
  it('returns no errors for a valid B2B inquiry', () => {
    const errors = validateLeadForm(VALID_FORM);
    expect(hasLeadFormErrors(errors)).toBe(false);
    expect(errors).toEqual({});
  });

  it('requires at least one selected intent option', () => {
    const errors = validateLeadForm({ ...VALID_FORM, intents: [] });
    expect(errors.intents).toMatch(/al menos una opción/i);
  });

  it('requires name, company, and valid email', () => {
    const errors = validateLeadForm({
      ...VALID_FORM,
      name: 'A',
      company: '',
      email: 'correo-invalido',
    });
    expect(hasLeadFormErrors(errors)).toBe(true);
    expect(errors.name).toMatch(/mínimo 2 caracteres/i);
    expect(errors.company).toMatch(/agencia o empresa/i);
    expect(errors.email).toMatch(/correo electrónico válido/i);
  });

  it('validates optional phone format when provided and allows empty phone', () => {
    expect(validateLeadForm({ ...VALID_FORM, phone: '' }).phone).toBeUndefined();
    expect(validateLeadForm({ ...VALID_FORM, phone: '123' }).phone).toMatch(/7 a 15 dígitos/i);
    expect(validateLeadForm({ ...VALID_FORM, phone: 'abc-1234567' }).phone).toMatch(/teléfono/i);
  });

  it('rejects notes longer than MAX_LEAD_NOTES_LENGTH', () => {
    const errors = validateLeadForm({
      ...VALID_FORM,
      notes: 'x'.repeat(MAX_LEAD_NOTES_LENGTH + 1),
    });
    expect(errors.notes).toMatch(/600 caracteres/i);
  });

  it('formats notes with interactive Enterprise scope (team + modules) and enforces max length', () => {
    expect(
      formatLeadNotesPayload({
        intents: ['enterprise'],
        enterpriseTeam: '25+ multi-sucursal',
        enterpriseModules: ['Carga inicial catálogo SKU', 'Integración ERP / SIDUNEA'],
        notes: 'Operamos en La Guaira y Puerto Cabello',
      }),
    ).toBe(
      '[Plan Enterprise] Equipo: 25+ multi-sucursal. Módulos: Carga inicial catálogo SKU, Integración ERP / SIDUNEA. Operamos en La Guaira y Puerto Cabello',
    );
    expect(formatLeadNotesPayload({ intents: ['demo'], notes: '' })).toBe('[Demo guiada]');
  });
});
