import { beforeEach, describe, expect, it, vi } from 'vitest';
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
let mockSearchParams = new URLSearchParams();
const mockSignInWithOAuth = vi.fn();
const mockSignInWithPassword = vi.fn();
const mockSignUp = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
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
    mockSignInWithOAuth.mockReset();
    mockSignInWithPassword.mockReset();
    mockSignUp.mockReset();
    mockSearchParams = new URLSearchParams();
  });

  it('signs in locally in offline mode, preserves pendingQuery and selectedPlan, and honors next param', async () => {
    const user = userEvent.setup();
    savePendingQuery('Inversor solar híbrido 5 kW');
    mockSearchParams = new URLSearchParams('next=/app&plan=pro&cycle=annual');

    render(<LoginCard cloudMode={false} />);

    expect(screen.getByText(/Inversor solar híbrido 5 kW/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/Correo electrónico/i), 'ana@aduanas.ve');
    await user.type(screen.getByLabelText(/Contraseña/i), 'clave1234');
    await user.click(screen.getByRole('button', { name: /Ingresar con correo/i }));

    expect(readMockSession()?.email).toBe('ana@aduanas.ve');
    expect(readPendingQuery()).toBe('Inversor solar híbrido 5 kW');
    expect(readSelectedPlan()).toEqual({ planId: 'pro', billingCycle: 'annual' });
    expect(mockPush).toHaveBeenCalledWith('/app');
  });

  it('switches to signup tab and routes new local users to /onboarding with preselected plan', async () => {
    const user = userEvent.setup();
    mockSearchParams = new URLSearchParams('plan=enterprise&cycle=annual');

    render(<LoginCard cloudMode={false} />);

    await user.click(screen.getByRole('tab', { name: /Crear cuenta/i }));
    await user.type(screen.getByLabelText(/Nombre completo/i), 'Carlos Rivas');
    await user.type(screen.getByLabelText(/Correo electrónico/i), 'carlos@caribecargo.ve');
    await user.type(screen.getByLabelText(/Contraseña/i), 'segura2026');
    await user.click(screen.getByRole('button', { name: /Crear cuenta gratis/i }));

    expect(readMockSession()?.fullName).toBe('Carlos Rivas');
    expect(mockPush).toHaveBeenCalledWith('/onboarding?plan=enterprise&cycle=annual');
  });

  it('triggers Supabase Google OAuth in cloud mode', async () => {
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
});
