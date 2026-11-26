// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BatchProgressBanner } from './BatchProgressBanner';

describe('BatchProgressBanner', () => {
  it('renders live stage progress, item counters, and dismiss button', () => {
    const onDismiss = vi.fn();

    render(
      <BatchProgressBanner
        fileName="factura-abril.xlsx"
        totalItems={24}
        connectionStatus="open"
        progress={{
          filingId: 'batch-1',
          stage: 'classifying',
          label: 'Clasificando bloque 2 de 3…',
          completedItems: 16,
          totalItems: 24,
          progressPct: 67,
          chunkIndex: 2,
          totalChunks: 3,
          ts: 1000,
        }}
        onDismiss={onDismiss}
      />,
    );

    expect(screen.getByRole('status')).toBeTruthy();
    expect(screen.getByText('factura-abril.xlsx')).toBeTruthy();
    expect(screen.getByText('Clasificando bloque 2 de 3…')).toBeTruthy();
    expect(screen.getByText('16 / 24 ítems')).toBeTruthy();
    expect(screen.getByText('67%')).toBeTruthy();
    expect(screen.getByText('En vivo')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Ocultar progreso/i }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
