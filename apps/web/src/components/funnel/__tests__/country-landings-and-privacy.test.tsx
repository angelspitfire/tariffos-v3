import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  GLOBAL_LANDING_CONFIG,
  VE_LANDING_CONFIG,
  getCountryLandingBySlug,
  resolveRootLandingConfig,
} from '@/lib/funnel/country-landings';
import { isCountrySwitcherEnabled } from '@/lib/runtime-config';
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
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('switches root landing to VE and hides country switcher automatically when NEXT_PUBLIC_DEFAULT_LANDING_COUNTRY=ve', () => {
    expect(resolveRootLandingConfig().slug).toBe('global');
    expect(isCountrySwitcherEnabled()).toBe(true);

    vi.stubEnv('NEXT_PUBLIC_DEFAULT_LANDING_COUNTRY', 've');
    expect(resolveRootLandingConfig().slug).toBe('ve');
    expect(isCountrySwitcherEnabled()).toBe(false);

    vi.stubEnv('NEXT_PUBLIC_SHOW_COUNTRY_SWITCHER', 'true');
    expect(isCountrySwitcherEnabled()).toBe(true);

    vi.stubEnv('NEXT_PUBLIC_SHOW_COUNTRY_SWITCHER', 'false');
    expect(isCountrySwitcherEnabled()).toBe(false);
  });

  it('hides the edition switcher in header and footer when showCountrySwitcher is false', () => {
    render(
      <LandingPageTemplate
        config={VE_LANDING_CONFIG}
        showCountrySwitcher={false}
        detectedCountryCode="VE"
      />,
    );

    expect(screen.queryByRole('navigation', { name: /Edición por jurisdicción/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: /Edición local sugerida/i })).not.toBeInTheDocument();
    expect(screen.getAllByText(/Decreto 4\.944/i).length).toBeGreaterThanOrEqual(1);
  });
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

  it('renders dedicated /privacidad page documenting tenant RLS isolation, signed URLs, and Zero Training policy', async () => {
    render(await PrivacySecurityPage());

    expect(
      screen.getByRole('heading', { level: 1, name: /Seguridad y Privacidad de Datos/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Row-Level Security/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/entrenar modelos públicos/i)).toBeInTheDocument();
    expect(screen.getAllByText(/SHA-256/i).length).toBeGreaterThanOrEqual(1);
  });
});
