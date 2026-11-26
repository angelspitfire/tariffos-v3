import { Suspense } from 'react';
import { BrandMark } from '@/components/funnel/atoms/BrandMark';
import { LoginCard } from '@/components/funnel/organisms/LoginCard';

interface LoginPageProps {
  searchParams: Promise<{
    next?: string;
    mode?: string;
  }>;
}

async function LoginContent({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const initialMode = params.mode === 'signup' ? 'signup' : 'signin';
  return <LoginCard initialMode={initialMode} nextPath={params.next} />;
}

export default function LoginPage(props: LoginPageProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface-app px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <BrandMark />
        </div>
        <Suspense
          fallback={
            <div className="flex h-64 items-center justify-center rounded-2xl border border-border-subtle bg-surface-panel text-xs text-ink-muted">
              Cargando acceso...
            </div>
          }
        >
          <LoginContent {...props} />
        </Suspense>
      </div>
    </main>
  );
}
