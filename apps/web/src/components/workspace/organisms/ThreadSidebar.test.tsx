import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DEFAULT_USER_PROFILE } from '@/lib/workspace/types';
import { computePlanStatus } from '@/lib/workspace/plan-status';
import { ThreadSidebar, type ThreadSidebarProps } from './ThreadSidebar';

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

describe('ThreadSidebar (mockup shell)', () => {
  it('shows brand, dark "Nuevo chat", Dashboard and Catálogo SKU navigation', async () => {
    const user = userEvent.setup();
    const props = renderSidebar();

    expect(screen.getByText('TariffOS')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Nuevo chat/i }));
    await user.click(screen.getByRole('button', { name: /Dashboard/i }));
    await user.click(screen.getByRole('button', { name: /Catálogo SKU/i }));
    expect(props.onNewThread).toHaveBeenCalledTimes(1);
    expect(props.onOpenDashboard).toHaveBeenCalledTimes(1);
    expect(props.onOpenSkuCatalog).toHaveBeenCalledTimes(1);
  });

  it('keeps the footer compact by default and reveals plan usage + Activar plan inside the profile menu', async () => {
    const user = userEvent.setup();
    renderSidebar();

    expect(screen.queryByLabelText(/Consumo del plan/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Cuenta y ajustes/i }));

    expect(screen.getByLabelText(/Consumo del plan/i)).toBeInTheDocument();
    expect(screen.getByText(/0 \/ 5 clasif\./i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Activar plan/i })).toHaveAttribute('href', '/activate-plan');
    expect(screen.getByLabelText(/Política de sellado/i)).toBeInTheDocument();
  });

  it('shows Gestionar plan inside the profile menu when on a paid plan', async () => {
    const user = userEvent.setup();
    renderSidebar({ plan: computePlanStatus([], 'basico') });

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
    expect(screen.getByRole('button', { name: /Dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Catálogo SKU \(2\)/i })).toBeInTheDocument();
  });
});
