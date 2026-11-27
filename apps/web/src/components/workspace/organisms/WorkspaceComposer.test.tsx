import { beforeAll, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AssistantRuntimeProvider, useExternalStoreRuntime, type ThreadMessageLike } from '@assistant-ui/react';
import { DEFAULT_USER_PROFILE } from '@/lib/workspace/types';
import { AssistantThreadSurface } from './AssistantThreadSurface';
import { WorkspaceComposer } from './WorkspaceComposer';

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
    expect(screen.getByRole('menuitemcheckbox', { name: /Búsqueda predictiva/i })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByText(/Profundidad de dictamen/i)).toBeInTheDocument();

    const fobRadio = screen.getByRole('menuitemradio', { name: 'FOB' });
    await user.click(fobRadio);
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

  it('shows extracting state on pending attachments and allows 1-click send with ready attachments and empty text', async () => {
    const user = userEvent.setup();
    const onSendMessage = vi.fn<() => Promise<void>>();

    const { rerender } = render(
      <AssistantThreadSurface
        messages={[]}
        isRunning={false}
        liveProgress={null}
        skuPrecedents={[]}
        pendingAttachments={[
          {
            id: 'att-ext',
            name: 'factura-proforma.pdf',
            mimeType: 'application/pdf',
            sizeBytes: 1200,
            status: 'extracting',
          },
        ]}
        profile={DEFAULT_USER_PROFILE}
        inlineActions={baseInlineActions}
        onSendMessage={onSendMessage}
        onCancelRun={vi.fn<() => void>()}
        onAddFiles={vi.fn<() => void>()}
        onRemoveAttachment={vi.fn<() => void>()}
        onRunSample={vi.fn<() => void>()}
        onRunBatchSample={vi.fn<() => void>()}
        onUpdateProfile={vi.fn<() => void>()}
      />,
    );

    expect(screen.getByText(/Extrayendo…/i)).toBeInTheDocument();
    const waitBtn = screen.getByRole('button', { name: /Procesando archivo/i });
    expect(waitBtn).toBeDisabled();

    rerender(
      <AssistantThreadSurface
        messages={[]}
        isRunning={false}
        liveProgress={null}
        skuPrecedents={[]}
        pendingAttachments={[
          {
            id: 'att-ext',
            name: 'factura-proforma.pdf',
            mimeType: 'application/pdf',
            sizeBytes: 1200,
            status: 'ready',
            extractedText: 'Compresor BAOSI 75kW',
          },
        ]}
        profile={DEFAULT_USER_PROFILE}
        inlineActions={baseInlineActions}
        onSendMessage={onSendMessage}
        onCancelRun={vi.fn<() => void>()}
        onAddFiles={vi.fn<() => void>()}
        onRemoveAttachment={vi.fn<() => void>()}
        onRunSample={vi.fn<() => void>()}
        onRunBatchSample={vi.fn<() => void>()}
        onUpdateProfile={vi.fn<() => void>()}
      />,
    );

    const sendBtn = screen.getByRole('button', { name: /Enviar/i });
    expect(sendBtn).not.toBeDisabled();
    await user.click(sendBtn);
    expect(onSendMessage).toHaveBeenCalledWith(
      expect.stringMatching(/Analiza el documento adjunto/i),
    );
  });

  it('supports ArrowDown/ArrowUp/Enter/Escape keyboard selection in PredictiveSkuList from textarea', async () => {
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
          {
            id: 'sku-2',
            sku: 'INV-10K',
            normalizedSku: 'INV-10K',
            title: 'Inversor solar trifásico 10 kW',
            description: 'Inversor solar trifásico 10 kW',
            hsCode: '8504.40.90.00',
            jurisdictionId: 've-seniat',
            adValoremPercent: 10,
            vatPercent: 16,
            legalRegime: 'Libre',
            reviewStatus: 'approved',
            usageCount: 2,
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

    const textarea = screen.getByLabelText<HTMLTextAreaElement>(
      /Consulta arancelaria o descripción de mercancía/i,
    );
    await user.type(textarea, 'INV');
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(2);

    await user.keyboard('{ArrowDown}');
    expect(options[0]).toHaveAttribute('aria-selected', 'true');

    await user.keyboard('{ArrowDown}');
    expect(options[1]).toHaveAttribute('aria-selected', 'true');

    await user.keyboard('{ArrowUp}');
    expect(options[0]).toHaveAttribute('aria-selected', 'true');

    await user.keyboard('{Enter}');
    expect(textarea.value).toBe('INV-5K: Inversor solar híbrido 5 kW (8504.40.90.00)');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    await user.clear(textarea);
    await user.type(textarea, 'INV');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('notifies user via onNotifyWarning (or fallback status) when SpeechRecognition is unavailable', async () => {
    const user = userEvent.setup();
    const onNotifyWarning = vi.fn<(msg: string) => void>();

    function ComposerHarness({ warn }: { warn?: (msg: string) => void }) {
      const runtime = useExternalStoreRuntime({
        isRunning: false,
        messages: [] as ThreadMessageLike[],
        convertMessage: (m: ThreadMessageLike) => m,
        onNew: async () => undefined,
      });
      return (
        <AssistantRuntimeProvider runtime={runtime}>
          <WorkspaceComposer
            skuPrecedents={[]}
            pendingAttachments={[]}
            profile={DEFAULT_USER_PROFILE}
            onAddFiles={vi.fn()}
            onRemoveAttachment={vi.fn()}
            onUpdateProfile={vi.fn()}
            onTriggerUpload={vi.fn()}
            onNotifyWarning={warn}
          />
        </AssistantRuntimeProvider>
      );
    }

    const { rerender } = render(<ComposerHarness warn={onNotifyWarning} />);
    await user.click(screen.getByRole('button', { name: /Dictar/i }));
    expect(onNotifyWarning).toHaveBeenCalledWith(expect.stringMatching(/navegador|Chrome|Edge|voz/i));

    rerender(<ComposerHarness />);
    await user.click(screen.getByRole('button', { name: /Dictar/i }));
    expect(screen.getByRole('status')).toHaveTextContent(/navegador|Chrome|Edge|voz/i);
  });

  it('renders OS-aware paste shortcut hint with non-breaking space in empty state and attach menu', async () => {
    const user = userEvent.setup();
    const originalPlatform = navigator.platform;
    Object.defineProperty(navigator, 'platform', {
      value: 'MacIntel',
      configurable: true,
    });
    try {
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

      const emptyHint = screen.getByText('⌘ V');
      expect(emptyHint.textContent).toBe('⌘\u00A0V');
      await user.click(screen.getByRole('button', { name: /Adjuntar archivo o abrir cámara/i }));
      const allHints = screen.getAllByText('⌘ V');
      expect(allHints).toHaveLength(2);
      expect(allHints[1]?.textContent).toBe('⌘\u00A0V');
    } finally {
      Object.defineProperty(navigator, 'platform', {
        value: originalPlatform,
        configurable: true,
      });
    }
  });
});
