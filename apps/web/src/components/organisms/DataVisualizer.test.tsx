// @ts-nocheck
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DataVisualizer } from './DataVisualizer';
import { DataVisualizerPayload } from '@/types/generative-payloads';

const mockPayload: DataVisualizerPayload = {
  data: [
    { Enero: 12000 },
    { Febrero: 19000 },
    { Marzo: 15000 },
    { Abril: 22000 },
  ],
  xKey: 'mes',
  series: [{ type: 'bar' }],
  title: 'CIF Mensual por Línea',
  subtitle: 'Evolución del valor CIF mensual en USD',
  height: 300,
};

describe('DataVisualizer', () => {
  it('renders with payload data', () => {
    render(<DataVisualizer payload={mockPayload} isLoading={false} />);
    expect(screen.getByText('CIF Mensual por Línea')).toBeInTheDocument();
    expect(screen.getByText('Evolución del valor CIF mensual en USD')).toBeInTheDocument();
  });

  it('displays chart type and data points', () => {
    render(<DataVisualizer payload={mockPayload} isLoading={false} />);
    expect(screen.getByText('Chart visualization: bar')).toBeInTheDocument();
    expect(screen.getByText('Datos')).toBeInTheDocument();
    expect(screen.getByText('Enero')).toBeInTheDocument();
    expect(screen.getByText('12000')).toBeInTheDocument();
    expect(screen.getByText('Febrero')).toBeInTheDocument();
    expect(screen.getByText('19000')).toBeInTheDocument();
    expect(screen.getByText('Marzo')).toBeInTheDocument();
    expect(screen.getByText('15000')).toBeInTheDocument();
    expect(screen.getByText('Abril')).toBeInTheDocument();
    expect(screen.getByText('22000')).toBeInTheDocument();
  });

  it('defaults to bar chart when no series type is specified', () => {
    render(<DataVisualizer payload={{ ...mockPayload, series: [{}] } as unknown as DataVisualizerPayload} isLoading={false} />);
    expect(screen.getByText('Chart visualization: bar')).toBeInTheDocument();
  });

  it('renders loading skeleton when isLoading=true', () => {
    render(<DataVisualizer payload={mockPayload} isLoading={true} />);
    expect(screen.queryByText('CIF Mensual por Línea')).not.toBeInTheDocument();
    expect(screen.queryByText('Datos')).not.toBeInTheDocument();
  });
});
