import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DEFAULT_USER_PROFILE, type WorkspaceThread } from '@/lib/workspace/types';
import { computePlanStatus } from '@/lib/workspace/plan-status';
import { ThreadSidebar, type ThreadSidebarProps } from './ThreadSidebar';

const mockPush = vi.fn<(href: string) => void>();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

function renderSidebar(overrides: Partial<ThreadSidebarProps> = {}) {
  const props: ThreadSidebarProps = {
    open: true,
    threads: [],
    activeThreadId: null,
    profile: DEFAULT_USER_PROFILE,
    plan: computePlanStatus([], 'trial'),
    skuCount: 2,
    dashboardActive: false,
    onToggle: vi.fn<() => void>(),
    onNewThread: vi.fn<() => void>(),
    onSelectThread: vi.fn<(id: string) => void>(),
    onDeleteThread: vi.fn<(id: string) => void>(),
    onOpenDashboard: vi.fn<() => void>(),
    onOpenSkuCatalog: vi.fn<() => void>(),
    onChangeApprovalMode: vi.fn<() => void>(),
    ...overrides,
  };
  render(<ThreadSidebar {...props} />);
  return props;
}

describe('ThreadSidebar (Process Hub & Inbox-Zero shell)', () => {
  it('shows brand, dark "Nuevo chat", Procesos and Catálogo SKU navigation', async () => {
    const user = userEvent.setup();
    const props = renderSidebar();

    expect(screen.getByText('TariffOS')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Nuevo chat/i }));
    await user.click(screen.getByRole('button', { name: /Procesos/i }));
    await user.click(screen.getByRole('button', { name: /Catálogo SKU/i }));
    expect(props.onNewThread).toHaveBeenCalledTimes(1);
    expect(props.onOpenDashboard).toHaveBeenCalledTimes(1);
    expect(props.onOpenSkuCatalog).toHaveBeenCalledTimes(1);
  });

  it('keeps the footer compact by default and reveals plan usage + Activar plan + Configuración inside the profile menu', async () => {
    const user = userEvent.setup();
    const onOpenSettings = vi.fn<() => void>();
    renderSidebar({ plan: computePlanStatus([], 'pilot'), onOpenSettings });

    expect(screen.queryByLabelText(/Consumo del plan/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Cuenta y ajustes/i }));

    expect(screen.getByLabelText(/Consumo del plan/i)).toBeInTheDocument();
    expect(screen.getByText(/0 \/ 250 clasif\./i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Activar plan/i })).toHaveAttribute('href', '/activate-plan');
    expect(screen.getByLabelText(/Política de sellado/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Configuración/i }));
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });

  it('shows Gestionar plan inside the profile menu when on an active Agencia plan', async () => {
    const user = userEvent.setup();
    renderSidebar({ plan: computePlanStatus([], 'agencia') });

    await user.click(screen.getByRole('button', { name: /Cuenta y ajustes/i }));
    expect(screen.getByLabelText(/Consumo del plan/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Gestionar plan/i })).toHaveAttribute('href', '/activate-plan');
  });

  it('collapses to a 56px rail with accessible icon buttons', async () => {
    const user = userEvent.setup();
    const props = renderSidebar({ open: false });

    expect(screen.queryByText('TariffOS')).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Consumo del plan/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Expandir barra lateral/i }));
    expect(props.onToggle).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: /Nuevo chat/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Procesos/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Catálogo SKU \(2\)/i })).toBeInTheDocument();
  });

  it('opens settings directly from collapsed SidebarRail "Cuenta y ajustes" button and aligns h-12 horizon (Plan 2.1)', async () => {
    const user = userEvent.setup();
    const onOpenSettings = vi.fn<() => void>();
    const onToggle = vi.fn<() => void>();
    renderSidebar({ open: false, onOpenSettings, onToggle });

    const expandBtn = screen.getByRole('button', { name: /Expandir barra lateral/i });
    expect(expandBtn.closest('.h-12')).not.toBeNull();

    await user.click(screen.getByRole('button', { name: /Cuenta y ajustes/i }));
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('separates active En curso processes from 48h Consultas rápidas and clears sealed items from En curso', async () => {
    const user = userEvent.setup();
    const nowIso = new Date().toISOString();
    const threads: WorkspaceThread[] = [
      {
        id: 't-active',
        title: 'Bomba hidráulica',
        jurisdictionId: 've-seniat',
        status: 'regular',
        processKind: 'single_ruling',
        operationalStatus: 'processing',
        messages: [],
        createdAt: nowIso,
        updatedAt: nowIso,
      },
      {
        id: 't-sealed',
        title: 'Monitor LED sellado',
        jurisdictionId: 've-seniat',
        status: 'regular',
        processKind: 'single_ruling',
        operationalStatus: 'approved',
        messages: [],
        createdAt: nowIso,
        updatedAt: nowIso,
      },
      {
        id: 't-quick',
        title: '¿Qué exige el Régimen 12?',
        jurisdictionId: 've-seniat',
        status: 'regular',
        processKind: 'quick_lookup',
        operationalStatus: 'processing',
        messages: [],
        createdAt: nowIso,
        updatedAt: nowIso,
      },
    ];

    renderSidebar({ threads });
    expect(screen.getByText('Bomba hidráulica')).toBeInTheDocument();
    expect(screen.queryByText('Monitor LED sellado')).not.toBeInTheDocument();
    expect(screen.queryByText('¿Qué exige el Régimen 12?')).not.toBeInTheDocument();
    expect(screen.getByText(/Ver 1 sellado en Procesos/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Consultas rápidas/i }));
    expect(screen.getByText('¿Qué exige el Régimen 12?')).toBeInTheDocument();
  });
});
