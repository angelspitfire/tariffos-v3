import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TariffReferenceProvider, useTariffReference } from './TariffReferenceProvider';
import { type TariffItem } from '@/types';

const makeItem = (overrides: Partial<TariffItem> = {}): TariffItem => ({
  code: '0101.21.00.00',
  description: 'Horses',
  descriptionEs: 'Caballos',
  dutyAdValorem: 10,
  vat: 16,
  fodinfa: 0.5,
  unit: 'UN',
  status: 'active',
  requiresPermit: false,
  permitAgencies: [],
  ...overrides,
});

const Consumers = () => {
  const { favorites, history, toggleFavorite, removeFavorite, addToHistory, removeFromHistory, clearHistory } =
    useTariffReference();
  return (
    <div>
      <span data-testid="fav-count">{favorites.length}</span>
      <span data-testid="hist-count">{history.length}</span>
      <button
        onClick={() => toggleFavorite(makeItem({ code: '0101.21.00.00' }))}
        data-testid="add-fav"
        aria-label="Agregar a favoritos"
      />
      <button onClick={() => removeFavorite('0101.21.00.00')} data-testid="rem-fav" aria-label="Quitar de favoritos" />
      <button
        onClick={() => addToHistory({ code: '8504.40.00.00', name: 'Inv', searchedAt: '2026-01-01T00:00:00Z', viewedAt: '2026-01-01T00:00:00Z' })}
        data-testid="add-hist"
        aria-label="Agregar al historial"
      />
      <button onClick={() => removeFromHistory('8504.40.00.00')} data-testid="rem-hist" aria-label="Quitar del historial" />
      <button onClick={clearHistory} data-testid="clear-hist" aria-label="Limpiar historial" />
    </div>
  );
};

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.clearAllMocks();
});

afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

describe('TariffReferenceProvider', () => {
  it('persists favorites to localStorage and history to sessionStorage', () => {
    render(
      <TariffReferenceProvider>
        <Consumers />
      </TariffReferenceProvider>
    );
    fireEvent.click(screen.getByTestId('add-fav'));
    expect(screen.getByTestId('fav-count').textContent).toBe('1');
    expect(localStorage.getItem('tariffos:favorites')).not.toBeNull();
    expect(JSON.parse(localStorage.getItem('tariffos:favorites')!).length).toBe(1);

    fireEvent.click(screen.getByTestId('add-hist'));
    expect(screen.getByTestId('hist-count').textContent).toBe('1');
    expect(sessionStorage.getItem('tariffos:history')).not.toBeNull();
  });

  it('removes a favorite and clears history', () => {
    render(
      <TariffReferenceProvider>
        <Consumers />
      </TariffReferenceProvider>
    );
    // seed one favorite (code 8504.40.00.00) then remove it
    fireEvent.click(screen.getByTestId('add-fav'));
    expect(screen.getByTestId('fav-count').textContent).toBe('1');
    fireEvent.click(screen.getByTestId('rem-fav'));
    expect(screen.getByTestId('fav-count').textContent).toBe('0');

    fireEvent.click(screen.getByTestId('add-hist'));
    expect(screen.getByTestId('hist-count').textContent).toBe('1');
    fireEvent.click(screen.getByTestId('clear-hist'));
    expect(screen.getByTestId('hist-count').textContent).toBe('0');
  });
});
