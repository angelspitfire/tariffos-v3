'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { AlertCircle, Check, Send } from 'lucide-react';
import {
  formatLeadNotesPayload,
  hasLeadFormErrors,
  LEAD_INTENT_OPTIONS,
  validateLeadForm,
  type LeadFieldErrors,
  type LeadFormValues,
  type LeadInquiryIntent,
} from '@/lib/funnel/lead-form-validation';
import { LeadCaptureSuccessCard } from '../molecules/LeadCaptureSuccessCard';
import { LeadEnterpriseFields } from '../molecules/LeadEnterpriseFields';

export const SELECT_LEAD_INTENT_EVENT = 'tariffos:select-lead-intent';

const INITIAL_VALUES: LeadFormValues = {
  intents: ['demo'],
  name: '',
  company: '',
  email: '',
  phone: '',
  country: 'VE',
  volume: '2,500-5,000/mes',
  enterpriseTeam: '10-25 usuarios',
  enterpriseModules: ['Carga inicial catálogo SKU'],
  notes: '',
};

const BASE_INPUT_CLS =
  'w-full min-h-[44px] rounded-xl border bg-surface-input px-3 text-sm text-ink-primary placeholder:text-ink-subtle outline-2 outline-transparent -outline-offset-2 focus-visible:outline-accent-brand transition-colors';

function fieldInputClass(hasError?: string): string {
  return `${BASE_INPUT_CLS} ${
    hasError ? 'border-[var(--color-error)]' : 'border-border-strong/70 hover:border-ink-muted'
  }`;
}

