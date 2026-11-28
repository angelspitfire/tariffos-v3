'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Globe, X } from 'lucide-react';
import { getCountryLandingBySlug } from '@/lib/funnel/country-landings';

const DISMISSED_STORAGE_KEY = 'tariffos_geo_banner_dismissed_v1';

export interface GeoCountrySuggestionBannerProps {
  detectedCountryCode?: string | null;
}

export function GeoCountrySuggestionBanner({
  detectedCountryCode,
}: GeoCountrySuggestionBannerProps) {
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.sessionStorage.getItem(DISMISSED_STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });

  const normalized = detectedCountryCode?.trim().toLowerCase() ?? '';
  const targetEdition = normalized ? getCountryLandingBySlug(normalized) : null;

  if (!targetEdition || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    try {
      window.sessionStorage.setItem(DISMISSED_STORAGE_KEY, '1');
    } catch {
      // Ignore storage errors in private browsing.
    }
  };

  return (
    <div
      role="region"
      aria-label="Edición local sugerida"
      className="mx-auto mt-2 max-w-5xl px-3 sm:px-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-full border border-border-subtle bg-surface-panel px-4 py-2 text-xs text-ink-secondary shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <Globe className="h-3.5 w-3.5 text-accent-ink shrink-0" aria-hidden="true" />
          <span>
            ¿Operas en <strong className="font-semibold text-ink-primary">{targetEdition.editionLabel}</strong>? Conoce la edición adaptada a tu normativa aduanera local.
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={targetEdition.canonicalPath}
            className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-3 py-1 font-semibold text-accent-ink hover:underline whitespace-nowrap"
          >
            <span>Ver edición {targetEdition.editionLabel}</span>
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Cerrar sugerencia de país"
            className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-ink-muted hover:bg-surface-muted hover:text-ink-primary transition-colors"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
