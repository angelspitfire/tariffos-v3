import { describe, expect, it, vi } from 'vitest';

import { rasterizePage, type RenderSurface } from './browser-rasterizer.js';

const pdfBytes = new Uint8Array([1, 2, 3]);

function fakeSurface(): RenderSurface {
  let width = 0;
  let height = 0;
  let rendered = false;
  return {
    get width(): number {
      return width;
    },
    set width(v: number) {
      width = v;
    },
    get height(): number {
      return height;
    },
    set height(v: number) {
      height = v;
    },
    getContext: () => ({}),
    toDataURL: () => 'data:image/png;base64,imagen',
    _capture: () => ({ width, height, rendered }),
  } as unknown as RenderSurface;
}

vi.mock('pdfjs-dist/legacy/build/pdf.mjs', () => ({
  getDocument: vi.fn(() => ({
    promise: Promise.resolve({
      getPage: vi.fn(async (_n: number) => ({
        getViewport: () => ({ width: 600, height: 800 }),
        render: vi.fn(() => ({ promise: Promise.resolve() })),
      })),
    }),
  })),
}));

describe('browser-rasterizer (F2-04) — ejecuta solo en el navegador', () => {
  it('renderiza la página y exporta una imagen PNG', async () => {
    const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const surface = fakeSurface();
    const dataUrl = await rasterizePage(pdfBytes, 1, surface);
    expect(getDocument).toHaveBeenCalledWith({ data: pdfBytes });
    expect(surface.width).toBe(600);
    expect(surface.height).toBe(800);
    expect(dataUrl).toBe('data:image/png;base64,imagen');
  });

  it('lanza si el lienzo no tiene contexto 2D', async () => {
    const surface = {
      width: 0,
      height: 0,
      getContext: () => null,
      toDataURL: () => '',
    } as unknown as RenderSurface;
    await expect(rasterizePage(pdfBytes, 1, surface)).rejects.toThrow(
      /contexto 2D/,
    );
  });
});
