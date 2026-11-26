'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  BookmarkCheck,
  CheckCircle2,
  Globe,
  Layers,
  Scale,
  Search,
} from 'lucide-react';
import { isCloudModeEnabled } from '@/lib/runtime-config';
import { readMockSession, savePendingQuery } from '@/lib/funnel/funnel-storage';
import { FunnelButton } from '../atoms/FunnelButton';
import { HeroPreviewCard } from '../molecules/HeroPreviewCard';

export const HERO_SAMPLE_PROMPTS = [
  'Inversor solar híbrido 5 kW',
  'Ecógrafo Doppler portátil',
  'Bomba sumergible acero inox 2HP 120 L/min',
] as const;

export interface LandingHeroProps {
  hasSession?: boolean;
  requiresAuth?: boolean;
}

export function LandingHero({ hasSession, requiresAuth }: LandingHeroProps) {
  const router = useRouter();
  const [heroPrompt, setHeroPrompt] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = heroPrompt.trim();
    if (trimmed) {
      savePendingQuery(trimmed);
    }

    const needsAuth =
      requiresAuth !== undefined
        ? requiresAuth
        : isCloudModeEnabled() && !(hasSession ?? Boolean(readMockSession()));

    if (needsAuth) {
      router.push(`/login?next=${encodeURIComponent('/app')}`);
      return;
    }
    router.push('/app');
  };

  return (
    <section className="py-12 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent-border bg-accent-soft/60 text-accent-ink text-[11px] font-semibold">
            <Scale className="w-3.5 h-3.5" />
            <span>Motor arancelario auditable · RGI 1–6 + HITL + Tributos</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-ink-primary leading-[1.12]">
            Clasificación arancelaria de nivel pericial, en segundos.
          </h1>

          <p className="text-sm sm:text-base text-ink-secondary leading-relaxed max-w-xl">
            Diseñado para agentes de aduanas, agencias e importadores que no pueden
            permitirse códigos inventados. Valida fichas merceológicas, clasifica lotes
            Excel/CSV y emite dictámenes PDF firmados con respaldo RGI.
          </p>

          <form
            onSubmit={handleSubmit}
            className="p-1.5 rounded-2xl border border-border-strong bg-surface-panel shadow-sm"
          >
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1 flex items-center gap-2 px-3 py-1.5 min-w-0">
                <Search className="w-4 h-4 text-accent-ink shrink-0" />
                <input
                  type="text"
                  value={heroPrompt}
                  onChange={(e) => setHeroPrompt(e.target.value)}
                  placeholder="Describe una mercancía para clasificar ahora..."
                  aria-label="Describe una mercancía para probar TariffOS"
                  className="w-full bg-transparent text-xs sm:text-sm text-ink-primary placeholder:text-ink-subtle focus:outline-none"
                />
              </div>
              <FunnelButton
                type="submit"
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="shrink-0"
              >
                Clasificar gratis
              </FunnelButton>
            </div>
          </form>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-ink-muted mr-1">Prueba con:</span>
            {HERO_SAMPLE_PROMPTS.map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => setHeroPrompt(sample)}
                className="px-2.5 py-1 rounded-full text-[11px] border border-border-subtle bg-surface-panel hover:border-accent-brand hover:text-accent-ink text-ink-secondary transition-colors cursor-pointer truncate max-w-[260px]"
              >
                {sample}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#planes"
              className="px-4 py-2 rounded-xl border border-border-strong bg-surface-panel hover:bg-surface-hover text-xs sm:text-sm font-semibold text-ink-primary transition-colors"
            >
              Ver planes y recomendador
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border-hairline text-[11px] text-ink-muted">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              RGI 1–6 trazables
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-accent-ink shrink-0" />
              Lotes Excel/CSV
            </span>
            <span className="inline-flex items-center gap-1.5">
              <BookmarkCheck className="w-3.5 h-3.5 text-accent-ink shrink-0" />
              Catálogo SKU
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-accent-ink shrink-0" />
              Multi-jurisdicción
            </span>
          </div>
        </div>

        <div className="lg:col-span-6">
          <HeroPreviewCard />
        </div>
      </div>
    </section>
  );
}
