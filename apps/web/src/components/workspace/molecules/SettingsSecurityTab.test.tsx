import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mocks = vi.hoisted(() => ({
  executePasswordChange: vi.fn<(...args: unknown[]) => Promise<unknown>>(),
  checkMustChangePassword: vi.fn<() => Promise<boolean>>(),
}));

vi.mock('@/lib/workspace/change-password', () => ({
  executePasswordChange: mocks.executePasswordChange,
  checkMustChangePassword: mocks.checkMustChangePassword,
}));

import { SettingsSecurityTab } from './SettingsSecurityTab';

describe('SettingsSecurityTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.checkMustChangePassword.mockResolvedValue(false);
  });

  it('renders temporary password warning banner when mustChangePassword is true', () => {
    render(<SettingsSecurityTab mustChangePassword cloudMode />);
    expect(screen.getByText(/contraseña temporal/i)).toBeInTheDocument();
    expect(screen.getByText(/Política de contraseña/i)).toBeInTheDocument();
  });

  it('validates and invokes executePasswordChange without submitting an outer form', async () => {
    const user = userEvent.setup();
    const outerSubmit = vi.fn();
    mocks.executePasswordChange.mockResolvedValue({
      ok: true,
      message: 'Contraseña actualizada correctamente.',
    });

    render(
      <form onSubmit={outerSubmit}>
        <SettingsSecurityTab cloudMode />
      </form>,
    );

    await user.type(screen.getByLabelText(/^Nueva contraseña$/i), 'Segura!2026');
    await user.type(screen.getByLabelText(/Confirmar nueva contraseña/i), 'Segura!2026');
    await user.click(screen.getByRole('button', { name: /Actualizar contraseña/i }));

    await waitFor(() => {
      expect(screen.getByText(/Contraseña actualizada correctamente/i)).toBeInTheDocument();
    });
    expect(mocks.executePasswordChange).toHaveBeenCalledWith({
      newPassword: 'Segura!2026',
      confirmPassword: 'Segura!2026',
      isCloud: true,
    });
    expect(outerSubmit).not.toHaveBeenCalled();
  });
});
