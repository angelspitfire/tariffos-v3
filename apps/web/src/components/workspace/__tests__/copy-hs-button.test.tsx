// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CopyHsButton } from '../atoms/CopyHsButton';

describe('CopyHsButton', () => {
  it('renders and exposes dot-separated tariff codes even when given raw digits', () => {
    render(<CopyHsButton hsCode="8471309090" />);
    const button = screen.getByRole('button', { name: 'Copiar código 8471.30.90.90' });
    expect(button.textContent).toContain('8471.30.90.90');
  });
});
