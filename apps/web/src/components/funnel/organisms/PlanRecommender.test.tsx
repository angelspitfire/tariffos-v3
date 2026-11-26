import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SAAS_PLANS } from '@tariffos/shared-types';
import { PlanRecommender } from './PlanRecommender';

describe('PlanRecommender', () => {
  it('recommends Pro when batch processing is toggled on and triggers CTA callback', async () => {
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
    expect(screen.getByRole('heading', { name: /Plan Pro/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Aplicar plan Pro/i }));
    expect(onApply).toHaveBeenCalledWith(
      expect.objectContaining({
        planId: 'pro',
      }),
    );
  });

  it('recommends Corporate (Anual) for massive volume and 10+ team size', async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();

    render(
      <PlanRecommender
        plans={SAAS_PLANS}
        defaultOpen
        onApplyRecommendation={onApply}
      />,
    );

    await user.click(screen.getByRole('button', { name: '1,500+' }));
    await user.click(screen.getByRole('button', { name: '10+ usuarios' }));

    expect(screen.getByRole('heading', { name: /Plan Corporate/i })).toBeInTheDocument();
    expect(screen.getByText('$5,900/año')).toBeInTheDocument();
  });
});