export function LandingLeadCaptureSection() {
  const [values, setValues] = useState<LeadFormValues>(INITIAL_VALUES);
  const [fieldErrors, setFieldErrors] = useState<LeadFieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const showEnterpriseFields = values.intents.includes('enterprise');

  useEffect(() => {
    const onSelectIntent = (event: Event) => {
      const raw = (
        event as CustomEvent<LeadInquiryIntent | { intent: LeadInquiryIntent; notes?: string }>
      ).detail;
      const intent = typeof raw === 'string' ? raw : raw?.intent;
      if (intent !== 'demo' && intent !== 'enterprise') return;
      const prefilledNotes = typeof raw === 'object' ? raw.notes : undefined;
      setSubmittedEmail(null);
      setFieldErrors({});
      setServerError(null);
      setValues((prev) => ({
        ...prev,
        intents: [intent],
        ...(prefilledNotes ? { notes: prefilledNotes } : {}),
      }));
    };
    window.addEventListener(SELECT_LEAD_INTENT_EVENT, onSelectIntent);
    return () => window.removeEventListener(SELECT_LEAD_INTENT_EVENT, onSelectIntent);
  }, []);

  const updateField = <K extends keyof LeadFormValues>(key: K, nextValue: LeadFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: nextValue }));
    if (key in fieldErrors) setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
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
    if (fieldErrors.intents) setFieldErrors((prev) => ({ ...prev, intents: undefined }));
    if (serverError) setServerError(null);
  };

  const toggleEnterpriseModule = (moduleId: string) => {
    setValues((prev) => {
      const exists = prev.enterpriseModules.includes(moduleId);
      const nextModules = exists
        ? prev.enterpriseModules.filter((m) => m !== moduleId)
        : [...prev.enterpriseModules, moduleId];
      return { ...prev, enterpriseModules: nextModules };
    });
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
          country: showEnterpriseFields ? values.country.trim().toUpperCase() || 'VE' : 'VE',
          volume: showEnterpriseFields ? values.volume : undefined,
          notes: formatLeadNotesPayload({
            intents: values.intents,
            enterpriseTeam: showEnterpriseFields ? values.enterpriseTeam : undefined,
            enterpriseModules: showEnterpriseFields ? values.enterpriseModules : undefined,
            notes: showEnterpriseFields ? values.notes : '',
          }),
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

  const submitLabel = submitting
    ? 'Enviando...'
    : showEnterpriseFields && !values.intents.includes('demo')
      ? 'Solicitar cotización Enterprise'
      : 'Solicitar contacto';

  return (
    <section id="contacto" className="py-20 sm:py-24">
      <div className="max-w-[1040px] mx-auto px-4 sm:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-[clamp(2rem,3vw+0.8rem,3.25rem)] font-medium tracking-[-0.03em] text-ink-primary leading-[1.08] [text-wrap:balance] mx-auto">
            ¿Necesitas una demo guiada o un plan a medida para tu agencia?
          </h2>
          <p className="text-base text-ink-secondary leading-relaxed">
            Probamos TariffOS en vivo con una factura real de tu operación o cotizamos tu despliegue Enterprise en menos de 24 horas hábiles.
          </p>
        </div>

        <div className="max-w-[680px] mx-auto rounded-[24px] border border-border-subtle bg-surface-panel p-6 sm:p-8 shadow-card">
          {submittedEmail ? (
            <LeadCaptureSuccessCard submittedEmail={submittedEmail} intents={values.intents} onReset={resetForm} />
          ) : (
            <form noValidate onSubmit={(e) => void handleSubmit(e)} className="space-y-4 text-xs">
              <fieldset className="space-y-1.5">
                <legend className="font-semibold text-ink-secondary">
                  ¿Qué necesitas? *
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {LEAD_INTENT_OPTIONS.map((opt) => {
                    const isSelected = values.intents.includes(opt.id);
                    return (
                      <label
                        key={opt.id}
                        className={`min-h-[44px] px-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2.5 cursor-pointer transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent-brand has-[:focus-visible]:outline-offset-2 active:translate-y-px ${
                          isSelected
                            ? 'border-accent-brand bg-accent-soft text-ink-primary'
                            : fieldErrors.intents
                              ? 'border-[var(--color-error)] bg-surface-muted text-ink-secondary hover:text-ink-primary'
                              : 'border-border-subtle bg-surface-muted text-ink-secondary hover:text-ink-primary'
                        }`}
                      >
                        <input type="checkbox" checked={isSelected} onChange={() => toggleIntent(opt.id)} className="sr-only" />
                        <span aria-hidden="true" className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'border-accent-brand bg-accent-brand text-white' : 'border-border-strong bg-surface-input'}`}>
                          {isSelected ? <Check className="w-3 h-3" /> : null}
                        </span>
                        <span>{opt.label}</span>
                      </label>
                    );
                  })}
                </div>
                {fieldErrors.intents ? <p role="alert" className="text-[11px] font-medium text-[var(--color-error)]">{fieldErrors.intents}</p> : null}
              </fieldset>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <label className="block space-y-1">
                  <span className="font-semibold text-ink-secondary">Nombre completo *</span>
                  <input value={values.name} onChange={(e) => updateField('name', e.target.value)} onBlur={() => validateSingleField('name')} placeholder="Carlos Mendoza" aria-required="true" aria-invalid={Boolean(fieldErrors.name)} aria-describedby={fieldErrors.name ? 'lead-name-error' : undefined} className={fieldInputClass(fieldErrors.name)} />
                  {fieldErrors.name ? <p id="lead-name-error" role="alert" className="text-[11px] font-medium text-[var(--color-error)]">{fieldErrors.name}</p> : null}
                </label>

                <label className="block space-y-1">
                  <span className="font-semibold text-ink-secondary">Empresa o agencia *</span>
                  <input value={values.company} onChange={(e) => updateField('company', e.target.value)} onBlur={() => validateSingleField('company')} placeholder="Aduanas del Caribe C.A." aria-required="true" aria-invalid={Boolean(fieldErrors.company)} aria-describedby={fieldErrors.company ? 'lead-company-error' : undefined} className={fieldInputClass(fieldErrors.company)} />
                  {fieldErrors.company ? <p id="lead-company-error" role="alert" className="text-[11px] font-medium text-[var(--color-error)]">{fieldErrors.company}</p> : null}
                </label>

                <label className="block space-y-1">
                  <span className="font-semibold text-ink-secondary">Correo electrónico *</span>
                  <input type="email" value={values.email} onChange={(e) => updateField('email', e.target.value)} onBlur={() => validateSingleField('email')} placeholder="gerencia@agencia.ve" aria-required="true" aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? 'lead-email-error' : undefined} className={fieldInputClass(fieldErrors.email)} />
                  {fieldErrors.email ? <p id="lead-email-error" role="alert" className="text-[11px] font-medium text-[var(--color-error)]">{fieldErrors.email}</p> : null}
                </label>

                <label className="block space-y-1">
                  <span className="font-semibold text-ink-secondary">Teléfono / WhatsApp</span>
                  <input type="tel" value={values.phone} onChange={(e) => updateField('phone', e.target.value)} onBlur={() => validateSingleField('phone')} placeholder="+58 412 555 0199" aria-invalid={Boolean(fieldErrors.phone)} aria-describedby={fieldErrors.phone ? 'lead-phone-error' : undefined} className={fieldInputClass(fieldErrors.phone)} />
                  {fieldErrors.phone ? <p id="lead-phone-error" role="alert" className="text-[11px] font-medium text-[var(--color-error)]">{fieldErrors.phone}</p> : null}
                </label>
              </div>

              {showEnterpriseFields ? (
                <LeadEnterpriseFields
                  values={values}
                  fieldErrors={fieldErrors}
                  inputClass={fieldInputClass}
                  onChangeField={updateField}
                  onToggleModule={toggleEnterpriseModule}
                  onBlurNotes={() => validateSingleField('notes')}
                />
              ) : null}

              {serverError ? (
                <div role="alert" className="flex items-start gap-2 rounded-xl border border-[var(--color-error-border)] bg-[var(--color-error-soft)] px-3 py-2 text-xs font-medium text-[var(--color-error)]">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{serverError}</span>
                </div>
              ) : null}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border-hairline">
                <span className="text-xs text-ink-muted">
                  O escríbenos a{' '}
                  <a href="mailto:soporte@tariffos.app" className="font-semibold text-ink-primary hover:text-accent-ink underline-offset-4 hover:underline">
                    soporte@tariffos.app
                  </a>
                </span>
                <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-full bg-accent-brand px-6 min-h-[44px] text-xs font-semibold text-white hover:bg-accent-brand-hover disabled:opacity-55 disabled:cursor-not-allowed cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-accent-brand focus-visible:outline-offset-2 active:translate-y-px whitespace-nowrap">
                  <Send className="w-3.5 h-3.5" aria-hidden="true" />
                  {submitLabel}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
