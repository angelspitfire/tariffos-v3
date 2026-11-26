'use client';

import { useState, type FormEvent } from 'react';
import { CheckCircle2, Send } from 'lucide-react';

export function LandingLeadCaptureSection() {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('VE');
  const [volume, setVolume] = useState('100-400/mes');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || undefined,
          company: company.trim() || undefined,
          phone: phone.trim() || undefined,
          country: country.trim().toUpperCase() || 'VE',
          volume: volume.trim() || undefined,
          notes: notes.trim() || undefined,
          source: 'landing_contact_form',
          landingPath: '/',
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(json.error ?? 'No pudimos registrar tu solicitud. Verifica el correo.');
        return;
      }
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    'w-full rounded-xl border border-black/[0.1] dark:border-white/[0.12] bg-white/90 dark:bg-surface-input px-3.5 py-2.5 text-sm text-ink-primary placeholder:text-ink-subtle focus:border-accent-brand focus:outline-none';

  return (
    <section id="contacto" className="py-20 sm:py-24">
      <div className="max-w-[960px] mx-auto px-4 sm:px-8">
        <div className="rounded-[28px] border border-black/[0.06] dark:border-white/[0.08] bg-white/75 dark:bg-white/[0.04] backdrop-blur-md p-6 sm:p-10 space-y-6">
          <div className="max-w-2xl space-y-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-accent-soft text-accent-ink font-mono text-[11px] font-semibold">
              Asesoría y Licencias Corporate
            </span>
            <h2 className="text-[clamp(1.6rem,2.6vw+0.6rem,2.5rem)] font-medium tracking-[-0.025em] text-ink-primary leading-[1.12]">
              ¿Necesitas una demo guiada o un plan a medida para tu agencia?
            </h2>
            <p className="text-sm text-ink-secondary leading-relaxed">
              Déjanos tus datos y nuestro equipo activará un piloto asistido o cotizará tu volumen mensual.
            </p>
          </div>

          {submitted ? (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-sm font-bold text-ink-primary">Solicitud recibida</div>
                  <p className="text-xs text-ink-secondary">
                    Registramos tu contacto ({email}). Nuestro equipo comercial te escribirá muy pronto.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setEmail('');
                  setNotes('');
                }}
                className="px-3.5 py-2 rounded-full border border-border-strong text-xs font-semibold text-ink-primary hover:bg-surface-hover cursor-pointer"
              >
                Enviar otra consulta
              </button>
            </div>
          ) : (
            <form onSubmit={(e) => void handleSubmit(e)} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <label className="block space-y-1.5">
                <span className="font-semibold text-ink-secondary">Nombre completo</span>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Carlos Mendoza" className={inputCls} />
              </label>
              <label className="block space-y-1.5">
                <span className="font-semibold text-ink-secondary">Empresa o agencia</span>
                <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Aduanas del Caribe C.A." className={inputCls} />
              </label>
              <label className="block space-y-1.5">
                <span className="font-semibold text-ink-secondary">Correo electrónico *</span>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="gerencia@agencia.ve" className={inputCls} />
              </label>
              <label className="block space-y-1.5">
                <span className="font-semibold text-ink-secondary">Teléfono / WhatsApp</span>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+58 412 555 0199" className={inputCls} />
              </label>
              <label className="block space-y-1.5">
                <span className="font-semibold text-ink-secondary">País</span>
                <select value={country} onChange={(e) => setCountry(e.target.value)} className={inputCls}>
                  <option value="VE">Venezuela (SENIAT)</option>
                  <option value="CO">Colombia (DIAN)</option>
                  <option value="MX">México</option>
                  <option value="PA">Panamá</option>
                </select>
              </label>
              <label className="block space-y-1.5">
                <span className="font-semibold text-ink-secondary">Volumen mensual estimado</span>
                <select value={volume} onChange={(e) => setVolume(e.target.value)} className={inputCls}>
                  <option value="1-40/mes">1 a 40 clasificaciones / mes</option>
                  <option value="100-400/mes">100 a 400 clasificaciones / mes</option>
                  <option value="400-1500/mes">400 a 1,500 clasificaciones / mes</option>
                  <option value="1500+/mes">Más de 1,500 clasificaciones / mes</option>
                </select>
              </label>
              <label className="sm:col-span-2 block space-y-1.5">
                <span className="font-semibold text-ink-secondary">Comentarios o requerimientos</span>
                <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Multi-sucursal, catálogo SKU inicial, integración..." className={inputCls} />
              </label>
              {error && (
                <p className="sm:col-span-2 text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p>
              )}
              <div className="sm:col-span-2 flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-full bg-accent-brand px-6 py-3 text-xs font-semibold text-white hover:bg-accent-brand-hover disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" aria-hidden="true" />
                  {submitting ? 'Enviando...' : 'Solicitar contacto'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
