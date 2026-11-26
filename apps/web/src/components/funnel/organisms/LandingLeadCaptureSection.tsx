'use client';

import { useState, type FormEvent } from 'react';
import { AlertCircle, Check, CheckCircle2, Send } from 'lucide-react';
import {
  formatLeadNotesPayload,
  hasLeadFormErrors,
  LEAD_COUNTRY_OPTIONS,
  LEAD_INTENT_OPTIONS,
  LEAD_VOLUME_OPTIONS,
  MAX_LEAD_NOTES_LENGTH,
  validateLeadForm,
  type LeadFieldErrors,
  type LeadFormValues,
  type LeadInquiryIntent,
} from '@/lib/funnel/lead-form-validation';
import { LeadCaptureAside } from '../molecules/LeadCaptureAside';

const INITIAL_VALUES: LeadFormValues = {
  intents: ['demo'],
  name: '',
  company: '',
  email: '',
  phone: '',
  country: 'VE',
  volume: '250-1000/mes',
  notes: '',
};

const BASE_INPUT_CLS =
  'w-full rounded-xl border bg-surface-input px-3 py-2 text-sm text-ink-primary placeholder:text-ink-subtle focus:outline-none transition-colors';

function fieldInputClass(hasError?: string): string {
  return `${BASE_INPUT_CLS} ${
    hasError
      ? 'border-[var(--color-error)] focus:border-[var(--color-error)]'
      : 'border-border-subtle focus:border-accent-brand'
  }`;
}

