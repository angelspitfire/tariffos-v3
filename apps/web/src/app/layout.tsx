import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google';

import './globals.css';
import { I18nProvider } from '@/lib/i18n';
import { WorkstationErrorBoundary } from '@/components/WorkstationErrorBoundary';

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jakarta',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains',
});

export const metadata: Metadata = {
  title: 'TariffOS · Clasificación Arancelaria Inteligente',
  description: 'Estación de trabajo aduanero y clasificación arancelaria asistida por IA',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${jakartaSans.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-surface-app text-ink-primary antialiased selection:bg-blue-100 selection:text-blue-900 dark:selection:bg-blue-900/60 dark:selection:text-blue-100">
        <I18nProvider defaultLanguage="es">
          <WorkstationErrorBoundary>{children}</WorkstationErrorBoundary>
        </I18nProvider>
      </body>
    </html>
  );
}
