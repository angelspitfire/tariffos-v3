// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CopyHsButton } from '../atoms/CopyHsButton';

describe('CopyHsButton', () => {
  it('renders and exposes dot-separated tariff codes with translate="no"', () => {
    render(<CopyHsButton hsCode="8471309090" />);
    const button = screen.getByRole('button', { name: 'Copiar código 8471.30.90.90' });
    expect(button.textContent).toContain('8471.30.90.90');
    const codeSpan = screen.getByText('8471.30.90.90');
    expect(codeSpan).toHaveAttribute('translate', 'no');
  });

  it('stops click propagation so parent row selection is not triggered', async () => {
    const user = userEvent.setup();
    const onParentClick = vi.fn();

    render(
      <div onClick={onParentClick}>
        <CopyHsButton hsCode="8504.40.90.00" />
      </div>,
    );

    await user.click(screen.getByRole('button', { name: 'Copiar código 8504.40.90.00' }));
    expect(onParentClick).not.toHaveBeenCalled();
  });
});
