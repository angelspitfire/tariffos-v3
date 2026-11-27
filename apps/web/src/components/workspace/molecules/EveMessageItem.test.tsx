// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AssistantRuntimeProvider, ThreadPrimitive, useExternalStoreRuntime } from '@assistant-ui/react';
import type { ThreadMessageLike } from '@assistant-ui/react';
import { buildWorkspaceInlineActions } from '@/lib/workspace/inline-actions';
import { EveMessageItem } from './EveMessageItem';

function RenderSingleMessage({ message }: { message: ThreadMessageLike }) {
  const inlineActions = buildWorkspaceInlineActions({
    onSelectCanvasMessage: vi.fn(),
    onExportPdf: vi.fn(),
    onSaveSku: vi.fn(),
    onClassify: vi.fn(),
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
});
