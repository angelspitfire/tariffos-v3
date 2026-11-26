import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { A2UICalculatorComponent, A2UIDossierComponent } from '@tariffos/shared-types';
import { CanvasStatusStrip } from '../molecules/CanvasStatusStrip';
import { CanvasTitleBar } from '../molecules/CanvasTitleBar';
import { MerceologicalSpecsCard } from '../molecules/MerceologicalSpecsCard';

const sampleDossier: A2UIDossierComponent = {
  type: 'dossier',
  id: 'dos-1',
  title: 'Ecógrafo',
  hsCode: '9018.12.10.00',
  officialDescription: 'Aparatos de diagnóstico por ultrasonido',
  jurisdictionName: 'Venezuela (SENIAT)',
  rgiSteps: [],
  legalNotes: [],
  technicalSpecs: [{ key: 'Mercancía', value: 'Ecógrafo Doppler' }],
  permits: [{ code: 'R3', name: 'Registro Sanitario', organism: 'SACS' }],
};

const sampleCalc: A2UICalculatorComponent = {
  type: 'calculator',
  id: 'calc-1',
  title: 'Liquidación CIF',
  hsCode: '9018.12.10.00',
  adValoremPercent: 0,
  vatPercent: 16,
  customsServiceFeePercent: 1,
  currencyCode: 'USD',
  localCurrencyCode: 'VES',
  suggestedExchangeRate: 36.5,
  exemptionAvailable: true,
};

describe('Canvas hierarchy components', () => {
  it('CanvasTitleBar renders code label and triggers fullscreen & close', async () => {
    const user = userEvent.setup();
    const onToggleFullscreen = vi.fn<() => void>();
    const onClose = vi.fn<() => void>();

    render(
      <CanvasTitleBar
        codeLabel="9018.12.10.00"
        onToggleFullscreen={onToggleFullscreen}
        onClose={onClose}
      />,
    );

    expect(screen.getByText('9018.12.10.00')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Expandir Canvas/i }));
    await user.click(screen.getByRole('button', { name: /Cerrar panel de dictamen/i }));
    expect(onToggleFullscreen).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('CanvasStatusStrip shows max 3 concise badges and switches tabs on click', async () => {
    const user = userEvent.setup();
    const onSelectTab = vi.fn<(tab: string) => void>();

    render(
      <CanvasStatusStrip
        dossier={sampleDossier}
        calculator={sampleCalc}
        onSelectTab={onSelectTab}
      />,
    );

    expect(screen.getByText('Sujeta a control')).toBeInTheDocument();
    expect(screen.getByText('Requiere permiso (1)')).toBeInTheDocument();
    expect(screen.getByText('Exenta de aranceles (0%)')).toBeInTheDocument();

    await user.click(screen.getByText('Sujeta a control'));
    expect(onSelectTab).toHaveBeenCalledWith('regulatory_diff');
  });

  it('MerceologicalSpecsCard toggles edit mode and submits updated specs', async () => {
    const user = userEvent.setup();
    const onReevaluate = vi.fn<(specs: Array<{ key: string; value: string }>) => void>();

    render(
      <MerceologicalSpecsCard
        specs={sampleDossier.technicalSpecs}
        onReevaluate={onReevaluate}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Editar ficha/i }));
    const valueInput = screen.getByLabelText(/Valor de Mercancía/i);
    await user.clear(valueInput);
    await user.type(valueInput, 'Ecógrafo Doppler 4D');
    await user.click(screen.getByRole('button', { name: /Reevaluar dictamen/i }));

    expect(onReevaluate).toHaveBeenCalledWith([
      { key: 'Mercancía', value: 'Ecógrafo Doppler 4D' },
    ]);
  });
});
