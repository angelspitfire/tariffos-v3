import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import type { ReactNode } from 'react';

import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-jakarta',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-jetbrains',
});

export const metadata: Metadata = {
  title: 'TariffOS · Clasificación Arancelaria Inteligente',
  description: 'Estación de trabajo aduanero y clasificación arancelaria asistida por IA',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#e6eaf0' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1020' },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${plusJakartaSans.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-surface-app font-sans text-ink-primary antialiased">
        <a
          href="#workspace-main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-field focus:bg-surface-panel focus:px-3 focus:py-2 focus:text-xs focus:font-semibold focus:text-ink-primary focus:shadow-elev-2 focus:ring-2 focus:ring-accent-brand focus:outline-none"
        >
          Saltar al contenido principal
        </a>
        {children}
      </body>
    </html>
  );
}
