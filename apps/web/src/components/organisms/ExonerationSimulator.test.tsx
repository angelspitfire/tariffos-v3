// @ts-nocheck
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExonerationSimulator } from './ExonerationSimulator';
import { ExonerationSimulatorPayload } from '@/types/exoneration';
import { I18nProvider } from '@/lib/i18n';

const mockPayload: ExonerationSimulatorPayload = {
  filingId: 'FIL-001',
  cifUsd: 50000,
  baseAdValoremRate: 5,
  vatRate: 15,
  fodinfaRate: 0.5,
  activeRegimeId: 'regime-1',
  regimes: [
    {
      id: 'regime-1',
      name: 'Acuerdo Comercial Mercosur',
      code: 'MERCOSUR',
      description: 'Arancel reducido bajo acuerdo Mercosur',
      adValoremReliefRate: 0.5,
      fodinfaExempt: true,
      requiresOriginCert: true,
    },
    {
      id: 'regime-2',
      name: 'Régimen General',
      code: 'GENERAL',
      description: 'Arancel general sin beneficios',
      adValoremReliefRate: 0,
      fodinfaExempt: false,
      requiresOriginCert: false,
    },
  ],
  currencies: [
    { code: 'USD', symbol: '$', rateToUsd: 1, label: 'Dólar Estadounidense' },
    { code: 'EUR', symbol: '€', rateToUsd: 1.08, label: 'Euro' },
    { code: 'VES', symbol: 'Bs.', rateToUsd: 0.02, label: 'Bolívar Digital' },
  ],
};

describe('ExonerationSimulator', () => {
  it('renders with payload data', () => {
    render(
      <I18nProvider>
        <ExonerationSimulator payload={mockPayload} isLoading={false} />
      </I18nProvider>
    );
    expect(screen.getByText('Simulador de Acuerdos Comerciales y Exoneraciones')).toBeInTheDocument();
    expect(screen.getByText('Proyección fiscal bajo tratados · CIF $50,000 USD')).toBeInTheDocument();
    expect(screen.getByText('Base Imponible')).toBeInTheDocument();
    expect(screen.getByText('$50,000 USD')).toBeInTheDocument();
  });

  it('displays regime options with key data points', () => {
    render(
      <I18nProvider>
        <ExonerationSimulator payload={mockPayload} isLoading={false} />
      </I18nProvider>
    );
    expect(screen.getByText('Acuerdo Comercial Mercosur')).toBeInTheDocument();
    expect(screen.getByText('Arancel reducido bajo acuerdo Mercosur')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('Régimen General')).toBeInTheDocument();
    expect(screen.getByText('Arancel general sin beneficios')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('displays currency options', () => {
    render(
      <I18nProvider>
        <ExonerationSimulator payload={mockPayload} isLoading={false} />
      </I18nProvider>
    );
    expect(screen.getByText('USD')).toBeInTheDocument();
    expect(screen.getByText('EUR')).toBeInTheDocument();
    expect(screen.getByText('VES')).toBeInTheDocument();
    expect(screen.getByText('Dólar Estadounidense')).toBeInTheDocument();
    expect(screen.getByText('Euro')).toBeInTheDocument();
    expect(screen.getByText('Bolívar Digital')).toBeInTheDocument();
  });

  it('displays savings projection', () => {
    render(
      <I18nProvider>
        <ExonerationSimulator payload={mockPayload} isLoading={false} />
      </I18nProvider>
    );
    expect(screen.getByText('Proyección de Ahorro (vs Régimen General)')).toBeInTheDocument();
    expect(screen.getByText('Arancel Ad-Valorem')).toBeInTheDocument();
    expect(screen.getByText(/FODINFA \(0\.5%\)/)).toBeInTheDocument();
    // Component uses IVA_RATE_PERCENT = 16%
    expect(screen.getByText(/IVA Aduanero \(16%\)/)).toBeInTheDocument();
  });

  it('renders radio buttons for regime selection', () => {
    render(
      <I18nProvider>
        <ExonerationSimulator payload={mockPayload} isLoading={false} />
      </I18nProvider>
    );
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(2);
    fireEvent.click(radios[0]);
    expect(radios[0]).toBeChecked();
  });

  it('renders loading skeleton when isLoading=true', () => {
    render(
      <I18nProvider>
        <ExonerationSimulator payload={mockPayload} isLoading={true} />
      </I18nProvider>
    );
    expect(screen.queryByText('Simulador de Acuerdos Comerciales y Exoneraciones')).not.toBeInTheDocument();
    expect(screen.queryByText('Base Imponible')).not.toBeInTheDocument();
  });
});
