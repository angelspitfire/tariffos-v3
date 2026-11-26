'use client';

import { Mic } from 'lucide-react';

export interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start(): void;
  stop(): void;
}

export function createSpeechRecognition(): SpeechRecognitionLike | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  const Ctor = win.SpeechRecognition ?? win.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

export interface ComposerDictationBarProps {
  speechLang: 'es-ES' | 'en-US';
  onChangeSpeechLang: (lang: 'es-ES' | 'en-US') => void;
}

export function ComposerDictationBar({
  speechLang,
  onChangeSpeechLang,
}: ComposerDictationBarProps) {
  return (
    <div className="px-3.5 py-2 border-t border-border-hairline bg-surface-muted/60 flex flex-wrap items-center justify-between gap-2 text-xs">
      <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
        <Mic className="w-3.5 h-3.5 shrink-0" />
        <span className="font-medium">Grabando dictado</span>
      </div>
      <div className="flex items-center gap-1.5">
        {(['es-ES', 'en-US'] as const).map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => onChangeSpeechLang(lang)}
            aria-pressed={speechLang === lang}
            className={`px-2 py-0.5 text-[11px] font-mono rounded cursor-pointer ${
              speechLang === lang
                ? 'bg-surface-panel text-ink-primary font-semibold shadow-xs'
                : 'text-ink-muted hover:text-ink-primary'
            }`}
          >
            {lang === 'es-ES' ? 'ES' : 'EN'}
          </button>
        ))}
      </div>
    </div>
  );
}
