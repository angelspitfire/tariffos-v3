import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CustomsAuditLog } from './CustomsAuditLog';
import type { AuditLogEntry } from '@/lib/audit-log';

describe('CustomsAuditLog', () => {
  const mockEntries: AuditLogEntry[] = [
    {
      id: 'aud-1',
      timestamp: '10:30:15',
      actor: 'broker',
      action: 'Ajuste de partida',
      details: 'Modificación manual de código arancelario en ítem #3',
      diff: { before: '8504.40.90.00', after: '8504.40.90.90' },
    },
    {
      id: 'aud-2',
      timestamp: '10:28:00',
      actor: 'system',
      action: 'Apertura de despacho',
      details: 'Despacho TR-2024-8849-VE inicializado con canal Rojo',
    },
  ];

  it('renders empty state when there are no entries', () => {
    render(<CustomsAuditLog entries={[]} />);
    expect(screen.getByText('No hay registros en la bitácora aún.')).toBeInTheDocument();
  });

  it('renders audit entries with actor badges and details', () => {
    render(<CustomsAuditLog entries={mockEntries} />);

    expect(screen.getByText('Ajuste de partida')).toBeInTheDocument();
    expect(screen.getByText('Agente Aduanal')).toBeInTheDocument();
    expect(screen.getByText('Apertura de despacho')).toBeInTheDocument();
    expect(screen.getByText('Sistema')).toBeInTheDocument();
    expect(screen.getByText('8504.40.90.00')).toBeInTheDocument();
    expect(screen.getByText('8504.40.90.90')).toBeInTheDocument();
  });
});
