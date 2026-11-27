import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginCard } from './LoginCard';
import {
  readMockSession,
  readPendingQuery,
  readSelectedPlan,
  savePendingQuery,
} from '@/lib/funnel/funnel-storage';

const mockPush = vi.fn();
const mockRefresh = vi.fn();
let mockSearchParams = new URLSearchParams();
const mockSignInWithOAuth = vi.fn();
const mockSignInWithPassword = vi.fn();
const mockSignUp = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
  useSearchParams: () => mockSearchParams,
}));

vi.mock('@/lib/supabase/client', () => ({
  createSupabaseBrowserClient: () => ({
    auth: {
      signInWithOAuth: mockSignInWithOAuth,
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
    },
  }),
}));

describe('LoginCard', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    mockPush.mockReset();
    mockRefresh.mockReset();
    mockSignInWithOAuth.mockReset();
    mockSignInWithPassword.mockReset();
    mockSignUp.mockReset();
    mockSearchParams = new URLSearchParams();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('signs in locally in offline mode, preserves pendingQuery and selectedPlan, and honors next param', async () => {
    const user = userEvent.setup();
    savePendingQuery('Inversor solar híbrido 5 kW');
    mockSearchParams = new URLSearchParams('next=/app&plan=pro&cycle=annual');

    render(<LoginCard cloudMode={false} />);

    expect(screen.getByText(/Inversor solar híbrido 5 kW/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/Correo electrónico/i), 'ana@aduanas.ve');
    await user.type(screen.getByLabelText(/^Contraseña$/i), 'clave1234');
    await user.click(screen.getByRole('button', { name: /Ingresar con correo/i }));

    expect(readMockSession()?.email).toBe('ana@aduanas.ve');
    expect(readPendingQuery()).toBe('Inversor solar híbrido 5 kW');
    expect(readSelectedPlan()).toEqual({ planId: 'pro', billingCycle: 'annual' });
    expect(mockPush).toHaveBeenCalledWith('/app');
  });

  it('enforces password policy and confirmation on signup before creating an account', async () => {
    const user = userEvent.setup();
    mockSearchParams = new URLSearchParams('plan=enterprise&cycle=annual');

    render(<LoginCard cloudMode={false} />);

    await user.click(screen.getByRole('tab', { name: /Crear cuenta/i }));
    expect(screen.getByText(/Política de contraseña/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/Nombre completo/i), 'Carlos Rivas');
    await user.type(screen.getByLabelText(/Correo electrónico/i), 'carlos@caribecargo.ve');
    await user.type(screen.getByLabelText(/^Contraseña$/i), 'debil123');
    await user.type(screen.getByLabelText(/Confirmar contraseña/i), 'debil123');
    await user.click(screen.getByRole('button', { name: /Crear cuenta gratis/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/política de seguridad/i);
    expect(mockPush).not.toHaveBeenCalled();

    await user.clear(screen.getByLabelText(/^Contraseña$/i));
    await user.clear(screen.getByLabelText(/Confirmar contraseña/i));
    await user.type(screen.getByLabelText(/^Contraseña$/i), 'Segura!2026');
    await user.type(screen.getByLabelText(/Confirmar contraseña/i), 'Segura!9999');
    await user.click(screen.getByRole('button', { name: /Crear cuenta gratis/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/no coinciden/i);
    expect(mockPush).not.toHaveBeenCalled();

    await user.clear(screen.getByLabelText(/Confirmar contraseña/i));
    await user.type(screen.getByLabelText(/Confirmar contraseña/i), 'Segura!2026');
    await user.click(screen.getByRole('button', { name: /Crear cuenta gratis/i }));

    expect(readMockSession()?.fullName).toBe('Carlos Rivas');
    expect(mockPush).toHaveBeenCalledWith('/onboarding?plan=enterprise&cycle=annual');
  });

  it('sends non-localhost emailRedirectTo on cloud signup and shows email confirmation notice when session is pending', async () => {
    const user = userEvent.setup();
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://tariffos.app');
    mockSearchParams = new URLSearchParams('plan=pilot&cycle=monthly');
    mockSignUp.mockResolvedValue({
      data: { user: { id: 'usr-1', identities: [{ id: 'ident-1' }] }, session: null },
      error: null,
    });

    render(<LoginCard cloudMode initialMode="signup" />);

    await user.type(screen.getByLabelText(/Nombre completo/i), 'María González');
    await user.type(screen.getByLabelText(/Correo electrónico/i), 'maria@agencia.ve');
    await user.type(screen.getByLabelText(/^Contraseña$/i), 'Aduanas!2026');
    await user.type(screen.getByLabelText(/Confirmar contraseña/i), 'Aduanas!2026');
    await user.click(screen.getByRole('button', { name: /Crear cuenta gratis/i }));

    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'maria@agencia.ve',
      password: 'Aduanas!2026',
      options: {
        emailRedirectTo:
          'https://tariffos.app/auth/callback?next=%2Fonboarding%3Fplan%3Dpilot%26cycle%3Dmonthly',
        data: { full_name: 'María González' },
      },
    });
    expect(mockPush).not.toHaveBeenCalled();
    expect(screen.getByText(/enlace de confirmación/i)).toBeInTheDocument();
  });

  it('hides the Google OAuth button in cloud mode only when NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED is false', () => {
    vi.stubEnv('NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED', 'false');
    render(<LoginCard cloudMode />);

    expect(screen.queryByRole('button', { name: /Continuar con Google/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/o con tu correo/i)).not.toBeInTheDocument();
  });

  it('triggers Supabase Google OAuth in cloud mode by default', async () => {
    const user = userEvent.setup();
    mockSignInWithOAuth.mockResolvedValue({ data: { url: 'https://google.test' }, error: null });
    mockSearchParams = new URLSearchParams('next=/app');

    render(<LoginCard cloudMode />);

    await user.click(screen.getByRole('button', { name: /Continuar con Google/i }));

    expect(mockSignInWithOAuth).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: 'google',
      }),
    );
  });

  it('handles password reset request and local trial shortcut', async () => {
    const user = userEvent.setup();
    render(<LoginCard cloudMode={false} />);

    await user.click(screen.getByRole('button', { name: /¿Olvidaste tu contraseña\?/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/Escribe tu correo primero/i);

    await user.type(screen.getByLabelText(/Correo electrónico/i), 'ana@aduanas.ve');
    await user.click(screen.getByRole('button', { name: /¿Olvidaste tu contraseña\?/i }));
    expect(screen.getByText(/Enviamos instrucciones de recuperación/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Probar sin cuenta/i }));
    expect(mockPush).toHaveBeenCalledWith('/app');
  });

  it('displays selected plan context extracted from next=/onboarding?plan=pilot and non-misleading pending query copy', () => {
    savePendingQuery('Bomba sumergible 3HP acero inoxidable');
    mockSearchParams = new URLSearchParams('next=/onboarding?plan=pilot&cycle=monthly');

    render(<LoginCard cloudMode initialMode="signup" />);

    expect(screen.getByText(/Piloto Operativo/i)).toBeInTheDocument();
    expect(screen.getByText(/\$150/)).toBeInTheDocument();
    expect(screen.getByText(/Guardamos tu consulta/i)).toBeInTheDocument();
    expect(screen.queryByText(/se abrirá automáticamente/i)).not.toBeInTheDocument();
  });

  it('never exposes Supabase Auth or Modo local implementation badges in the UI', () => {
    const { rerender } = render(<LoginCard cloudMode />);
    expect(screen.queryByText(/Supabase Auth/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Modo local/i)).not.toBeInTheDocument();

    rerender(<LoginCard cloudMode={false} />);
    expect(screen.queryByText(/Supabase Auth/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Modo local/i)).not.toBeInTheDocument();
  });

  it('routes existing cloud users directly to /app with router.refresh after email signin even when local mock profile is empty', async () => {
    const user = userEvent.setup();
    mockSignInWithPassword.mockResolvedValue({ data: { session: {} }, error: null });

    render(<LoginCard cloudMode />);

    await user.type(screen.getByLabelText(/Correo electrónico/i), 'angel@tariffos.app');
    await user.type(screen.getByLabelText(/^Contraseña$/i), 'SuperClave!2026');
    await user.click(screen.getByRole('button', { name: /Ingresar con correo/i }));

    expect(mockPush).toHaveBeenCalledWith('/app');
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it('offers 1-click email clear, trims whitespace on blur, and links validation errors with aria-describedby', async () => {
    const user = userEvent.setup();
    render(<LoginCard cloudMode={false} />);

    const emailInput = screen.getByLabelText(/Correo electrónico/i);
    expect(emailInput).toHaveAttribute('autocapitalize', 'none');
    expect(emailInput).toHaveAttribute('spellcheck', 'false');
    expect(screen.queryByRole('button', { name: /Limpiar correo electrónico/i })).not.toBeInTheDocument();

    await user.type(emailInput, '  agente@aduanas.ve  ');
    emailInput.blur();
    expect(emailInput).toHaveValue('agente@aduanas.ve');

    const clearBtn = screen.getByRole('button', { name: /Limpiar correo electrónico/i });
    await user.click(clearBtn);
    expect(emailInput).toHaveValue('');
    expect(screen.queryByRole('button', { name: /Limpiar correo electrónico/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Ingresar con correo/i }));
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('id', 'login-form-error');
    expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    expect(emailInput).toHaveAttribute('aria-describedby', 'login-form-error');
  });
});
