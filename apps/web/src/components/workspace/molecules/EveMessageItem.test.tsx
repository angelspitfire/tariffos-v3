// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { AssistantRuntimeProvider, ThreadPrimitive, useExternalStoreRuntime } from '@assistant-ui/react';
import type { ThreadMessageLike } from '@assistant-ui/react';
import { buildWorkspaceInlineActions } from '@/lib/workspace/inline-actions';
import { EveMessageItem } from './EveMessageItem';

function RenderSingleMessage({
  message,
  onClassify = vi.fn(),
}: {
  message: ThreadMessageLike;
  onClassify?: (prompt: string) => void;
}) {
  const inlineActions = buildWorkspaceInlineActions({
    onSelectCanvasMessage: vi.fn(),
    onExportPdf: vi.fn(),
    onSaveSku: vi.fn(),
    onClassify,
  });
  const runtime = useExternalStoreRuntime({
    isRunning: false,
    messages: [message],
    convertMessage: (m: ThreadMessageLike) => m,
    onNew: async () => undefined,
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ThreadPrimitive.Root>
        <ThreadPrimitive.Messages>
          {({ message: item }) => (
            <EveMessageItem
              message={item}
              jurisdictionId="ve-seniat"
              approvalWorkflowMode="agent_decides"
              inlineActions={inlineActions}
            />
          )}
        </ThreadPrimitive.Messages>
      </ThreadPrimitive.Root>
    </AssistantRuntimeProvider>
  );
}

describe('EveMessageItem status handling', () => {
  it('shows analyzing loader only while assistant message is actively running', () => {
    render(
      <RenderSingleMessage
        message={{
          id: 'm-run',
          role: 'assistant',
          createdAt: new Date('2026-11-26T12:00:00.000Z'),
          content: [],
          status: { type: 'running' },
        }}
      />,
    );

    expect(screen.getByText('Analizando consulta…')).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('renders an inline error alert instead of spinning when turn settles with incomplete error', () => {
    render(
      <RenderSingleMessage
        message={{
          id: 'm-err',
          role: 'assistant',
          createdAt: new Date('2026-11-26T12:00:00.000Z'),
          content: [],
          status: { type: 'incomplete', reason: 'error', error: 'Insufficient credits' },
        }}
      />,
    );

    expect(screen.queryByText('Analizando consulta…')).toBeNull();
    const alert = screen.getByRole('alert');
    expect(alert.textContent).toMatch(/Créditos insuficientes/i);
  });

  it('hides raw extracted [Adjunto: ...] body text in user bubbles and shows clean filename chips', () => {
    render(
      <RenderSingleMessage
        message={{
          id: 'u-att-1',
          role: 'user',
          createdAt: new Date('2026-11-26T12:00:00.000Z'),
          content: [
            {
              type: 'text',
              text: 'DAME LAS CARACTERISTICAS\n\n[Adjunto: PI_RTF100.pdf]\nLINEA SECRETA DEL PDF QUE NO DEBE VERSE EN EL CHAT',
            },
            {
              type: 'file',
              data: 'AQID',
              mimeType: 'image/png',
              filename: 'placa.png',
            },
          ],
        }}
      />,
    );

    expect(screen.getByText('DAME LAS CARACTERISTICAS')).toBeTruthy();
    expect(screen.getByText('PI_RTF100.pdf')).toBeTruthy();
    expect(screen.getByText('placa.png')).toBeTruthy();
    expect(screen.queryByText(/LINEA SECRETA DEL PDF/i)).toBeNull();
  });

  it('renders 1-click contextual follow-up chips on settled assistant document summaries and dispatches prompt on click', () => {
    const onClassify = vi.fn();
    render(
      <RenderSingleMessage
        onClassify={onClassify}
        message={{
          id: 'a-doc-1',
          role: 'assistant',
          createdAt: new Date('2026-11-26T12:00:00.000Z'),
          content: [
            {
              type: 'text',
              text: 'Compresor de aire de tornillo RTF-100, motor 75 kW, presión 8 bar, acompañado por secador refrigerativo y tanque de 2.000 L según factura proforma.',
            },
          ],
          status: { type: 'complete', reason: 'stop' },
        }}
      />,
    );

    const chip = screen.getByRole('button', { name: /Clasificar equipo principal/i });
    fireEvent.click(chip);
    expect(onClassify).toHaveBeenCalledWith(expect.stringMatching(/Clasifica el equipo principal/i));
  });
});
