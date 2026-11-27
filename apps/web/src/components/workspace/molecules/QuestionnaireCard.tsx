'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import type { A2UIQuestionnaireComponent } from '@tariffos/shared-types';

interface QuestionnaireCardProps {
  component: A2UIQuestionnaireComponent;
  onSubmit: (answers: Record<string, string>) => void;
}

const MAX_CHIP_OPTIONS = 5;

export function QuestionnaireCard({ component, onSubmit }: QuestionnaireCardProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const total = component.fields.length;
  const completed = component.fields.filter((f) => (answers[f.id] ?? '').trim().length > 0).length;

  const setFieldValue = (fieldId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (completed > 0) {
          onSubmit(answers);
        }
      }}
      className="rounded-card border border-border-subtle bg-surface-panel p-4 shadow-card"
    >
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-xs font-semibold text-ink-primary">{component.title}</h4>
        <span className="rounded-full bg-surface-subtle px-2 py-0.5 font-mono text-[11px] font-medium text-ink-secondary tabular-nums">
          {completed}/{total}
        </span>
      </div>

      <div className="mt-3 space-y-3">
        {component.fields.map((field) => {
          const value = answers[field.id] ?? '';
          const options = field.options ?? [];
          const useChips = field.fieldType === 'select' && options.length > 0 && options.length <= MAX_CHIP_OPTIONS;

          return (
            <div key={field.id} className="space-y-1.5">
              <label htmlFor={`${component.id}-${field.id}`} className="block text-xs font-medium text-ink-secondary">
                {field.label}
                {field.unit ? <span className="ml-1 text-ink-muted">({field.unit})</span> : null}
              </label>

              {useChips ? (
                <div className="flex flex-wrap gap-1.5">
                  {options.map((opt) => {
                    const active = value === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setFieldValue(field.id, opt)}
                        aria-pressed={active}
                        className={`cursor-pointer rounded-full border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none ${
                          active
                            ? 'border-accent-brand bg-accent-brand text-white'
                            : 'border-border-subtle bg-surface-muted text-ink-primary hover:border-accent-border hover:bg-accent-soft'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              ) : field.fieldType === 'select' && options.length > MAX_CHIP_OPTIONS ? (
                <select
                  id={`${component.id}-${field.id}`}
                  value={value}
                  onChange={(e) => setFieldValue(field.id, e.target.value)}
                  className="w-full rounded-lg border border-border-subtle bg-surface-input px-2.5 py-1.5 text-xs text-ink-primary focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
                >
                  <option value="">Seleccionar…</option>
                  {options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={`${component.id}-${field.id}`}
                  name={field.id}
                  autoComplete="off"
                  type={field.fieldType === 'number' ? 'number' : 'text'}
                  value={value}
                  placeholder={field.placeholder ?? 'Escribir respuesta…'}
                  onChange={(e) => setFieldValue(field.id, e.target.value)}
                  className="w-full rounded-lg border border-border-subtle bg-surface-input px-2.5 py-1.5 text-xs text-ink-primary focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex justify-end border-t border-border-hairline pt-2.5">
        <button
          type="submit"
          disabled={completed === 0}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-accent-brand px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent-brand-hover focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" aria-hidden="true" />
          Enviar respuestas
        </button>
      </div>
    </form>
  );
}