export function LandingLeadCaptureSection() {
  const [values, setValues] = useState<LeadFormValues>(INITIAL_VALUES);
  const [fieldErrors, setFieldErrors] = useState<LeadFieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const updateField = <K extends keyof LeadFormValues>(key: K, nextValue: LeadFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: nextValue }));
    if (key in fieldErrors) {
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    }
    if (serverError) setServerError(null);
  };

  const toggleIntent = (intentId: LeadInquiryIntent) => {
    setValues((prev) => {
      const exists = prev.intents.includes(intentId);
      const nextIntents = exists
        ? prev.intents.filter((id) => id !== intentId)
        : [...prev.intents, intentId];
      return { ...prev, intents: nextIntents };
    });
    if (fieldErrors.intents) {
      setFieldErrors((prev) => ({ ...prev, intents: undefined }));
    }
    if (serverError) setServerError(null);
  };

  const validateSingleField = (key: keyof LeadFieldErrors) => {
    const nextErrors = validateLeadForm(values);
    setFieldErrors((prev) => ({ ...prev, [key]: nextErrors[key] }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errors = validateLeadForm(values);
    setFieldErrors(errors);
    if (hasLeadFormErrors(errors)) return;

    setSubmitting(true);
    setServerError(null);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email.trim(),
          name: values.name.trim(),
          company: values.company.trim(),
          phone: values.phone.trim() || undefined,
          country: values.country.trim().toUpperCase() || 'VE',
          volume: values.volume,
          notes: formatLeadNotesPayload(values.intents, values.notes),
          source: 'landing_contact_form',
          landingPath: '/',
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setServerError(json.error ?? 'No pudimos registrar tu solicitud. Verifica los datos.');
        return;
      }
      setSubmittedEmail(values.email.trim());
    } catch {
      setServerError('No pudimos conectar con el servidor. Intenta de nuevo en unos segundos.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmittedEmail(null);
    setValues(INITIAL_VALUES);
    setFieldErrors({});
    setServerError(null);
  };

  return (
    <section id="contacto" className="py-12 sm:py-16">
      <div className="max-w-[1040px] mx-auto px-4 sm:px-8">
        <div className="rounded-[24px] border border-border-subtle bg-surface-panel p-5 sm:p-7 shadow-card grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          <LeadCaptureAside />

          <div className="lg:col-span-7 pt-5 lg:pt-0 border-t lg:border-t-0 lg:border-l border-border-hairline lg:pl-8">
            {submittedEmail ? (
              <div className="py-4 space-y-4 text-center sm:text-left">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--color-success-soft)] text-[var(--color-success)]">
                  <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-ink-primary">Solicitud recibida</h3>
                  <p className="text-sm text-ink-secondary leading-relaxed">
                    Registramos tu contacto (<span className="font-semibold text-ink-primary">{submittedEmail}</span>). Nuestro equipo te escribirá en menos de 24 horas hábiles para coordinar tu{' '}
                    {values.intents.includes('enterprise') && values.intents.includes('demo')
                      ? 'demo guiada y cotización Enterprise'
                      : values.intents.includes('enterprise')
                        ? 'cotización Enterprise'
                        : 'demo guiada'}.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-full border border-border-strong text-xs font-semibold text-ink-primary hover:bg-surface-hover cursor-pointer transition-colors"
                >
                  Enviar otra consulta
                </button>
              </div>
            ) : (
              <form noValidate onSubmit={(e) => void handleSubmit(e)} className="space-y-3 text-xs">
                <fieldset className="space-y-1.5">
                  <legend className="font-semibold text-ink-secondary">
                    ¿Qué necesitas? * <span className="font-normal text-ink-muted">(puedes marcar ambas)</span>
                  </legend>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {LEAD_INTENT_OPTIONS.map((opt) => {
                      const isSelected = values.intents.includes(opt.id);
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          role="checkbox"
                          aria-checked={isSelected}
                          onClick={() => toggleIntent(opt.id)}
                          className={`px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2.5 text-left transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-accent-brand focus-visible:outline-offset-2 active:translate-y-px ${
                            isSelected
                              ? 'border-accent-brand bg-accent-soft text-ink-primary'
                              : fieldErrors.intents
                                ? 'border-[var(--color-error)] bg-surface-muted text-ink-secondary hover:text-ink-primary'
                                : 'border-border-subtle bg-surface-muted text-ink-secondary hover:text-ink-primary'
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? 'border-accent-brand bg-accent-brand text-white'
                                : 'border-border-strong bg-surface-input'
                            }`}
                          >
                            {isSelected ? <Check className="w-3 h-3" /> : null}
                          </span>
                          <span>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  {fieldErrors.intents ? (
                    <p role="alert" className="text-[11px] font-medium text-[var(--color-error)]">
                      {fieldErrors.intents}
                    </p>
                  ) : null}
                </fieldset>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block space-y-1">
                    <span className="font-semibold text-ink-secondary">Nombre completo *</span>
                    <input value={values.name} onChange={(e) => updateField('name', e.target.value)} onBlur={() => validateSingleField('name')} placeholder="Carlos Mendoza" aria-invalid={Boolean(fieldErrors.name)} className={fieldInputClass(fieldErrors.name)} />
                    {fieldErrors.name ? <p role="alert" className="text-[11px] font-medium text-[var(--color-error)]">{fieldErrors.name}</p> : null}
                  </label>

                  <label className="block space-y-1">
                    <span className="font-semibold text-ink-secondary">Empresa o agencia *</span>
                    <input value={values.company} onChange={(e) => updateField('company', e.target.value)} onBlur={() => validateSingleField('company')} placeholder="Aduanas del Caribe C.A." aria-invalid={Boolean(fieldErrors.company)} className={fieldInputClass(fieldErrors.company)} />
                    {fieldErrors.company ? <p role="alert" className="text-[11px] font-medium text-[var(--color-error)]">{fieldErrors.company}</p> : null}
                  </label>

                  <label className="block space-y-1">
                    <span className="font-semibold text-ink-secondary">Correo electrónico *</span>
                    <input type="email" value={values.email} onChange={(e) => updateField('email', e.target.value)} onBlur={() => validateSingleField('email')} placeholder="gerencia@agencia.ve" aria-invalid={Boolean(fieldErrors.email)} className={fieldInputClass(fieldErrors.email)} />
                    {fieldErrors.email ? <p role="alert" className="text-[11px] font-medium text-[var(--color-error)]">{fieldErrors.email}</p> : null}
                  </label>

                  <label className="block space-y-1">
                    <span className="font-semibold text-ink-secondary">Teléfono / WhatsApp</span>
                    <input type="tel" value={values.phone} onChange={(e) => updateField('phone', e.target.value)} onBlur={() => validateSingleField('phone')} placeholder="+58 412 555 0199" aria-invalid={Boolean(fieldErrors.phone)} className={fieldInputClass(fieldErrors.phone)} />
                    {fieldErrors.phone ? <p role="alert" className="text-[11px] font-medium text-[var(--color-error)]">{fieldErrors.phone}</p> : null}
                  </label>

                  <label className="block space-y-1">
                    <span className="font-semibold text-ink-secondary">País</span>
                    <select value={values.country} onChange={(e) => updateField('country', e.target.value)} className={fieldInputClass()}>
                      {LEAD_COUNTRY_OPTIONS.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
                    </select>
                  </label>

                  <label className="block space-y-1">
                    <span className="font-semibold text-ink-secondary">Volumen mensual estimado</span>
                    <select value={values.volume} onChange={(e) => updateField('volume', e.target.value)} className={fieldInputClass()}>
                      {LEAD_VOLUME_OPTIONS.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
                    </select>
                  </label>
                </div>

                <label className="block space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-ink-secondary">Comentarios o requerimientos</span>
                    <span className="font-mono text-[10px] text-ink-muted tabular-nums">{values.notes.length}/{MAX_LEAD_NOTES_LENGTH}</span>
                  </div>
                  <textarea rows={2} value={values.notes} onChange={(e) => updateField('notes', e.target.value)} onBlur={() => validateSingleField('notes')} placeholder="Tipo de mercancías, número de operadores, multi-sucursal o catálogo SKU..." aria-invalid={Boolean(fieldErrors.notes)} className={fieldInputClass(fieldErrors.notes)} />
                  {fieldErrors.notes ? <p role="alert" className="text-[11px] font-medium text-[var(--color-error)]">{fieldErrors.notes}</p> : null}
                </label>

                {serverError ? (
                  <div role="alert" className="flex items-start gap-2 rounded-xl border border-[var(--color-error-border)] bg-[var(--color-error-soft)] px-3 py-2 text-xs font-medium text-[var(--color-error)]">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{serverError}</span>
                  </div>
                ) : null}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <span className="text-[11px] text-ink-muted">* Campos obligatorios</span>
                  <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-full bg-accent-brand px-5 min-h-[40px] text-xs font-semibold text-white hover:bg-accent-brand-hover disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-accent-brand focus-visible:outline-offset-2 active:translate-y-px">
                    <Send className="w-3.5 h-3.5" aria-hidden="true" />
                    {submitting ? 'Enviando...' : 'Solicitar contacto'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
