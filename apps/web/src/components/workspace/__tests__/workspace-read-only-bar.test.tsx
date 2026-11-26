import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WorkspaceReadOnlyBar } from '../molecules/WorkspaceReadOnlyBar';

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe('WorkspaceReadOnlyBar', () => {
  it('renders read-only notice with reason and /activate-plan CTA link', () => {
    render(
      <WorkspaceReadOnlyBar reason="Activa tu Piloto Operativo ($150 · 250 clasificaciones) para clasificar con IA." />,
    );
    expect(screen.getByText(/Espacio en modo lectura/i)).toBeInTheDocument();
    expect(screen.getByText(/Piloto Operativo \(\$150/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Activar plan/i })).toHaveAttribute(
      'href',
      '/activate-plan?plan=pilot',
    );
  });
});