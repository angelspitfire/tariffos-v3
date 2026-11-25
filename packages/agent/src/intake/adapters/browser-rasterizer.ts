/**
 * Rasterizador de PDF en el navegador (F2-04).
 *
 * Este módulo se ejecuta SOLO en el navegador. Las funciones de Deno nunca
 * reciben PDFs escaneados: solo reciben imágenes de página ya rasterizadas.
 * Renderiza una página de PDF a un lienzo y la exporta como imagen.
 */

import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

export interface RenderSurface {
  width: number;
  height: number;
  getContext(contextId: string): RenderContext | null;
  toDataURL(mimeType?: string): string;
}

export interface RenderContext {
  [key: string]: unknown;
}

/** Escala de renderizado: 2× para legibilidad en el modelo de visión. */
const RENDER_SCALE = 2;

export async function rasterizePage(
  pdfBytes: Uint8Array,
  pageNumber: number,
  surface: RenderSurface,
): Promise<string> {
  const pdf = await getDocument({ data: pdfBytes }).promise;
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale: RENDER_SCALE });

  surface.width = viewport.width;
  surface.height = viewport.height;

  const context = surface.getContext('2d');
  if (!context) {
    throw new Error('no se pudo obtener el contexto 2D del lienzo');
  }

  await (page.render as unknown as (
    params: { canvasContext: RenderContext; viewport: typeof viewport },
  ) => { promise: Promise<void> })({
    canvasContext: context,
    viewport,
  });

  return surface.toDataURL('image/png');
}
