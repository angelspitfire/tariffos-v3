// @ts-nocheck
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TariffSearch } from './TariffSearch';
import { type TariffSearchResult } from '@/types/tariff-reference';

const mockItems: TariffSearchResult[] = [
  {
    code: '0101.21.00.00',
    description: 'Pure-bred breeding horses',
    descriptionEs: 'Caballos de pura raza para reproduccion',
    chapterCode: '01',
    headingCode: '0101',
    score: 1,
    matchType: 'exact',
  },
  {
    code: '0101.29.00.00',
    description: 'Other pure-bred horses',
    descriptionEs: 'Otros caballos de pura raza',
    chapterCode: '01',
    headingCode: '0101',
    score: 0.8,
    matchType: 'prefix',
  },
  {
    code: '0201.10.00.00',
    description: 'Bovine meat, fresh or chilled',
    descriptionEs: 'Carne bovina, fresca o refrigerada',
    chapterCode: '02',
    headingCode: '0201',
    score: 0.5,
    matchType: 'fuzzy',
  },
];

describe('TariffSearch', () => {
  it('renders input with placeholder and search icon', () => {
    render(<TariffSearch value="" onChange={vi.fn()} onSelect={vi.fn()} items={mockItems} />);
    const input = screen.getByRole('combobox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Buscar arancel...');
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
  });

  it('calls onChange when user types', () => {
    const onChange = vi.fn();
    render(<TariffSearch value="" onChange={onChange} onSelect={vi.fn()} items={mockItems} />);
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'caballo' } });
    expect(onChange).toHaveBeenCalledWith('caballo');
  });

  it('shows clear button when query has content', () => {
    const onChange = vi.fn();
    render(
      <TariffSearch value="caballo" onChange={onChange} onSelect={vi.fn()} items={mockItems} />,
    );
    expect(screen.getByRole('button', { name: 'Limpiar busqueda' })).toBeInTheDocument();
  });

  it('calls onChange with empty string when clear is clicked', () => {
    const onChange = vi.fn();
    render(
      <TariffSearch value="caballo" onChange={onChange} onSelect={vi.fn()} items={mockItems} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Limpiar busqueda' }));
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('shows loading spinner during debounce search', async () => {
    const onChange = vi.fn();
    render(
      <TariffSearch value="caballo" onChange={onChange} onSelect={vi.fn()} items={mockItems} />,
    );
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    }, { timeout: 500 });
  });

  it('shows suggestions after debounce', async () => {
    const onChange = vi.fn();
    render(
      <TariffSearch value="0101" onChange={onChange} onSelect={vi.fn()} items={mockItems} />,
    );
    await waitFor(() => {
      const listbox = screen.getByRole('listbox');
      expect(listbox).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /0101\.21\.00\.00/ })).toBeInTheDocument();
    }, { timeout: 500 });
  });

  it('calls onSelect when clicking a suggestion', async () => {
    const onSelect = vi.fn();
    render(<TariffSearch value="0101" onChange={vi.fn()} onSelect={onSelect} items={mockItems} />);
    await waitFor(() => {
      expect(screen.getByRole('option', { name: /0101\.21\.00\.00/ })).toBeInTheDocument();
    }, { timeout: 500 });
    fireEvent.click(screen.getByRole('option', { name: /0101\.21\.00\.00/ }));
    expect(onSelect).toHaveBeenCalledWith(mockItems[0]);
  });

  it('navigates suggestions with ArrowDown and ArrowUp', async () => {
    const onSelect = vi.fn();
    render(<TariffSearch value="0101" onChange={vi.fn()} onSelect={onSelect} items={mockItems} />);
    await waitFor(() => {
      const input = screen.getByRole('combobox');
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      expect(screen.getByRole('option', { name: /0101\.21\.00\.00/ })).toHaveAttribute(
        'aria-selected',
        'true',
      );
    }, { timeout: 500 });

    await waitFor(() => {
      const input = screen.getByRole('combobox');
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      expect(screen.getByRole('option', { name: /0101\.29\.00\.00/ })).toHaveAttribute(
        'aria-selected',
        'true',
      );
    }, { timeout: 500 });

    await waitFor(() => {
      const input = screen.getByRole('combobox');
      fireEvent.keyDown(input, { key: 'ArrowUp' });
      expect(screen.getByRole('option', { name: /0101\.21\.00\.00/ })).toHaveAttribute(
        'aria-selected',
        'true',
      );
    }, { timeout: 500 });
  });

  it('selects highlighted suggestion on Enter', async () => {
    const onSelect = vi.fn();
    render(<TariffSearch value="0101" onChange={vi.fn()} onSelect={onSelect} items={mockItems} />);
    await waitFor(() => {
      const input = screen.getByRole('combobox');
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(onSelect).toHaveBeenCalledWith(mockItems[0]);
    }, { timeout: 500 });
  });

  it('closes dropdown on Escape', async () => {
    const onSelect = vi.fn();
    render(<TariffSearch value="0101" onChange={vi.fn()} onSelect={onSelect} items={mockItems} />);
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    }, { timeout: 500 });

    const input = screen.getByRole('combobox');
    fireEvent.keyDown(input, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    }, { timeout: 500 });
  });

  it('shows no results message when no items match', async () => {
    const onChange = vi.fn();
    render(
      <TariffSearch value="xyz999" onChange={onChange} onSelect={vi.fn()} items={mockItems} />,
    );
    await waitFor(() => {
      expect(screen.getByText('No se encontraron resultados')).toBeInTheDocument();
    }, { timeout: 500 });
  });

  it('does not show suggestions when disabled', () => {
    render(
      <TariffSearch
        value="0101"
        onChange={vi.fn()}
        onSelect={vi.fn()}
        items={mockItems}
        disabled
      />,
    );
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('highlights matched text in code and description', async () => {
    const onChange = vi.fn();
    render(<TariffSearch value="0101" onChange={onChange} onSelect={vi.fn()} items={mockItems} />);
    await waitFor(() => {
      const codeEl = screen.getByRole('option', { name: /0101\.21\.00\.00/ });
      expect(codeEl).toBeInTheDocument();
      const marks = codeEl.querySelectorAll('mark');
      expect(marks.length).toBeGreaterThan(0);
    }, { timeout: 500 });
  });
});
