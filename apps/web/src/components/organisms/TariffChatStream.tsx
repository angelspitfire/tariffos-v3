'use client';

import { useRef, useEffect } from 'react';
import { useTariffChat } from '@/components/TariffRuntimeProvider';
import { TariffChatComposer } from './TariffChatComposer';

function StreamingIndicator() {
  return (
    <div className="flex items-center gap-2 py-1" aria-label="Generating response">
      <span className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <span
            key={`dot-${i}`}
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: 'var(--brand)',
              animation: `pulse 1.2s ease-in-out ${(i * 2) / 10}s infinite`,
              opacity: 0.6,
            }}
          />
        ))}
      </span>
      <span className="text-xs" style={{ color: 'var(--text-lo)' }}>
        Analizando normativa arancelaria...
      </span>
    </div>
  );
}

export interface TariffChatStreamProps {
  onOpenUploadModal?: () => void;
}

export function TariffChatStream({ onOpenUploadModal }: TariffChatStreamProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const { messages, isRunning, sendMessage } = useTariffChat();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isRunning]);

  return (
    <div className="flex-1 flex flex-col h-full" style={{ background: 'var(--canvas)' }}>
      {/* Message list */}
      <div
        role="log"
        aria-label="Conversación"
        aria-live="polite"
        className="flex-1 overflow-y-auto px-5 py-5 space-y-5"
      >
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className="max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed"
                style={
                  isUser
                    ? {
                        background: 'var(--brand)',
                        color: '#fff',
                        borderBottomRightRadius: '4px',
                      }
                    : {
                        background: 'var(--surface-raised)',
                        color: 'var(--text-hi)',
                        border: '1px solid var(--border)',
                        borderBottomLeftRadius: '4px',
                      }
                }
              >
                {msg.content}
              </div>
              {msg.timestamp && (
                <span
                  className="text-[10px] mt-0.5 px-1"
                  style={{ color: 'var(--text-lo)' }}
                >
                  {msg.timestamp}
                </span>
              )}
            </div>
          );
        })}

        {isRunning && <StreamingIndicator />}
        <div ref={bottomRef} aria-hidden />
      </div>

      <TariffChatComposer
        onOpenUploadModal={onOpenUploadModal}
        isLoading={isRunning}
        sendMessage={(text: string) => void sendMessage(text)}
        stop={() => {
          // Abort handled by TariffRuntimeProvider
        }}
      />
    </div>
  );
}
