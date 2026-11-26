import { describe, expect, it } from 'vitest';
import { chunkLegalDocument, extractHsScopeCodes } from '../ingestion/legal-chunker';

describe('legal-chunker', () => {
  it('extracts both 2-by-2 and 4+2 Venezuelan HS notations while ignoring bare years and gazettes', () => {
    const text =
      'Publicado en Gaceta Oficial 6.804 de fecha 25/04/2024. ' +
      'Las mercancías de las partidas 84.71 y 21.06.90, así como la subpartida 1602.10 ' +
      'y el código 8517.62.91.00, se rigen por el artículo 2024.';

    const codes = extractHsScopeCodes(text);
    expect(codes).toEqual(['84.71', '21.06.90', '1602.10', '8517.62.91.00']);
  });

  it('chunks numbered chapter notes keeping lettered sub-items attached to the same rule', () => {
    const content = [
      '1. Este Capítulo no comprende:',
      'a) los productos de la partida 02.01;',
      'b) las preparaciones de la subpartida 1602.10;',
      '2. En la subpartida 8517.62, se entienden comprendidos los enrutadores.',
    ].join('\n');

    const chunks = chunkLegalDocument({
      title: 'CAPÍTULO 85 — MÁQUINAS Y APARATOS ELÉCTRICOS',
      content,
      format: 'txt',
    });

    expect(chunks).toHaveLength(2);
    expect(chunks[0]).toMatchObject({
      heading: 'CAPÍTULO 85 — MÁQUINAS Y APARATOS ELÉCTRICOS',
      ruleNumber: '1',
      chunkIndex: 0,
      scope: ['02.01', '1602.10'],
    });
    expect(chunks[0]?.content).toContain('a) los productos');
    expect(chunks[0]?.content).toContain('b) las preparaciones');
    expect(chunks[1]).toMatchObject({
      ruleNumber: '2',
      chunkIndex: 1,
      scope: ['8517.62'],
    });
  });

  it('chunks Venezuelan LOA articles and Markdown sections deterministically', () => {
    const markdown = [
      '# Título I Disposiciones Generales',
      'Artículo 1°.- El territorio aduanero comprende la jurisdicción nacional.',
      'Parágrafo Único: Incluye zonas francas.',
      '## Título II Tráfico de Mercancías',
      'Art. 25.- Toda mercancía de la partida 87.03 requiere declaración.',
    ].join('\n');

    const chunks = chunkLegalDocument({
      title: 'Ley Orgánica de Aduanas',
      content: markdown,
      format: 'markdown',
    });

    expect(chunks.length).toBeGreaterThanOrEqual(2);
    expect(chunks[0]?.heading).toContain('Título I');
    expect(chunks[0]?.ruleNumber).toBe('1');
    expect(chunks[0]?.content).toContain('Parágrafo Único');
    const art25 = chunks.find((c) => c.ruleNumber === '25');
    expect(art25).toBeDefined();
    expect(art25?.heading).toContain('Título II');
    expect(art25?.scope).toEqual(['87.03']);
  });
});
