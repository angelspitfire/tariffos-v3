import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TariffChatStream } from './TariffChatStream';
import type { ChatMessage, A2UIArtifact } from '@/types/domain';
import { I18nProvider } from '@/lib/i18n';

// Mock useTariffChat
vi.mock('@/components/TariffRuntimeProvider', () => ({
  useTariffChat: vi.fn(),
}));

import { useTariffChat } from '@/components/TariffRuntimeProvider';

const mockUseTariffChat = vi.mocked(useTariffChat);

const userMessage: ChatMessage = {
  id: 'msg-user-1',
  role: 'user',
  content: '¿Cuál es el arancel para laptops importadas?',
  timestamp: '10:00',
};

const assistantMessage: ChatMessage = {
  id: 'msg-assistant-1',
  role: 'assistant',
  content: 'El arancel para laptops es del 0%.',
  timestamp: '10:01',
};

function mockCtx(overrides: Partial<ReturnType<typeof useTariffChat>> = {}) {
  mockUseTariffChat.mockReturnValue({
    messages: [],
    isRunning: false,
    artifacts: [],
    activeArtifact: null,
    openTabIds: [],
    isCanvasOpen: false,
    isDrawerOpen: false,
    activeFilingId: 'TR-2024-8849-VE',
    activeFiling: {
      id: 'TR-2024-8849-VE',
      code: 'TR-2024-8849-VE',
      title: 'Electrónica · Shanghai → La Guaira',
      route: 'Shanghai → La Guaira',
      channel: 'red',
      reasons: [],
      documents: [],
      manifestArtifact: {} as A2UIArtifact,
    },
    conversationFiles: [],
    addConversationFile: vi.fn(),
    auditEntries: [],
    addAuditEntry: vi.fn(),
    setIsCanvasOpen: vi.fn(),
    setIsDrawerOpen: vi.fn(),
    activateArtifact: vi.fn(),
    closeTab: vi.fn(),
    pushCustomArtifact: vi.fn(),
    updateManifestItem: vi.fn(),
    switchFiling: vi.fn(),
    sendMessage: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  });
}

beforeEach(() => {
  if (typeof HTMLElement.prototype.scrollIntoView !== 'function') {
    HTMLElement.prototype.scrollIntoView = vi.fn();
  }
  vi.spyOn(HTMLElement.prototype, 'scrollIntoView').mockImplementation(() => {});
  mockCtx();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('TariffChatStream', () => {
  it('renders user and assistant messages', () => {
    mockCtx({ messages: [userMessage, assistantMessage] });
    render(
      <I18nProvider>
        <TariffChatStream />
      </I18nProvider>
    );
    expect(
      screen.getByText('¿Cuál es el arancel para laptops importadas?'),
    ).toBeInTheDocument();
    expect(screen.getByText('El arancel para laptops es del 0%.')).toBeInTheDocument();
  });

  it('shows streaming indicator when isRunning is true', () => {
    mockCtx({ isRunning: true });
    render(
      <I18nProvider>
        <TariffChatStream />
      </I18nProvider>
    );
    expect(screen.getByLabelText('Generating response')).toBeInTheDocument();
    expect(screen.getByText('Analizando normativa arancelaria...')).toBeInTheDocument();
  });

  it('does not show streaming indicator when isRunning is false', () => {
    mockCtx({ isRunning: false });
    render(
      <I18nProvider>
        <TariffChatStream />
      </I18nProvider>
    );
    expect(screen.queryByLabelText('Generating response')).not.toBeInTheDocument();
  });

  it('calls onOpenUploadModal when attachment button is clicked', () => {
    const onOpenUploadModal = vi.fn();
    render(
      <I18nProvider>
        <TariffChatStream onOpenUploadModal={onOpenUploadModal} />
      </I18nProvider>
    );
    const attachButton = screen.getByLabelText('Adjuntar documento');
    fireEvent.click(attachButton);
    expect(onOpenUploadModal).toHaveBeenCalledTimes(1);
  });

  it('shows timestamps beneath messages', () => {
    mockCtx({ messages: [userMessage] });
    render(
      <I18nProvider>
        <TariffChatStream />
      </I18nProvider>
    );
    expect(screen.getByText('10:00')).toBeInTheDocument();
  });
});
