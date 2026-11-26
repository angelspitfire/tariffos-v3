import { beforeAll, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LandingLoopHero } from './LandingLoopHero';
import { LandingShowcaseCarousel } from './LandingShowcaseCarousel';
import { LandingWorkflowSection } from './LandingWorkflowSection';

beforeAll(() => {
  if (typeof globalThis.IntersectionObserver === 'undefined') {
    globalThis.IntersectionObserver = class IntersectionObserver {
      observe = vi.fn<() => void>();
      unobserve = vi.fn<() => void>();
      disconnect = vi.fn<() => void>();
      takeRecords = vi.fn<() => IntersectionObserverEntry[]>(() => []);
      root = null;
      rootMargin = '';
      scrollMargin = '';
      thresholds = [];
    } as unknown as typeof IntersectionObserver;
  }
});

describe('LandingLoopHero', () => {
  it('renders all four loop stages and toggles pause/resume state', async () => {
    const user = userEvent.setup();
    render(<LandingLoopHero />);

    expect(screen.getByText('INGESTA')).toBeInTheDocument();
    expect(screen.getByText('FICHA HITL')).toBeInTheDocument();
    expect(screen.getByText('MOTOR RGI')).toBeInTheDocument();
    expect(screen.getByText('DICTAMEN PDF')).toBeInTheDocument();

    const toggleBtn = screen.getByRole('button', { name: /Pausar ciclo animado/i });
    await user.click(toggleBtn);
    expect(screen.getByRole('button', { name: /Reanudar ciclo animado/i })).toBeInTheDocument();
  });
});

describe('LandingShowcaseCarousel', () => {
  it('renders 6 showcase cards and paginates with next/prev controls', async () => {
    const user = userEvent.setup();
    render(<LandingShowcaseCarousel />);

    expect(screen.getByText(/Ficha Merceológica HITL/i)).toBeInTheDocument();
    const nextBtn = screen.getByRole('button', { name: /Siguiente módulo/i });
    await user.click(nextBtn);

    const dots = screen.getAllByRole('tab');
    expect(dots).toHaveLength(6);
    expect(dots[1]).toHaveAttribute('aria-selected', 'true');

    const prevBtn = screen.getByRole('button', { name: /Módulo anterior/i });
    await user.click(prevBtn);
    expect(dots[0]).toHaveAttribute('aria-selected', 'true');
  });
});

describe('LandingWorkflowSection', () => {
  it('renders 01/02/03 workflow panels and items', () => {
    render(<LandingWorkflowSection />);

    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('02')).toBeInTheDocument();
    expect(screen.getByText('03')).toBeInTheDocument();
    expect(screen.getByText(/Describe o adjunta el expediente/i)).toBeInTheDocument();
    expect(screen.getByText(/Valida criterios merceológicos/i)).toBeInTheDocument();
    expect(screen.getByText(/Emite dictamen y guarda en tu catálogo/i)).toBeInTheDocument();
  });
});
