import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const mocks = vi.hoisted(() => ({
  adminFetchJson: vi.fn<(...args: unknown[]) => Promise<unknown>>(),
}));

vi.mock('@/lib/admin/admin-fetch', () => ({
  adminFetchJson: mocks.adminFetchJson,
}));

import { PlatformAdminsPanel } from './PlatformAdminsPanel';

describe('PlatformAdminsPanel (read-only)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders read-only list of active and revoked admins, email provider badge, and local CLI commands without mutation controls', async () => {
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
        {
          id: 'pa-2',
          email: 'soporte@tariffos.app',
          role: 'support',
          isActive: false,
          notes: 'Soporte',
          createdBy: 'cli:test',
          createdAt: '2026-11-26T10:00:00.000Z',
          updatedAt: '2026-11-26T12:00:00.000Z',
        },
      ],
      emailProvider: { configured: false, provider: 'none', fromAddress: null },
    });

    render(<PlatformAdminsPanel />);

    expect(await screen.findByText('angel.alberto.fernandez@gmail.com')).toBeInTheDocument();
    expect(screen.getByText('soporte@tariffos.app')).toBeInTheDocument();
    expect(screen.getByText('Activo')).toBeInTheDocument();
    expect(screen.getByText('Revocado')).toBeInTheDocument();
    expect(screen.getByText(/Correo automático no configurado/i)).toBeInTheDocument();
    expect(screen.getByText(/pnpm admin:users provision/i)).toBeInTheDocument();
    expect(screen.getByText(/pnpm admin:users revoke/i)).toBeInTheDocument();

    expect(screen.queryByRole('button', { name: /Crear administrador/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Revocar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Reactivar/i })).not.toBeInTheDocument();
  });
});
