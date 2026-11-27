'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type SpeechLang = 'es-ES' | 'en-US';

export interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start(): void;
  stop(): void;
}

export const UNSUPPORTED_DICTATION_MESSAGE =
  'El dictado por voz no está disponible en este navegador. Usa Chrome, Edge o Safari para dictar.';

export function createSpeechRecognition(): SpeechRecognitionLike | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  const Ctor = win.SpeechRecognition ?? win.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

export interface UseComposerDictationOptions {
  text: string;
  onSetText: (nextText: string) => void;
  onUnsupportedBrowser?: (message: string) => void;
}

export function useComposerDictation({
  text,
  onSetText,
  onUnsupportedBrowser,
}: UseComposerDictationOptions) {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [dictating, setDictating] = useState(false);
  const [speechLang, setSpeechLang] = useState<SpeechLang>('es-ES');
  const [fallbackWarning, setFallbackWarning] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const toggleDictation = useCallback(() => {
    if (dictating) {
      recognitionRef.current?.stop();
      setDictating(false);
      return;
    }

    const recognition = createSpeechRecognition();
    if (!recognition) {
      if (onUnsupportedBrowser) {
        onUnsupportedBrowser(UNSUPPORTED_DICTATION_MESSAGE);
      } else {
        setFallbackWarning(UNSUPPORTED_DICTATION_MESSAGE);
      }
      return;
    }

    setFallbackWarning(null);
    recognition.lang = speechLang;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? '';
      if (transcript) {
        onSetText(text.trim() ? `${text.trim()} ${transcript}` : transcript);
      }
    };
    recognition.onend = () => setDictating(false);
    recognition.onerror = () => setDictating(false);
    recognitionRef.current = recognition;
    setDictating(true);
    recognition.start();
  }, [dictating, onSetText, onUnsupportedBrowser, speechLang, text]);

  return {
    dictating,
    speechLang,
    setSpeechLang,
    toggleDictation,
    fallbackWarning,
    clearFallbackWarning: () => setFallbackWarning(null),
  };
}
