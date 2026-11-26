'use client';

import { useState, type FormEvent } from 'react';
import { AlertCircle, CheckCircle2, Send } from 'lucide-react';
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
} from '@/lib/funnel/lead-form-validation';
import { LeadCaptureAside } from '../molecules/LeadCaptureAside';

const INITIAL_VALUES: LeadFormValues = {
  intent: 'demo',
  name: '',
  company: '',
  email: '',
  phone: '',
  country: 'VE',
  volume: '250-1000/mes',
  notes: '',
};

const BASE_INPUT_CLS =
  'w-full rounded-xl border bg-white/95 dark:bg-surface-input px-3.5 py-2.5 text-sm text-ink-primary placeholder:text-ink-subtle focus:outline-none transition-colors';

function fieldInputClass(hasError?: string): string {
  return `${BASE_INPUT_CLS} ${
    hasError
      ? 'border-rose-500/80 dark:border-rose-400/70 focus:border-rose-600'
      : 'border-black/[0.1] dark:border-white/[0.12] focus:border-accent-brand'
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
          notes: formatLeadNotesPayload(values.intent, values.notes),
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
    <section id="contacto" className="py-20 sm:py-28">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        <div className="rounded-[28px] border border-black/[0.06] dark:border-white/[0.08] bg-white/75 dark:bg-white/[0.04] backdrop-blur-md p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          <LeadCaptureAside />

          <div className="lg:col-span-7 rounded-[22px] border border-black/[0.06] dark:border-white/[0.08] bg-white/90 dark:bg-[#0e1424]/90 p-5 sm:p-7">
            {submittedEmail ? (
              <div className="py-6 space-y-5 text-center sm:text-left">
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-ink-primary">Solicitud recibida</h3>
                  <p className="text-sm text-ink-secondary leading-relaxed">
                    Registramos tu contacto (<span className="font-semibold text-ink-primary">{submittedEmail}</span>). Nuestro equipo te escribirá en menos de 24 horas hábiles para coordinar tu{' '}
                    {values.intent === 'enterprise' ? 'cotización Enterprise' : 'demo guiada'}.
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
              <form noValidate onSubmit={(e) => void handleSubmit(e)} className="space-y-4 text-xs">
                <fieldset className="space-y-1.5">
                  <legend className="font-semibold text-ink-secondary">¿Qué necesitas?</legend>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {LEAD_INTENT_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        aria-pressed={values.intent === opt.id}
                        onClick={() => updateField('intent', opt.id)}
                        className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                          values.intent === opt.id
                            ? 'border-accent-brand bg-accent-soft text-accent-ink'
                            : 'border-black/[0.09] dark:border-white/[0.12] bg-white/70 dark:bg-white/[0.03] text-ink-secondary hover:text-ink-primary'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block space-y-1.5">
                    <span className="font-semibold text-ink-secondary">Nombre completo *</span>
                    <input value={values.name} onChange={(e) => updateField('name', e.target.value)} onBlur={() => validateSingleField('name')} placeholder="Carlos Mendoza" aria-invalid={Boolean(fieldErrors.name)} className={fieldInputClass(fieldErrors.name)} />
                    {fieldErrors.name ? <p role="alert" className="text-[11px] font-medium text-rose-600 dark:text-rose-400">{fieldErrors.name}</p> : null}
                  </label>

                  <label className="block space-y-1.5">
                    <span className="font-semibold text-ink-secondary">Empresa o agencia *</span>
                    <input value={values.company} onChange={(e) => updateField('company', e.target.value)} onBlur={() => validateSingleField('company')} placeholder="Aduanas del Caribe C.A." aria-invalid={Boolean(fieldErrors.company)} className={fieldInputClass(fieldErrors.company)} />
                    {fieldErrors.company ? <p role="alert" className="text-[11px] font-medium text-rose-600 dark:text-rose-400">{fieldErrors.company}</p> : null}
                  </label>

                  <label className="block space-y-1.5">
                    <span className="font-semibold text-ink-secondary">Correo electrónico *</span>
                    <input type="email" value={values.email} onChange={(e) => updateField('email', e.target.value)} onBlur={() => validateSingleField('email')} placeholder="gerencia@agencia.ve" aria-invalid={Boolean(fieldErrors.email)} className={fieldInputClass(fieldErrors.email)} />
                    {fieldErrors.email ? <p role="alert" className="text-[11px] font-medium text-rose-600 dark:text-rose-400">{fieldErrors.email}</p> : null}
                  </label>

                  <label className="block space-y-1.5">
                    <span className="font-semibold text-ink-secondary">Teléfono / WhatsApp</span>
                    <input type="tel" value={values.phone} onChange={(e) => updateField('phone', e.target.value)} onBlur={() => validateSingleField('phone')} placeholder="+58 412 555 0199" aria-invalid={Boolean(fieldErrors.phone)} className={fieldInputClass(fieldErrors.phone)} />
                    {fieldErrors.phone ? <p role="alert" className="text-[11px] font-medium text-rose-600 dark:text-rose-400">{fieldErrors.phone}</p> : null}
                  </label>

                  <label className="block space-y-1.5">
                    <span className="font-semibold text-ink-secondary">País</span>
                    <select value={values.country} onChange={(e) => updateField('country', e.target.value)} className={fieldInputClass()}>
                      {LEAD_COUNTRY_OPTIONS.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
                    </select>
                  </label>

                  <label className="block space-y-1.5">
                    <span className="font-semibold text-ink-secondary">Volumen mensual estimado</span>
                    <select value={values.volume} onChange={(e) => updateField('volume', e.target.value)} className={fieldInputClass()}>
                      {LEAD_VOLUME_OPTIONS.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
                    </select>
                  </label>
                </div>

                <label className="block space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-ink-secondary">Comentarios o requerimientos</span>
                    <span className="font-mono text-[10px] text-ink-muted tabular-nums">{values.notes.length}/{MAX_LEAD_NOTES_LENGTH}</span>
                  </div>
                  <textarea rows={3} value={values.notes} onChange={(e) => updateField('notes', e.target.value)} onBlur={() => validateSingleField('notes')} placeholder="Tipo de mercancías, número de operadores, multi-sucursal o catálogo SKU..." aria-invalid={Boolean(fieldErrors.notes)} className={fieldInputClass(fieldErrors.notes)} />
                  {fieldErrors.notes ? <p role="alert" className="text-[11px] font-medium text-rose-600 dark:text-rose-400">{fieldErrors.notes}</p> : null}
                </label>

                {serverError ? (
                  <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-xs font-medium text-rose-700 dark:text-rose-300">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{serverError}</span>
                  </div>
                ) : null}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <span className="text-[11px] text-ink-muted">* Campos obligatorios</span>
                  <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-full bg-accent-brand px-6 min-h-[44px] text-xs font-semibold text-white hover:bg-accent-brand-hover disabled:opacity-50 cursor-pointer transition-colors">
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
