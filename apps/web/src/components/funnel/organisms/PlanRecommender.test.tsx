import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SAAS_PLANS } from '@tariffos/shared-types';
import { PlanRecommender } from './PlanRecommender';

describe('PlanRecommender', () => {
  it('recommends Agencia when batch processing is toggled on and triggers CTA callback', async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();

    render(
      <PlanRecommender
        plans={SAAS_PLANS}
        defaultOpen
        onApplyRecommendation={onApply}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Carga por lotes/i }));
    expect(screen.getByRole('heading', { name: /Plan Agencia/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Aplicar plan Agencia/i }));
    expect(onApply).toHaveBeenCalledWith(
      expect.objectContaining({
        planId: 'agencia',
      }),
    );
  });

  it('recommends Enterprise (A medida, no fixed price) for massive volume and 10+ team size', async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();

    render(
      <PlanRecommender
        plans={SAAS_PLANS}
        defaultOpen
        onApplyRecommendation={onApply}
      />,
    );

    await user.click(screen.getByRole('button', { name: '1,000+' }));
    await user.click(screen.getByRole('button', { name: '10+ usuarios' }));

    expect(screen.getByRole('heading', { name: /Plan Enterprise/i })).toBeInTheDocument();
    expect(screen.getByText('A medida')).toBeInTheDocument();
    const enterpriseLink = screen.getByRole('link', { name: /Solicitar cotización Enterprise/i });
    expect(enterpriseLink).toHaveAttribute('href', '/#contacto');
  });
});
