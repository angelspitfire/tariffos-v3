'use client';

import { useCallback } from 'react';
import { Globe, Sun, Moon } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';

export function LanguageToggle(): React.ReactElement {
  const { language, setLanguage, isEs, isEn } = useI18n();

  const handleToggle = useCallback(() => {
    setLanguage(isEs ? 'en' : 'es');
  }, [isEs, setLanguage]);

  const isSpanish = language === 'es';

  return (
    <Button
      size="icon"
      variant="outline"
      onClick={handleToggle}
      aria-label={isSpanish ? 'Cambiar a inglés' : 'Switch to English'}
      title={isSpanish ? 'Cambiar a inglés' : 'Switch to English'}
      aria-pressed={isEn}
    >
      <Globe size={14} aria-hidden="true" />
      <span className="sr-only">{isSpanish ? 'Español' : 'English'}</span>
      {isSpanish ? <Sun size={12} aria-hidden="true" /> : <Moon size={12} aria-hidden="true" />}
    </Button>
  );
}
