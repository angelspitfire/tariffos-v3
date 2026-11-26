import { describe, expect, it } from 'vitest';
import { detectFormatFromPath, parseIngestCliArgs } from '../scripts/ingest_legal';

describe('ingest_legal CLI argument parser', () => {
  it('defaults --country to VE and parses flags accurately', () => {
    const parsed = parseIngestCliArgs([
      '--type',
      'LEGAL_NOTE',
      '--path',
      'loa',
      '--title',
      'Ley Orgánica de Aduanas',
      '--decree',
      'Gaceta Oficial 6.507',
      '--valid-from',
      '2020-01-29',
      '--file',
      './docs/laws/ve/loa.pdf',
      '--dry-run',
      '--publish',
      '--embed',
      '--replace-same-date',
    ]);

    expect(parsed).toMatchObject({
      countryCode: 'VE',
      legalType: 'LEGAL_NOTE',
      hierarchyPath: 'loa',
      title: 'Ley Orgánica de Aduanas',
      decreeNumber: 'Gaceta Oficial 6.507',
      validFromDate: '2020-01-29',
      filePath: './docs/laws/ve/loa.pdf',
      dryRun: true,
      publish: true,
      embed: true,
      replaceSameDate: true,
    });
  });

  it('detects ingestion source formats from file extensions', () => {
    expect(detectFormatFromPath('loa.pdf')).toBe('pdf');
    expect(detectFormatFromPath('cap-85.md')).toBe('markdown');
    expect(detectFormatFromPath('arancel.csv')).toBe('tariff_csv');
    expect(detectFormatFromPath('arancel-2026.rows.json')).toBe('tariff_json');
    expect(detectFormatFromPath('notas.txt')).toBe('txt');
  });
});
