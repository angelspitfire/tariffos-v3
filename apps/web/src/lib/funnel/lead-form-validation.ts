export type LeadInquiryIntent = 'demo' | 'enterprise';

export interface LeadFormValues {
  intents: LeadInquiryIntent[];
  name: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  volume: string;
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

export const LEAD_COUNTRY_OPTIONS: readonly { code: string; label: string }[] = [
  { code: 'VE', label: 'Venezuela (SENIAT)' },
  { code: 'CO', label: 'Colombia (DIAN)' },
  { code: 'PA', label: 'Panamá (ANA)' },
  { code: 'MX', label: 'México (SAT / ANAM)' },
] as const;

export const LEAD_VOLUME_OPTIONS: readonly { value: string; label: string }[] = [
  { value: '1-250/mes', label: 'Hasta 250 clasificaciones / mes (Piloto)' },
  { value: '250-1000/mes', label: '250 a 1,000 clasificaciones / mes (Agencia)' },
  { value: '1000-5000/mes', label: '1,000 a 5,000 clasificaciones / mes (Enterprise)' },
  { value: '5000+/mes', label: 'Más de 5,000 clasificaciones / mes (Multi-sucursal)' },
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

export function formatLeadNotesPayload(
  intents: readonly LeadInquiryIntent[],
  notes: string,
): string | undefined {
  const tags: string[] = [];
  if (intents.includes('demo')) tags.push('[Demo guiada]');
  if (intents.includes('enterprise')) tags.push('[Plan Enterprise]');
  const prefix = tags.join(' ');
  const trimmed = notes.trim();
  if (!trimmed) return prefix || undefined;
  const combined = prefix ? `${prefix} ${trimmed}` : trimmed;
  return combined.slice(0, MAX_LEAD_NOTES_LENGTH);
}
