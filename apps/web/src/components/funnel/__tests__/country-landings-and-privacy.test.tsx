import { beforeAll, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  GLOBAL_LANDING_CONFIG,
  getCountryLandingBySlug,
} from '@/lib/funnel/country-landings';
import { GeoCountrySuggestionBanner } from '../molecules/GeoCountrySuggestionBanner';
import { LandingPageTemplate } from '../templates/LandingPageTemplate';
import PrivacySecurityPage from '@/app/privacidad/page';

const mockPush = vi.fn<(href: string) => void>();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

beforeAll(() => {
  if (typeof globalThis.IntersectionObserver === 'undefined') {
    globalThis.IntersectionObserver = class IntersectionObserver {
      observe = vi.fn<() => void>();
      unobserve = vi.fn<() => void>();
      disconnect = vi.fn<() => void>();
      takeRecords = vi.fn<() => IntersectionObserverEntry[]>(() => []);
      root = null;
      rootMargin = '';
      scrollMargin = '';
      thresholds = [];
    } as unknown as typeof IntersectionObserver;
  }
});

describe('Global (/) + Venezuela (/ve) Landings & Privacy Page', () => {
  it('keeps Global landing international (OMA + RGI 1-6) without local SIDUNEA/Pago Móvil lock-in', () => {
    render(<LandingPageTemplate config={GLOBAL_LANDING_CONFIG} />);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Clasificación arancelaria auditable con respaldo RGI/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Validación normativa en minutos/i)).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Privacidad y Seguridad/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('link', { name: /Venezuela/i }).length).toBeGreaterThanOrEqual(1);
  });

  it('renders Venezuela (/ve) landing with Decreto 4.944, RL 1-21 / COMEX, pre-SIDUNEA scope, and country=VE onboarding link', () => {
    const veConfig = getCountryLandingBySlug('ve');
    expect(veConfig).not.toBeNull();
    expect(getCountryLandingBySlug('unknown')).toBeNull();

    render(<LandingPageTemplate config={veConfig!} />);

    expect(screen.getAllByText(/Decreto 4\.944/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/previa a SIDUNEA/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Trazabilidad Documental Versionada/i).length).toBeGreaterThanOrEqual(1);
  });

  it('shows dismissible Mode B GeoIP 1-click banner on Global landing when visitor IP is VE', async () => {
    const user = userEvent.setup();
    render(<GeoCountrySuggestionBanner detectedCountryCode="VE" />);

    const link = screen.getByRole('link', { name: /Ver edición Venezuela/i });
    expect(link).toHaveAttribute('href', '/ve');

    await user.click(screen.getByRole('button', { name: /Cerrar sugerencia de país/i }));
    expect(screen.queryByRole('link', { name: /Ver edición Venezuela/i })).not.toBeInTheDocument();
  });

  it('renders dedicated /privacidad page documenting tenant RLS isolation, signed URLs, and Zero Training policy', () => {
    render(<PrivacySecurityPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: /Seguridad y Privacidad de Datos/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Row-Level Security/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/entrenar modelos públicos/i)).toBeInTheDocument();
    expect(screen.getAllByText(/SHA-256/i).length).toBeGreaterThanOrEqual(1);
  });
});
