import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, FileCheck2, Lock, Server, ShieldCheck } from 'lucide-react';
import { PublicMarketingShell } from '@/components/funnel/organisms/PublicMarketingShell';

export const metadata: Metadata = {
  title: 'Seguridad y Privacidad de Datos — TariffOS',
  description:
    'Política de confidencialidad, aislamiento multi-tenant con PostgreSQL RLS, buckets privados firmados y cero entrenamiento de modelos públicos en TariffOS.',
};

const PILLARS = [
  {
    icon: Lock,
    title: '1. Aislamiento Multi-Organización con Row-Level Security (RLS)',
    body: 'Cada agencia de aduanas e importador opera en un espacio de trabajo aislado por organización (tenant_id). Las tablas operativas y de expedientes aplican políticas PostgreSQL Row-Level Security (RLS) con denegación por defecto ante cualquier consulta no autorizada.',
  },
  {
    icon: ShieldCheck,
    title: '2. Política Estricta de No Entrenamiento (Zero Training)',
    body: 'Las facturas comerciales, listas de empaque, valores FOB/CIF, nombres de proveedores extranjeros y hojas de composición técnica (MSDS) procesadas en TariffOS se utilizan exclusivamente para ejecutar tu clasificación y nunca se emplean para entrenar modelos públicos de terceros.',
  },
  {
    icon: Server,
    title: '3. Almacenamiento Privado y URLs Firmadas Temporales',
    body: 'Los documentos originales, comprobantes y firmas digitales se resguardan en buckets privados cifrados en tránsito (TLS 1.3) y en reposo (AES-256), accesibles únicamente mediante URLs firmadas efímeras vinculadas a la sesión autenticada de tu espacio de trabajo.',
  },
  {
    icon: FileCheck2,
    title: '4. Trazabilidad Documental Versionada y Hash SHA-256',
    body: 'Cada dictamen registra fecha y hora exacta, versión incremental append-only, huella criptográfica SHA-256 de la entrada documental y la versión exacta del instrumento arancelario vigente consultado, facilitando auditorías internas y fiscalizaciones aduaneras.',
  },
] as const;

export default function PrivacySecurityPage() {
  return (
    <PublicMarketingShell>
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-8 space-y-10">
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-ink hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Volver al inicio</span>
            </Link>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-ink-primary">
              Seguridad y Privacidad de Datos
            </h1>
            <p className="text-sm sm:text-base text-ink-secondary leading-relaxed max-w-2xl">
              Última actualización: noviembre de 2026. Este documento describe los controles técnicos y compromisos legales bajo los cuales TariffOS procesa expedientes aduaneros y documentación comercial confidencial.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {PILLARS.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="rounded-[22px] border border-border-subtle bg-surface-panel p-6 space-y-3"
                >
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-accent-ink">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <h2 className="text-base font-semibold text-ink-primary leading-snug">
                    {item.title}
                  </h2>
                  <p className="text-sm text-ink-secondary leading-relaxed">{item.body}</p>
                </article>
              );
            })}
          </div>

          <div className="rounded-[22px] border border-border-subtle bg-surface-panel p-6 space-y-3 text-sm text-ink-secondary leading-relaxed">
            <h2 className="text-base font-semibold text-ink-primary">
              5. Retención, Exportación y Derechos del Cliente Corporativo
            </h2>
            <p>
              Tu organización conserva en todo momento la titularidad exclusiva de sus facturas, catálogos SKU y dictámenes emitidos. Puedes exportar tus dictámenes en PDF y tus manifiestos clasificados en cualquier momento, o solicitar la eliminación definitiva de tu espacio de trabajo escribiendo a{' '}
              <a
                href="mailto:soporte@tariffos.app"
                className="font-semibold text-ink-primary underline underline-offset-4 hover:text-accent-ink"
              >
                soporte@tariffos.app
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </PublicMarketingShell>
  );
}
