import { beforeAll, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DEFAULT_USER_PROFILE } from '@/lib/workspace/types';
import { AssistantThreadSurface } from './AssistantThreadSurface';

beforeAll(() => {
  if (typeof globalThis.ResizeObserver === 'undefined') {
    globalThis.ResizeObserver = class ResizeObserver {
      observe = vi.fn<() => void>();
      unobserve = vi.fn<() => void>();
      disconnect = vi.fn<() => void>();
    } as unknown as typeof ResizeObserver;
  }
});

const baseInlineActions = {
  onOpenCanvasTab: vi.fn<() => void>(),
  onExportPdf: vi.fn<() => void>(),
  onSaveSku: vi.fn<() => void>(),
  onSubmitSheet: vi.fn<() => void>(),
  onAcceptTentative: vi.fn<() => void>(),
  onSubmitQuestionnaire: vi.fn<() => void>(),
  onSelectDisambiguation: vi.fn<() => void>(),
};

describe('AssistantThreadSurface & WorkspaceComposer tools', () => {
  it('renders mockup-parity welcome cards and quick samples when empty', () => {
    render(
      <AssistantThreadSurface
        messages={[]}
        isRunning={false}
        liveProgress={null}
        skuPrecedents={[]}
        pendingAttachments={[]}
        profile={DEFAULT_USER_PROFILE}
        inlineActions={baseInlineActions}
        onSendMessage={vi.fn<() => Promise<void>>()}
        onCancelRun={vi.fn<() => void>()}
        onAddFiles={vi.fn<() => void>()}
        onRemoveAttachment={vi.fn<() => void>()}
        onRunSample={vi.fn<() => void>()}
        onRunBatchSample={vi.fn<() => void>()}
        onUpdateProfile={vi.fn<() => void>()}
      />,
    );

    expect(screen.getByText(/¿Qué mercancía clasificamos hoy\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Clasificar producto/i)).toBeInTheDocument();
    expect(screen.getByText(/Factura, B\/L o Ficha PDF/i)).toBeInTheDocument();
    expect(screen.getByText(/Probar lote manifiesto/i)).toBeInTheDocument();
  });

  it('opens attach (+) and Herramientas popovers and updates profile settings', async () => {
    const user = userEvent.setup();
    const onUpdateProfile = vi.fn<(patch: Record<string, unknown>) => void>();

    render(
      <AssistantThreadSurface
        messages={[]}
        isRunning={false}
        liveProgress={null}
        skuPrecedents={[]}
        pendingAttachments={[]}
        profile={DEFAULT_USER_PROFILE}
        inlineActions={baseInlineActions}
        onSendMessage={vi.fn<() => Promise<void>>()}
        onCancelRun={vi.fn<() => void>()}
        onAddFiles={vi.fn<() => void>()}
        onRemoveAttachment={vi.fn<() => void>()}
        onRunSample={vi.fn<() => void>()}
        onRunBatchSample={vi.fn<() => void>()}
        onUpdateProfile={onUpdateProfile}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Adjuntar archivo o abrir cámara/i }));
    expect(screen.getByText(/Subir archivos o fotos/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Herramientas/i }));
    expect(screen.getByText(/Opciones de análisis en chat/i)).toBeInTheDocument();
    expect(screen.getByText(/Búsqueda predictiva/i)).toBeInTheDocument();
    expect(screen.getByText(/Profundidad de dictamen/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'FOB' }));
    expect(onUpdateProfile).toHaveBeenCalledWith({ defaultIncoterm: 'FOB' });
  });
});
