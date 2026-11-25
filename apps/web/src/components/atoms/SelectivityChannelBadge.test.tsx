import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SelectivityChannelBadge } from './SelectivityChannelBadge';

describe('SelectivityChannelBadge', () => {
  it('renders Canal Verde correctly', () => {
    render(
      <SelectivityChannelBadge
        channel="green"
        reasons={[]}
      />
    );

    expect(screen.getByText('Canal Verde')).toBeInTheDocument();
  });

  it('renders Canal Rojo and reveals risk reasons on click', () => {
    render(
      <SelectivityChannelBadge
        channel="red"
        reasons={['1 requisito regulatorio bloqueante']}
      />
    );

    const badge = screen.getByRole('button', { name: /canal rojo/i });
    expect(badge).toBeInTheDocument();

    fireEvent.click(badge);
    expect(screen.getByText(/1 requisito regulatorio bloqueante/)).toBeInTheDocument();
  });
});
