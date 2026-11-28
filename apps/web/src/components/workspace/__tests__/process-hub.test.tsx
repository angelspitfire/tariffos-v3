// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { WorkspaceThread } from '@/lib/workspace/types';
import { ClientRefInlineChip } from '../molecules/ClientRefInlineChip';
import { ProcessHubView } from '../organisms/ProcessHubView';

const THREADS: WorkspaceThread[] = [
  {
    id: 'p-review',
    title: 'Concentrado aromático bebidas',
    jurisdictionId: 've-seniat',
    status: 'regular',
    processKind: 'oga_escalation',
    operationalStatus: 'in_review',
    clientRef: 'Importadora Polar · BL-8821',
    primaryHsCode: '2106.90.29.00',
    messages: [],
    createdAt: '2026-11-28T09:00:00Z',
    updatedAt: '2026-11-28T11:00:00Z',
  },
  {
    id: 'p-batch',
    title: 'Factura repuestos #404',
    jurisdictionId: 've-seniat',
    status: 'regular',
    processKind: 'invoice_batch',
    operationalStatus: 'needs_input',
    clientRef: 'AutoPartes VE',
    primaryHsCode: 'Lote · 10 ítems',
    itemProgress: { total: 10, completed: 7, needsInfo: 3 },
    messages: [],
    createdAt: '2026-11-28T08:00:00Z',
    updatedAt: '2026-11-28T10:30:00Z',
  },
  {
    id: 'p-sealed',
    title: 'Inversor solar 5kW',
    jurisdictionId: 've-seniat',
    status: 'regular',
    processKind: 'single_ruling',
    operationalStatus: 'approved',
    primaryHsCode: '8504.40.90.00',
    messages: [],
    createdAt: '2026-11-28T07:00:00Z',
    updatedAt: '2026-11-28T09:30:00Z',
  },
  {
    id: 'q-lookup',
    title: '¿Qué es el Régimen Legal 12?',
    jurisdictionId: 've-seniat',
    status: 'regular',
    processKind: 'quick_lookup',
    operationalStatus: 'processing',
    messages: [],
    createdAt: '2026-11-28T06:00:00Z',
    updatedAt: '2026-11-28T08:30:00Z',
  },
];

describe('ProcessHubView & ClientRefInlineChip (Plan Fase A)', () => {
  it('excludes quick_lookup threads, filters via KPI strip click, and switches Table ↔ Board views', async () => {
    const user = userEvent.setup();
    const onOpenProcess = vi.fn<(id: string) => void>();
    const onArchiveProcess = vi.fn<(id: string) => void>();

    render(
      <ProcessHubView
        threads={THREADS}
        onOpenProcess={onOpenProcess}
        onArchiveProcess={onArchiveProcess}
        onNewThread={vi.fn<() => void>()}
        onClose={vi.fn<() => void>()}
      />,
    );

    expect(screen.getByText('Centro de Procesos')).toBeInTheDocument();
    expect(screen.queryByText(/Régimen Legal 12/i)).not.toBeInTheDocument();
    expect(screen.getByText('Concentrado aromático bebidas')).toBeInTheDocument();
    expect(screen.getByText('Factura repuestos #404')).toBeInTheDocument();

    // Clicking KPI "Por aprobar" narrows down to only in_review items
    await user.click(screen.getByRole('button', { name: /Por aprobar/i }));
    expect(screen.getByText('Concentrado aromático bebidas')).toBeInTheDocument();
    expect(screen.queryByText('Factura repuestos #404')).not.toBeInTheDocument();

    // Clicking again clears the KPI filter
    await user.click(screen.getByRole('button', { name: /Por aprobar/i }));
    expect(screen.getByText('Factura repuestos #404')).toBeInTheDocument();

    // Switch to Board view (4 operational columns)
    await user.click(screen.getByRole('button', { name: /Tablero/i }));
    expect(screen.getByRole('region', { name: /Columna Por aprobar/i })).toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: /Abrir/i })[0]!);
    expect(onOpenProcess).toHaveBeenCalled();
  });

  it('edits Client / Ref inline in WorkspaceHeader48 on Enter and cancels on Escape', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn<(value: string | null) => void>();

    render(<ClientRefInlineChip value={null} onSave={onSave} />);
    await user.click(screen.getByRole('button', { name: /Etiquetar cliente o referencia/i }));
    const input = screen.getByLabelText(/Cliente o referencia del despacho/i);
    await user.type(input, 'Polar · FAC-99{Enter}');
    expect(onSave).toHaveBeenCalledWith('Polar · FAC-99');
  });
});
