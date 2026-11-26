import { Check } from 'lucide-react';
import {
  ENTERPRISE_MODULE_CHIPS,
  ENTERPRISE_TEAM_PILLS,
  ENTERPRISE_VOLUME_PILLS,
  LEAD_COUNTRY_OPTIONS,
  MAX_LEAD_NOTES_LENGTH,
  type LeadFieldErrors,
  type LeadFormValues,
} from '@/lib/funnel/lead-form-validation';

export interface LeadEnterpriseFieldsProps {
  values: LeadFormValues;
  fieldErrors: LeadFieldErrors;
  inputClass: (hasError?: string) => string;
  onChangeField: <K extends keyof LeadFormValues>(key: K, nextValue: LeadFormValues[K]) => void;
  onToggleModule: (moduleId: string) => void;
  onBlurNotes: () => void;
}

const PILL_BASE =
  'min-h-[38px] px-3 rounded-xl border text-xs font-medium flex items-center justify-center text-center cursor-pointer transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent-brand has-[:focus-visible]:outline-offset-2 active:translate-y-px';

export function LeadEnterpriseFields({
  values,
  fieldErrors,
  inputClass,
  onChangeField,
  onToggleModule,
  onBlurNotes,
}: LeadEnterpriseFieldsProps) {
  return (
    <div className="space-y-4 pt-4 border-t border-border-hairline">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold text-ink-primary">
          Configura el alcance de tu agencia
        </span>
        <label className="inline-flex items-center gap-2 text-xs text-ink-secondary">
          <span>Jurisdicción base:</span>
          <select
            aria-label="País"
            value={values.country}
            onChange={(e) => onChangeField('country', e.target.value)}
            className="min-h-[34px] rounded-lg border border-border-subtle bg-surface-input px-2.5 text-xs font-medium text-ink-primary outline-2 outline-transparent -outline-offset-2 focus-visible:outline-accent-brand"
          >
            {LEAD_COUNTRY_OPTIONS.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset className="space-y-1.5">
        <legend className="font-semibold text-ink-secondary">
          1. Clasificaciones estimadas por mes
        </legend>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {ENTERPRISE_VOLUME_PILLS.map((pill) => {
            const active = values.volume === pill.value;
            return (
              <label
                key={pill.value}
                className={`${PILL_BASE} ${
                  active
                    ? 'border-accent-brand bg-accent-soft text-accent-ink font-semibold'
                    : 'border-border-subtle bg-surface-muted text-ink-secondary hover:text-ink-primary'
                }`}
              >
                <input
                  type="radio"
                  name="enterprise-volume"
                  value={pill.value}
                  checked={active}
                  onChange={() => onChangeField('volume', pill.value)}
                  className="sr-only"
                />
                <span>{pill.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="space-y-1.5">
        <legend className="font-semibold text-ink-secondary">
          2. Tamaño del equipo operativo
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {ENTERPRISE_TEAM_PILLS.map((pill) => {
            const active = values.enterpriseTeam === pill.value;
            return (
              <label
                key={pill.value}
                className={`${PILL_BASE} ${
                  active
                    ? 'border-accent-brand bg-accent-soft text-accent-ink font-semibold'
                    : 'border-border-subtle bg-surface-muted text-ink-secondary hover:text-ink-primary'
                }`}
              >
                <input
                  type="radio"
                  name="enterprise-team"
                  value={pill.value}
                  checked={active}
                  onChange={() => onChangeField('enterpriseTeam', pill.value)}
                  className="sr-only"
                />
                <span>{pill.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="space-y-1.5">
        <legend className="font-semibold text-ink-secondary">
          3. Módulos y acompañamiento requeridos
        </legend>
        <div className="flex flex-wrap gap-2">
          {ENTERPRISE_MODULE_CHIPS.map((chip) => {
            const selected = values.enterpriseModules.includes(chip.id);
            return (
              <label
                key={chip.id}
                className={`min-h-[36px] px-3 rounded-full border text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent-brand has-[:focus-visible]:outline-offset-2 active:translate-y-px ${
                  selected
                    ? 'border-accent-brand bg-accent-brand text-white font-semibold'
                    : 'border-border-subtle bg-surface-muted text-ink-secondary hover:text-ink-primary'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => onToggleModule(chip.id)}
                  className="sr-only"
                />
                {selected ? <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" /> : null}
                <span>{chip.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <label className="block space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-ink-secondary">Notas adicionales (opcional)</span>
          <span className="font-mono text-[10px] text-ink-muted tabular-nums">
            {values.notes.length}/{MAX_LEAD_NOTES_LENGTH}
          </span>
        </div>
        <textarea
          rows={2}
          value={values.notes}
          onChange={(e) => onChangeField('notes', e.target.value)}
          onBlur={onBlurNotes}
          placeholder="Puertos donde operan, flujo de aprobación o fecha objetivo"
          aria-invalid={Boolean(fieldErrors.notes)}
          aria-describedby={fieldErrors.notes ? 'lead-notes-error' : undefined}
          className={`${inputClass(fieldErrors.notes)} min-h-[68px] py-2 resize-y`}
        />
        {fieldErrors.notes ? (
          <p id="lead-notes-error" role="alert" className="text-[11px] font-medium text-[var(--color-error)]">
            {fieldErrors.notes}
          </p>
        ) : null}
      </label>
    </div>
  );
}
