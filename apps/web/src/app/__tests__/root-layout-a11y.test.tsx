import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/font/google', () => ({
  Plus_Jakarta_Sans: vi.fn(() => ({ variable: 'font-jakarta-var' })),
  JetBrains_Mono: vi.fn(() => ({ variable: 'font-jetbrains-var' })),
}));

import RootLayout, * as layoutModule from '../layout';

describe('RootLayout & design tokens (Plan 1.1)', () => {
  it('exports viewport.themeColor for both light and dark schemes', () => {
    const viewport = (layoutModule as { viewport?: { themeColor?: Array<{ media: string; color: string }> } }).viewport;
    expect(viewport?.themeColor).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ media: '(prefers-color-scheme: light)', color: '#e6eaf0' }),
        expect.objectContaining({ media: '(prefers-color-scheme: dark)', color: '#0b1020' }),
      ]),
    );
  });

  it('injects Google font CSS variables, renders skip link to #workspace-main, and removes selection:bg-blue-100', () => {
    const html = renderToStaticMarkup(
      <RootLayout>
        <div id="workspace-main">Contenido</div>
      </RootLayout>,
    );
    expect(html).toContain('font-jakarta-var');
    expect(html).toContain('font-jetbrains-var');
    expect(html).toContain('href="#workspace-main"');
    expect(html).toContain('Saltar al contenido principal');
    expect(html).not.toContain('selection:bg-blue-100');
  });

  it('keeps a single canonical --radius-card scale in globals.css and removes duplicate in tokens.css', () => {
    const tokensCss = readFileSync(resolve(__dirname, '../tokens.css'), 'utf8');
    const globalsCss = readFileSync(resolve(__dirname, '../globals.css'), 'utf8');
    expect(tokensCss).not.toMatch(/--radius-card\s*:/);
    expect(globalsCss).toMatch(/--radius-card:\s*14px/);
    expect(globalsCss).toContain('var(--font-jakarta)');
    expect(globalsCss).toContain('var(--font-jetbrains)');
  });
});
