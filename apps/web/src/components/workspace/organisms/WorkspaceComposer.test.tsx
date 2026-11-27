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

  it('re-enables predictive SKU suggestions after dismissal when composer text changes and opens camera modal', async () => {
    const user = userEvent.setup();
    render(
      <AssistantThreadSurface
        messages={[]}
        isRunning={false}
        liveProgress={null}
        skuPrecedents={[
          {
            id: 'sku-1',
            sku: 'INV-5K',
            normalizedSku: 'INV-5K',
            title: 'Inversor solar híbrido 5 kW',
            description: 'Inversor solar híbrido 5 kW',
            hsCode: '8504.40.90.00',
            jurisdictionId: 've-seniat',
            adValoremPercent: 10,
            vatPercent: 16,
            legalRegime: 'Libre',
            reviewStatus: 'approved',
            usageCount: 1,
            createdAt: '2026-11-26T00:00:00.000Z',
            updatedAt: '2026-11-26T00:00:00.000Z',
          },
        ]}
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

    const textarea = screen.getByLabelText(/Consulta arancelaria o descripción de mercancía/i);
    await user.type(textarea, 'INV');
    expect(screen.getByText('INV-5K')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Cerrar sugerencias predictivas/i }));
    expect(screen.queryByText('INV-5K')).not.toBeInTheDocument();

    await user.type(textarea, '-5');
    expect(screen.getByText('INV-5K')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Adjuntar archivo o abrir cámara/i }));
    await user.click(screen.getByRole('menuitem', { name: /Cámara integrada/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
