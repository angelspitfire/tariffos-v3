'use client';

import { Mic } from 'lucide-react';
import type { SpeechLang } from '@/lib/workspace/use-composer-dictation';

export {
  createSpeechRecognition,
  type SpeechRecognitionLike,
} from '@/lib/workspace/use-composer-dictation';

export interface ComposerDictationBarProps {
  speechLang: SpeechLang;
  onChangeSpeechLang: (lang: SpeechLang) => void;
}

export function ComposerDictationBar({
  speechLang,
  onChangeSpeechLang,
}: ComposerDictationBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border-hairline bg-surface-muted/60 px-3.5 py-2 text-xs">
      <div
        role="status"
        aria-live="polite"
        className="flex items-center gap-2 text-red-700 dark:text-red-400"
      >
        <Mic className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span className="font-medium">Grabando dictado</span>
      </div>
      <div className="flex items-center gap-1.5">
        {(['es-ES', 'en-US'] as const).map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => onChangeSpeechLang(lang)}
            aria-pressed={speechLang === lang}
            className={`cursor-pointer rounded px-2 py-0.5 font-mono text-[11px] transition-colors focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none ${
              speechLang === lang
                ? 'bg-surface-panel font-semibold text-ink-primary shadow-xs'
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
