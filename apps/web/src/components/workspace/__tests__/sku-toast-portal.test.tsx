import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkspaceToastBanner } from '../atoms/WorkspaceToastBanner';
import { SkuCatalogModal } from '../organisms/SkuCatalogModal';

describe('WorkspaceToastBanner portal & modal interaction', () => {
  it('renders toast in document.body portal above open Radix modal and clicks Undo without dismissing the modal', async () => {
    const user = userEvent.setup();
    const onUndo = vi.fn();
    const onCloseModal = vi.fn();

    const { container } = render(
      <div data-testid="app-shell-root">
        <SkuCatalogModal
          open
          precedents={[]}
          jurisdictionId="ve-seniat"
          onClose={onCloseModal}
          onSave={vi.fn()}
          onDelete={vi.fn()}
          onApplyToChat={vi.fn()}
        />
        <WorkspaceToastBanner
          toast={{
            id: 'undo-1',
            title: 'SKU SKU-E2E-01 eliminado.',
            variant: 'info',
            actionLabel: 'Deshacer',
            onAction: onUndo,
          }}
        />
      </div>,
    );

    const toastEl = screen.getByRole('status');
    expect(toastEl).toHaveAttribute('data-workspace-toast', 'true');
    // Toast must portal outside #app-shell-root directly under document.body so Radix modal lock never blocks it
    expect(container.querySelector('[data-workspace-toast="true"]')).toBeNull();
    expect(document.body.querySelector('[data-workspace-toast="true"]')).toBe(toastEl);

    await user.click(screen.getByRole('button', { name: 'Deshacer' }));
    expect(onUndo).toHaveBeenCalledTimes(1);
    expect(onCloseModal).not.toHaveBeenCalled();
  });
});
