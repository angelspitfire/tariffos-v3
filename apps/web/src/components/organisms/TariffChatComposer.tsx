'use client';

import { useState, useMemo } from 'react';
import { useI18n } from '@/lib/i18n';

export interface TariffChatComposerProps {
  onOpenUploadModal?: () => void;
  isLoading?: boolean;
  sendMessage?: (text: string) => void;
  stop?: () => void;
}

export function TariffChatComposer({
  onOpenUploadModal,
  isLoading,
  sendMessage,
  stop,
}: TariffChatComposerProps) {
  const { t, isEs } = useI18n();
  const [input, setInput] = useState('');

  const quickPrompts = useMemo(() => [
    { label: t('Generar expediente oficial') },
    { label: t('Simulador de acuerdos TLC') },
    { label: t('Ver matriz de vistos buenos') },
    { label: t('Arbitraje de subpartida (Línea 3)') },
    { label: t('Ver manifiesto de carga') },
    { label: t('Liquidación de tributos') },
  ], [t]);

  const handleSend = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    setInput('');
    sendMessage?.(trimmed);
  };

  const isSpanish = isEs;

  return (
    <div className="shrink-0 px-4 pb-4 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
      {/* Quick conversational prompts */}
      <div
        className="flex gap-1.5 overflow-x-auto pb-2.5"
        role="group"
        aria-label={t('Sugerencias rápidas')}
      >
        {quickPrompts.map(({ label }) => (
          <button
            key={label}
            onClick={() => handleSend(label)}
            disabled={isLoading}
            className="text-xs px-3 py-1 rounded-full whitespace-nowrap shrink-0 transition-colors"
            style={{
              background: 'var(--surface-raised)',
              color: 'var(--text-mid)',
              border: '1px solid var(--border)',
              opacity: isLoading ? 0.4 : 1,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Input form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="relative flex items-center"
      >
        <button
          type="button"
          onClick={onOpenUploadModal}
          disabled={isLoading}
          aria-label={t('Adjuntar documento')}
          className="absolute left-2 w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800 transition-colors z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 0l9.18 9.18a4 4 0 0 1 0 5.66l-9.2 9.19a4 4 0 0 1-5.66 0l-9.18-9.18a6 6 0 0 1 0-8.49l9.19-9.19a4 4 0 0 1 5.66 0z" /><line x1="15" y1="5" x2="15" y2="21" /><line x1="9" y1="9" x2="3" y2="15" /></svg>
        </button>

        <label htmlFor="tariff-chat-input" className="sr-only">
          {t('Escribe tu consulta aduanera')}
        </label>
        <input
          id="tariff-chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('Escribe tu consulta o adjunta un documento de despacho...')}
          autoComplete="off"
          className="w-full text-sm rounded-xl pl-10 pr-11 h-11"
          style={{
            background: 'var(--surface-raised)',
            border: '1px solid var(--border-mid)',
            color: 'var(--text-hi)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--brand)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-mid)';
          }}
          disabled={isLoading}
        />
        {isLoading ? (
          <button
            type="button"
            onClick={() => stop?.()}
            aria-label={isSpanish ? 'Detener generación' : 'Stop generation'}
            className="absolute right-1.5 w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-zinc-400 hover:text-red-400 hover:bg-zinc-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            aria-label={t('Enviar consulta')}
            className="absolute right-1.5 w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{
              background: input.trim() && !isLoading ? 'var(--brand)' : 'transparent',
              color: input.trim() && !isLoading ? '#fff' : 'var(--text-lo)',
            }}
          >
            {input.trim() ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13" /><path d="M22 2 15 22l-7-7-7 7" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            )}
          </button>
        )}
      </form>
    </div>
  );
}

export const QUICK_PROMPTS = [
  { label: 'Generar expediente oficial' },
  { label: 'Simulador de acuerdos TLC' },
  { label: 'Ver matriz de vistos buenos' },
  { label: 'Arbitraje de subpartida (Línea 3)' },
  { label: 'Ver manifiesto de carga' },
  { label: 'Liquidación de tributos' },
] as const;

export interface TariffChatComposerProps {
  onOpenUploadModal?: () => void;
  isLoading?: boolean;
  sendMessage?: (text: string) => void;
  stop?: () => void;
}
