'use client';

import { Check, Circle } from 'lucide-react';
import {
  evaluatePasswordPolicy,
  type PasswordStrength,
} from '@/lib/funnel/password-policy';

export interface PasswordPolicyChecklistProps {
  password: string;
  confirmPassword: string;
}

const STRENGTH_META: Record<
  PasswordStrength,
  { label: string; activeBars: number; barClass: string; textClass: string }
> = {
  empty: {
    label: 'Sin definir',
    activeBars: 0,
    barClass: 'bg-border-subtle',
    textClass: 'text-ink-muted',
  },
  weak: {
    label: 'Débil',
    activeBars: 1,
    barClass: 'bg-rose-500',
    textClass: 'text-rose-600 dark:text-rose-400',
  },
  fair: {
    label: 'Media',
    activeBars: 2,
    barClass: 'bg-amber-500',
    textClass: 'text-amber-600 dark:text-amber-400',
  },
  good: {
    label: 'Buena',
    activeBars: 3,
    barClass: 'bg-sky-500',
    textClass: 'text-sky-600 dark:text-sky-400',
  },
  strong: {
    label: 'Fuerte',
    activeBars: 4,
    barClass: 'bg-emerald-500',
    textClass: 'text-emerald-600 dark:text-emerald-400',
  },
};

const STRENGTH_SEGMENTS = [1, 2, 3, 4] as const;

export function PasswordPolicyChecklist({
  password,
  confirmPassword,
}: PasswordPolicyChecklistProps) {
  const evaluation = evaluatePasswordPolicy(password);
  const meta = STRENGTH_META[evaluation.strength];
  const hasConfirm = confirmPassword.length > 0;
  const passwordsMatch = hasConfirm && password === confirmPassword;

  return (
    <div
      aria-live="polite"
      className="rounded-xl border border-border-subtle bg-surface-subtle/70 p-3 space-y-2.5"
    >
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-ink-secondary">Política de contraseña</span>
          <span className={`font-semibold ${meta.textClass}`}>{meta.label}</span>
        </div>
        <div className="grid grid-cols-4 gap-1" aria-hidden="true">
          {STRENGTH_SEGMENTS.map((segment) => (
            <div
              key={segment}
              className={`h-1 rounded-full transition-colors ${
                segment <= meta.activeBars ? meta.barClass : 'bg-border-subtle'
              }`}
            />
          ))}
        </div>
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
        {evaluation.rules.map((rule) => (
          <li
            key={rule.id}
            className={`flex items-center gap-1.5 transition-colors ${
              rule.passed
                ? 'text-emerald-700 dark:text-emerald-300 font-medium'
                : 'text-ink-muted'
            }`}
          >
            {rule.passed ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
            ) : (
              <Circle className="w-3 h-3 text-ink-subtle shrink-0" aria-hidden="true" />
            )}
            <span>{rule.label}</span>
          </li>
        ))}
      </ul>

      {hasConfirm ? (
        <p
          className={`text-[11px] font-medium pt-1 border-t border-border-subtle ${
            passwordsMatch
              ? 'text-emerald-700 dark:text-emerald-300'
              : 'text-rose-600 dark:text-rose-400'
          }`}
        >
          {passwordsMatch ? 'Las contraseñas coinciden.' : 'Las contraseñas no coinciden.'}
        </p>
      ) : null}
    </div>
  );
}
