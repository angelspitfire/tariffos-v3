import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mocks = vi.hoisted(() => ({
  adminFetchJson: vi.fn<(...args: unknown[]) => Promise<unknown>>(),
}));

vi.mock('@/lib/admin/admin-fetch', () => ({
  adminFetchJson: mocks.adminFetchJson,
}));

import { PlatformAdminsPanel } from './PlatformAdminsPanel';

describe('PlatformAdminsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists platform admins and email provider status indicator', async () => {
    mocks.adminFetchJson.mockResolvedValue({
      mode: 'cloud',
      admins: [
        {
          id: 'pa-1',
          email: 'angel.alberto.fernandez@gmail.com',
          role: 'super_admin',
          isActive: true,
          notes: 'Founder & Super Admin',
          createdBy: 'cli:test',
          createdAt: '2026-11-26T10:00:00.000Z',
          updatedAt: '2026-11-26T10:00:00.000Z',
        },
      ],
      emailProvider: { configured: false, provider: 'none', fromAddress: null },
    });

    render(<PlatformAdminsPanel />);

    expect(await screen.findByText('angel.alberto.fernandez@gmail.com')).toBeInTheDocument();
    expect(screen.getByText(/Correo automático no configurado/i)).toBeInTheDocument();
    expect(screen.getAllByText('Super Admin').length).toBeGreaterThanOrEqual(2);
  });

  it('provisions a new Super Admin and renders temporary credentials banner with copy button', async () => {
    const user = userEvent.setup();
    mocks.adminFetchJson
      .mockResolvedValueOnce({
        mode: 'cloud',
        admins: [],
        emailProvider: { configured: true, provider: 'resend', fromAddress: 'acceso@tariffos.app' },
      })
      .mockResolvedValueOnce({
        mode: 'cloud',
        admin: {
          id: 'pa-2',
          email: 'erickampg25@gmail.com',
          role: 'super_admin',
          isActive: true,
          notes: 'Ericka (TariffOS)',
          createdBy: 'admin:1',
          createdAt: '2026-11-26T12:00:00.000Z',
          updatedAt: '2026-11-26T12:00:00.000Z',
        },
        temporaryPassword: 'TfOS!Temp#999a',
        planSlug: 'tariffos_internal',
        emailDelivery: {
          delivered: true,
          provider: 'resend',
          includedTemporaryPassword: true,
        },
      })
      .mockResolvedValueOnce({
        mode: 'cloud',
        admins: [
          {
            id: 'pa-2',
            email: 'erickampg25@gmail.com',
            role: 'super_admin',
            isActive: true,
            notes: 'Ericka (TariffOS)',
            createdBy: 'admin:1',
            createdAt: '2026-11-26T12:00:00.000Z',
            updatedAt: '2026-11-26T12:00:00.000Z',
          },
        ],
        emailProvider: { configured: true, provider: 'resend', fromAddress: 'acceso@tariffos.app' },
      });

    render(<PlatformAdminsPanel />);
    await screen.findByText(/Correo automático activo/i);

    await user.type(screen.getByLabelText(/Correo del administrador/i), 'erickampg25@gmail.com');
    await user.type(screen.getByLabelText(/Nombre completo/i), 'Ericka');
    await user.click(screen.getByRole('button', { name: /Crear administrador/i }));

    await waitFor(() => {
      expect(screen.getByText('TfOS!Temp#999a')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /Copiar credenciales/i })).toBeInTheDocument();
    expect(mocks.adminFetchJson).toHaveBeenCalledWith(
      '/api/admin/admins',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('revokes an active admin when clicking Revocar', async () => {
    const user = userEvent.setup();
    mocks.adminFetchJson
      .mockResolvedValueOnce({
        mode: 'cloud',
        admins: [
          {
            id: 'pa-2',
            email: 'soporte@tariffos.app',
            role: 'support',
            isActive: true,
            notes: 'Soporte',
            createdBy: 'admin:1',
            createdAt: '2026-11-26T10:00:00.000Z',
            updatedAt: '2026-11-26T10:00:00.000Z',
          },
        ],
        emailProvider: { configured: false, provider: 'none', fromAddress: null },
      })
      .mockResolvedValueOnce({
        mode: 'cloud',
        admin: {
          id: 'pa-2',
          email: 'soporte@tariffos.app',
          role: 'support',
          isActive: false,
          notes: 'Soporte',
          createdBy: 'admin:1',
          createdAt: '2026-11-26T10:00:00.000Z',
          updatedAt: '2026-11-26T12:00:00.000Z',
        },
      })
      .mockResolvedValueOnce({
        mode: 'cloud',
        admins: [
          {
            id: 'pa-2',
            email: 'soporte@tariffos.app',
            role: 'support',
            isActive: false,
            notes: 'Soporte',
            createdBy: 'admin:1',
            createdAt: '2026-11-26T10:00:00.000Z',
            updatedAt: '2026-11-26T12:00:00.000Z',
          },
        ],
        emailProvider: { configured: false, provider: 'none', fromAddress: null },
      });

    render(<PlatformAdminsPanel />);
    const revokeBtn = await screen.findByRole('button', { name: /Revocar/i });
    await user.click(revokeBtn);

    await waitFor(() => {
      expect(mocks.adminFetchJson).toHaveBeenCalledWith(
        '/api/admin/admins',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ email: 'soporte@tariffos.app', action: 'revoke' }),
        }),
      );
    });
  });
});
