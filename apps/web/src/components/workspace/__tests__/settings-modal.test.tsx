import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { JURISDICTIONS } from '@/lib/workspace/jurisdictions';
import { computePlanStatus } from '@/lib/workspace/plan-status';
import { DEFAULT_USER_PROFILE } from '@/lib/workspace/types';
import { WorkspaceSettingsModal } from '../organisms/WorkspaceSettingsModal';

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe('WorkspaceSettingsModal', () => {
  it('navigates all 4 mockup-parity tabs and saves updated profile & preferences', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn<(patch: Record<string, unknown>) => void>();
    const onClose = vi.fn<() => void>();

    render(
      <WorkspaceSettingsModal
        open
        profile={DEFAULT_USER_PROFILE}
        jurisdictions={JURISDICTIONS}
        plan={computePlanStatus([], 'trial')}
        threadsCount={3}
        skuCount={2}
        onClose={onClose}
        onSave={onSave}
      />,
    );

    expect(screen.getByText(/Identidad del operador aduanero/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Preferencias/i }));
    expect(screen.getByText(/Parámetros predeterminados de análisis/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Alertas normativas/i }));
    expect(screen.getByText(/Alertas y boletines normativos/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Notificaciones/i }));
    await user.click(screen.getByRole('button', { name: /Probar alerta/i }));
    expect(screen.getByText(/Vista previa enviada/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Plan y Pagos/i }));
    expect(screen.getByText(/Planes disponibles/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Datos locales/i }));
    expect(screen.getByText(/Expedientes guardados/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Guardar cambios/i }));
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders as an accessible Radix dialog with data-workspace-dialog="open" and guards unsaved changes on Cancel/Escape', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn<() => void>();

    render(
      <WorkspaceSettingsModal
        open
        profile={DEFAULT_USER_PROFILE}
        jurisdictions={JURISDICTIONS}
        plan={computePlanStatus([], 'trial')}
        threadsCount={3}
        skuCount={2}
        onClose={onClose}
        onSave={vi.fn()}
      />,
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('data-workspace-dialog', 'open');

    const nameInput = screen.getByLabelText(/Nombre completo/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'María Pérez');

    await user.click(screen.getByRole('button', { name: /Cancelar/i }));
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByText(/Hay cambios sin guardar/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Seguir editando/i }));
    expect(screen.queryByText(/Hay cambios sin guardar/i)).not.toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByText(/Hay cambios sin guardar/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Descartar cambios/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('requires a 2-step inline confirmation before clearing local browser data', async () => {
    const user = userEvent.setup();
    const onClearLocalData = vi.fn<() => void>();

    render(
      <WorkspaceSettingsModal
        open
        profile={DEFAULT_USER_PROFILE}
        jurisdictions={JURISDICTIONS}
        plan={computePlanStatus([], 'trial')}
        threadsCount={3}
        skuCount={2}
        onClose={vi.fn()}
        onSave={vi.fn()}
        onClearLocalData={onClearLocalData}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Datos locales/i }));
    await user.click(screen.getByRole('button', { name: /Limpiar caché local del navegador/i }));
    expect(onClearLocalData).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /Confirmar borrado local/i }));
    expect(onClearLocalData).toHaveBeenCalledTimes(1);
  });
});
