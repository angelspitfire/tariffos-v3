'use client';

import { Check } from 'lucide-react';
import type { OnboardingWizardStep } from '@/lib/funnel/funnel-storage';

const WIZARD_STEPS: readonly { step: OnboardingWizardStep; label: string }[] = [
  { step: 1, label: 'Perfil y operación' },
  { step: 2, label: 'Plan y activación' },
];

export interface OnboardingStepperProps {
  currentStep: OnboardingWizardStep;
  onSelectStep?: (step: OnboardingWizardStep) => void;
}

export function OnboardingStepper({ currentStep, onSelectStep }: OnboardingStepperProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-[11px] font-semibold text-ink-muted">
        <span>Paso {currentStep} de 2</span>
        <span>Progreso guardado automáticamente</span>
      </div>
      <ol className="grid grid-cols-2 gap-2">
        {WIZARD_STEPS.map((item) => {
          const isCompleted = item.step < currentStep;
          const isCurrent = item.step === currentStep;
          const canClick = Boolean(onSelectStep && item.step < currentStep);
          return (
            <li key={item.step}>
              <button
                type="button"
                disabled={!canClick}
                onClick={() => canClick && onSelectStep?.(item.step)}
                aria-current={isCurrent ? 'step' : undefined}
                className={`flex w-full items-center gap-2 rounded-xl border px-2.5 py-2 text-left text-xs transition-colors ${
                  isCurrent
                    ? 'border-accent-brand bg-accent-soft/60 font-semibold text-ink-primary'
                    : isCompleted
                      ? 'border-border-subtle bg-surface-muted/70 font-medium text-ink-secondary hover:bg-surface-hover cursor-pointer'
                      : 'border-border-hairline bg-surface-panel text-ink-muted'
                }`}
              >
                <span
                  className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    isCurrent
                      ? 'bg-accent-brand text-white'
                      : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-surface-subtle text-ink-muted'
                  }`}
                >
                  {isCompleted ? <Check className="h-3 w-3" aria-hidden="true" /> : item.step}
                </span>
                <span className="truncate">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
