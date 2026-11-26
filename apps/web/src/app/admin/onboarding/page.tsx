import { Suspense } from 'react';
import { AssistedOnboardingForm } from '@/components/admin/organisms/AssistedOnboardingForm';

export default function AdminOnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-border-subtle bg-surface-panel p-6 text-xs text-ink-muted">
          Cargando formulario de onboarding...
        </div>
      }
    >
      <AssistedOnboardingForm />
    </Suspense>
  );
}
