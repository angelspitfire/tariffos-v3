export type LeadInquiryIntent = 'demo' | 'enterprise';

export interface LeadFormValues {
  intents: LeadInquiryIntent[];
  name: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  volume: string;
  enterpriseTeam: string;
  enterpriseModules: string[];
  notes: string;
}

export interface LeadFieldErrors {
  intents?: string;
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  notes?: string;
}

export const MAX_LEAD_NAME_LENGTH = 120;
export const MAX_LEAD_COMPANY_LENGTH = 160;
export const MAX_LEAD_PHONE_LENGTH = 40;
export const MAX_LEAD_NOTES_LENGTH = 600;

export const LEAD_INTENT_OPTIONS: readonly { id: LeadInquiryIntent; label: string }[] = [
  { id: 'demo', label: 'Demo con tu factura' },
  { id: 'enterprise', label: 'Plan Enterprise a medida' },
] as const;

export const ENTERPRISE_VOLUME_PILLS: readonly { value: string; label: string }[] = [
  { value: '1,000-2,500/mes', label: '1,000 a 2,500 / mes' },
  { value: '2,500-5,000/mes', label: '2,500 a 5,000 / mes' },
  { value: '5,000-15,000/mes', label: '5,000 a 15,000 / mes' },
  { value: '15,000+/mes', label: '15,000+ / mes' },
] as const;

export const ENTERPRISE_TEAM_PILLS: readonly { value: string; label: string }[] = [
  { value: '5-10 usuarios', label: '5 a 10 operadores' },
  { value: '10-25 usuarios', label: '10 a 25 operadores' },
  { value: '25+ multi-sucursal', label: '25+ / multi-sucursal' },
] as const;

export const ENTERPRISE_MODULE_CHIPS: readonly { id: string; label: string }[] = [
  { id: 'Carga inicial catálogo SKU', label: 'Carga inicial catálogo SKU' },
  { id: 'Multi-sucursal y roles', label: 'Multi-sucursal y roles' },
  { id: 'Multi-jurisdicción (CO/PA/MX)', label: 'Multi-jurisdicción (CO/PA/MX)' },
  { id: 'Integración ERP / SIDUNEA', label: 'Integración ERP / SIDUNEA' },
  { id: 'SLA prioritario y onboarding', label: 'SLA prioritario y onboarding' },
] as const;

export const LEAD_COUNTRY_OPTIONS: readonly { code: string; label: string }[] = [
  { code: 'VE', label: 'Venezuela (SENIAT)' },
  { code: 'CO', label: 'Colombia (DIAN)' },
  { code: 'PA', label: 'Panamá (ANA)' },
  { code: 'MX', label: 'México (SAT / ANAM)' },
] as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_ALLOWED_PATTERN = /^[+\d\s().-]+$/;

export function validateLeadForm(values: LeadFormValues): LeadFieldErrors {
  const errors: LeadFieldErrors = {};

  if (values.intents.length === 0) {
    errors.intents = 'Selecciona al menos una opción (demo guiada o plan a medida).';
  }

  const trimmedName = values.name.trim();
  if (trimmedName.length < 2) {
    errors.name = 'Ingresa tu nombre completo (mínimo 2 caracteres).';
  } else if (trimmedName.length > MAX_LEAD_NAME_LENGTH) {
    errors.name = `El nombre no puede superar ${MAX_LEAD_NAME_LENGTH} caracteres.`;
  }

  const trimmedCompany = values.company.trim();
  if (trimmedCompany.length < 2) {
    errors.company = 'Indica el nombre de tu agencia o empresa.';
  } else if (trimmedCompany.length > MAX_LEAD_COMPANY_LENGTH) {
    errors.company = `La empresa no puede superar ${MAX_LEAD_COMPANY_LENGTH} caracteres.`;
  }

  const trimmedEmail = values.email.trim();
  if (!trimmedEmail) {
    errors.email = 'Ingresa un correo electrónico corporativo o de contacto.';
  } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
    errors.email = 'Ingresa un correo electrónico válido (ej. gerencia@agencia.ve).';
  }

  const trimmedPhone = values.phone.trim();
  if (trimmedPhone.length > 0) {
    const digitsOnly = trimmedPhone.replace(/\D/g, '');
    if (
      trimmedPhone.length > MAX_LEAD_PHONE_LENGTH ||
      !PHONE_ALLOWED_PATTERN.test(trimmedPhone) ||
      digitsOnly.length < 7 ||
      digitsOnly.length > 15
    ) {
      errors.phone = 'Ingresa un teléfono o WhatsApp válido (7 a 15 dígitos, ej. +58 412 555 0199).';
    }
  }

  const trimmedNotes = values.notes.trim();
  if (trimmedNotes.length > MAX_LEAD_NOTES_LENGTH) {
    errors.notes = `Los comentarios no pueden superar ${MAX_LEAD_NOTES_LENGTH} caracteres.`;
  }

  return errors;
}

export function hasLeadFormErrors(errors: LeadFieldErrors): boolean {
  return Object.values(errors).some((msg) => Boolean(msg));
}

export interface LeadNotesPayloadOptions {
  intents: readonly LeadInquiryIntent[];
  enterpriseTeam?: string;
  enterpriseModules?: readonly string[];
  notes: string;
}

export function formatLeadNotesPayload(options: LeadNotesPayloadOptions): string | undefined {
  const parts: string[] = [];
  if (options.intents.includes('demo')) parts.push('[Demo guiada]');
  if (options.intents.includes('enterprise')) {
    parts.push('[Plan Enterprise]');
    if (options.enterpriseTeam) parts.push(`Equipo: ${options.enterpriseTeam}.`);
    if (options.enterpriseModules && options.enterpriseModules.length > 0) {
      parts.push(`Módulos: ${options.enterpriseModules.join(', ')}.`);
    }
  }
  const trimmed = options.notes.trim();
  if (trimmed) parts.push(trimmed);
  if (parts.length === 0) return undefined;
  return parts.join(' ').slice(0, MAX_LEAD_NOTES_LENGTH);
}
