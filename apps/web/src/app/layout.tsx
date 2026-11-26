import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import './globals.css';

export const metadata: Metadata = {
  title: 'TariffOS · Clasificación Arancelaria Inteligente',
  description: 'Estación de trabajo aduanero y clasificación arancelaria asistida por IA',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-surface-app font-sans text-ink-primary antialiased selection:bg-blue-100 selection:text-blue-900 dark:selection:bg-blue-900/60 dark:selection:text-blue-100">
        {children}
      </body>
    </html>
  );
}
