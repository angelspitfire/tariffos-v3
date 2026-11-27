import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarkdownProse } from './MarkdownProse';

describe('MarkdownProse', () => {
  it('renders headings, bold, inline code, lists, and Markdown tables cleanly', () => {
    const md = [
      '### Análisis RGI 1 → 6',
      '',
      'La partida **8504.40.90.00** aplica por `RGI 1` y *nota legal*.',
      '',
      '- Ad Valorem: 10%',
      '- IVA: 16%',
      '',
      '| Concepto | Monto |',
      '| --- | --- |',
      '| CIF | USD 1,000.00 |',
    ].join('\n');

    render(<MarkdownProse text={md} />);

    expect(screen.getByRole('heading', { name: /Análisis RGI 1/i })).toBeInTheDocument();
    expect(screen.getByText('8504.40.90.00').tagName).toBe('STRONG');
    expect(screen.getByText('RGI 1').tagName).toBe('CODE');
    expect(screen.getByText('nota legal').tagName).toBe('EM');
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('USD 1,000.00')).toBeInTheDocument();
  });
});
