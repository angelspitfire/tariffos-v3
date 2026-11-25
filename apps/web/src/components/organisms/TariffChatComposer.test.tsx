// @ts-nocheck
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TariffChatComposer } from './TariffChatComposer';
import { I18nProvider } from '@/lib/i18n';

const renderWithI18n = (ui: React.ReactNode) => render(<I18nProvider defaultLanguage="es">{ui}</I18nProvider>);

describe('TariffChatComposer', () => {
  it('renders quick suggestions row', () => {
    renderWithI18n(
      <TariffChatComposer />
    );
    // Check that suggestions are rendered
    const suggestions = screen.getByRole('group', { name: /Sugerencias rápidas/i });
    expect(suggestions).toBeInTheDocument();
  });

  it('renders input field', () => {
    renderWithI18n(
      <TariffChatComposer />
    );
    const input = screen.getByLabelText(/Escribe tu consulta aduanera/i);
    expect(input).toBeInTheDocument();
  });

  it('renders send button when input has text', () => {
    renderWithI18n(
      <TariffChatComposer />
    );
    // Input with text should enable send button
    const input = screen.getByLabelText(/Escribe tu consulta aduanera/i);
    fireEvent.change(input, { target: { value: 'test query' } });
    const sendButton = screen.getByRole('button', { name: /Enviar consulta/i });
    // Button should be enabled after typing
    expect(sendButton).toBeEnabled();
  });

  it('renders stop button when isLoading', () => {
    renderWithI18n(
      <TariffChatComposer isLoading={true} />
    );
    const stopButton = screen.getByRole('button', { name: /Detener generación/i });
    expect(stopButton).toBeInTheDocument();
  });

  it('renders send button when not loading', () => {
    renderWithI18n(
      <TariffChatComposer isLoading={false} />
    );
    const sendButton = screen.getByRole('button', { name: /Enviar consulta/i });
    expect(sendButton).toBeInTheDocument();
  });

  it('calls onSend when send button is clicked with text', () => {
    const handleSend = vi.fn();
    renderWithI18n(
      <TariffChatComposer
        sendMessage={handleSend}
      />
    );
    const input = screen.getByLabelText(/Escribe tu consulta aduanera/i);
    fireEvent.change(input, { target: { value: 'test message' } });
    fireEvent.click(screen.getByRole('button', { name: /Enviar consulta/i }));
    expect(handleSend).toHaveBeenCalledWith('test message');
  });

  it('does not call onSend when input is empty', () => {
    const handleSend = vi.fn();
    renderWithI18n(
      <TariffChatComposer
        sendMessage={handleSend}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /Enviar consulta/i }));
    expect(handleSend).not.toHaveBeenCalled();
  });

  it('disables send button when input is empty initially', () => {
    renderWithI18n(
      <TariffChatComposer />
    );
    const sendButton = screen.getByRole('button', { name: /Enviar consulta/i });
    expect(sendButton).toBeDisabled();
  });
});
