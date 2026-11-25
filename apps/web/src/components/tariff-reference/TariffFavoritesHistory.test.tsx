import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TariffFavoritesHistory } from './TariffFavoritesHistory';
import {
  type TariffFavorite,
  type TariffHistoryEntry,
  type TariffItem,
} from '@/types';

const makeItem = (overrides: Partial<TariffItem> = {}): TariffItem => ({
  code: '0101.21.00.00',
  description: 'Horses',
  descriptionEs: 'Caballos',
  dutyAdValorem: 10,
  dutyRate: 10,
  vat: 16,
  fodinfa: 0.5,
  unit: 'UN',
  status: 'active' as const,
  requiresPermit: false,
  permitAgencies: [],
  ...overrides,
});

const allItems = new Map<string, TariffItem>([
  [
    '0101.21.00.00',
    makeItem({ code: '0101.21.00.00', description: 'Horses', dutyRate: 10 }),
  ],
  [
    '8504.40.00.00',
    makeItem({ code: '8504.40.00.00', description: 'Inverters', dutyRate: 5 }),
  ],
]);

const favorites: TariffFavorite[] = [
  {
    id: 'fav-1',
    code: '0101.21.00.00',
    name: 'Horses',
    addedAt: '2026-11-10T10:00:00Z',
    createdAt: '2026-11-10T10:00:00Z',
  },
  {
    id: 'fav-2',
    code: '8504.40.00.00',
    name: 'Inverters',
    addedAt: '2026-11-12T09:00:00Z',
    createdAt: '2026-11-12T09:00:00Z',
  },
];

const history: TariffHistoryEntry[] = [
  {
    id: 'hist-1',
    code: '8504.40.00.00',
    name: 'Inverters',
    viewedAt: '2026-11-15T08:00:00Z',
    searchedAt: '2026-11-15T08:00:00Z',
  },
  {
    id: 'hist-2',
    code: '0101.21.00.00',
    name: 'Horses',
    viewedAt: '2026-11-14T08:00:00Z',
    searchedAt: '2026-11-14T08:00:00Z',
  },
];

const renderPanel = (props?: Partial<Parameters<typeof TariffFavoritesHistory>[0]>) => {
  return render(
    <TariffFavoritesHistory
      favorites={favorites}
      history={history}
      allItems={allItems}
      onSelect={vi.fn()}
      onRemoveFavorite={vi.fn()}
      onClearHistory={vi.fn()}
      activeTab="favorites"
      onTabChange={vi.fn()}
      {...props}
    />
  );
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('TariffFavoritesHistory', () => {
  it('renders favorites list with code, description and duty rate', () => {
    renderPanel();
    expect(screen.getByText('0101.21.00.00')).toBeInTheDocument();
    expect(screen.getByText('Horses')).toBeInTheDocument();
    expect(screen.getByText('10.00%')).toBeInTheDocument();
    expect(screen.getByText('8504.40.00.00')).toBeInTheDocument();
    expect(screen.getByText('Inverters')).toBeInTheDocument();
    expect(screen.getByText('5.00%')).toBeInTheDocument();
  });

  it('shows the favorites empty state when there are no favorites', () => {
    renderPanel({ favorites: [], activeTab: 'favorites' });
    expect(screen.getByText('No hay favoritos guardados')).toBeInTheDocument();
    expect(screen.queryByText('0101.21.00.00')).not.toBeInTheDocument();
  });

  it('shows the history empty state when there is no history', () => {
    renderPanel({ history: [], activeTab: 'history' });
    expect(screen.getByText('Sin historial reciente')).toBeInTheDocument();
  });

  it('switches tabs and calls onTabChange', () => {
    const onTabChange = vi.fn();
    renderPanel({ activeTab: 'favorites', onTabChange });
    expect(screen.queryByText('No hay favoritos guardados')).not.toBeInTheDocument();
    expect(screen.getByText('0101.21.00.00')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Historial'));
    expect(onTabChange).toHaveBeenCalledWith('history');
    expect(screen.queryByText('No hay favoritos guardados')).not.toBeInTheDocument();
    expect(screen.getByText('Inverters')).toBeInTheDocument();
    expect(screen.getByText('Horses')).toBeInTheDocument();
  });

  it('calls onSelect when a favorite row is clicked', () => {
    const onSelect = vi.fn();
    renderPanel({ onSelect });
    fireEvent.click(screen.getByText('Inverters').closest('li')!);
    expect(onSelect).toHaveBeenCalledWith('8504.40.00.00');
  });

  it('calls onRemoveFavorite when the trash icon is clicked', () => {
    const onRemoveFavorite = vi.fn();
    renderPanel({ onRemoveFavorite });
    const trash = screen.getByRole('button', {
      name: 'Eliminar 0101.21.00.00',
    });
    fireEvent.click(trash);
    expect(onRemoveFavorite).toHaveBeenCalledWith('0101.21.00.00');
  });

  it('calls onClearHistory when Limpiar historial is clicked', () => {
    const onClearHistory = vi.fn();
    renderPanel({ activeTab: 'history', onClearHistory });
    fireEvent.click(screen.getByText('Limpiar historial'));
    expect(onClearHistory).toHaveBeenCalled();
  });

  it('navigates with keyboard and selects with Enter', () => {
    const onSelect = vi.fn();
    const { container } = renderPanel({ onSelect });
    const list = container.querySelector('[aria-label="Favoritos"]')!;
    fireEvent.keyDown(list, { key: 'ArrowDown' });
    fireEvent.keyDown(list, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith('0101.21.00.00');
  });

  it('removes the focused favorite with Delete', () => {
    const onRemoveFavorite = vi.fn();
    const { container } = renderPanel({ onRemoveFavorite });
    const list = container.querySelector('[aria-label="Favoritos"]')!;
    fireEvent.keyDown(list, { key: 'ArrowDown' });
    fireEvent.keyDown(list, { key: 'Delete' });
    expect(onRemoveFavorite).toHaveBeenCalledWith('0101.21.00.00');
  });
});
