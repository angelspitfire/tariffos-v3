import { describe, expect, it, vi } from 'vitest';
import {
  filterLegalNotesByChapter,
  fuseHybridTariffCandidates,
  retrieveHybridCandidates,
} from './hybrid-retrieval.js';
import type { LegalNoteRecord, TariffCandidateRecord } from './types.js';

const LAPTOP: TariffCandidateRecord = {
  hsCode: '8471.30.90.90',
  description: 'Portable automatic data processing machines <=10kg',
  adValoremRate: 16,
  ivaRate: 16,
  unit: 'u',
  permits: ['CONATEL'],
  score: 0.72,
};

const MONITOR: TariffCandidateRecord = {
  hsCode: '8528.52.00.00',
  description: 'Monitors capable of connecting to an ADP machine',
  adValoremRate: 16,
  ivaRate: 16,
  unit: 'u',
  score: 0.68,
};

const WATCH: TariffCandidateRecord = {
  hsCode: '9102.19.00.00',
  description: 'Wrist-watches electrically operated, other',
  adValoremRate: 20,
  ivaRate: 16,
  unit: 'u',
  score: 0.75,
};

describe('fuseHybridTariffCandidates', () => {
  it('promotes candidates ranked high in both vector and lexical lists via RRF', () => {
    const fused = fuseHybridTariffCandidates([MONITOR, LAPTOP], [LAPTOP, WATCH]);

    expect(fused[0]?.hsCode).toBe('8471.30.90.90');
    expect(fused).toHaveLength(3);
    expect(fused[0]?.score).toBeGreaterThan(fused[1]?.score ?? 0);
  });

  it('deduplicates codes regardless of dot formatting and preserves permits metadata', () => {
    const vectorLaptop: TariffCandidateRecord = {
      ...LAPTOP,
      hsCode: '8471309090',
      permits: undefined,
    };
    const fused = fuseHybridTariffCandidates([vectorLaptop], [LAPTOP]);

    expect(fused).toHaveLength(1);
    expect(fused[0]?.hsCode).toBe('8471.30.90.90');
    expect(fused[0]?.permits).toEqual(['CONATEL']);
    expect(fused[0]?.score).toBe(1);
  });
});

describe('filterLegalNotesByChapter', () => {
  it('keeps matching 2-digit chapters and general/section notes while excluding other chapters', () => {
    const notes: LegalNoteRecord[] = [
      { ref: 'Cap. 84 Nota 5(B)', text: 'ADP machines rule', chapter: '84' },
      { ref: 'Capítulo 85 Nota 1', text: 'Exclusions for electrical machinery' },
      { ref: 'Sección XVI Nota 2', text: 'Parts classification rule' },
      { ref: 'Cap. 91 Nota 2', text: 'Watch cases rule' },
    ];

    const filtered = filterLegalNotesByChapter(notes, ['8471.30.90.90']);
    expect(filtered.map((n) => n.ref)).toEqual(['Cap. 84 Nota 5(B)', 'Sección XVI Nota 2']);
  });
});

describe('retrieveHybridCandidates', () => {
  it('merges vector and lexical ports and falls back cleanly when vector port fails', async () => {
    const merged = await retrieveHybridCandidates(
      {
        searchTariffCandidates: vi.fn().mockResolvedValue([LAPTOP, WATCH]),
        searchVectorCandidates: vi.fn().mockResolvedValue([LAPTOP, MONITOR]),
      },
      'VE',
      'MacBook Pro 14',
    );
    expect(merged[0]?.hsCode).toBe('8471.30.90.90');
    expect(merged).toHaveLength(3);

    const fallback = await retrieveHybridCandidates(
      {
        searchTariffCandidates: vi.fn().mockResolvedValue([LAPTOP]),
        searchVectorCandidates: vi.fn().mockRejectedValue(new Error('pgvector timeout')),
      },
      'VE',
      'MacBook Pro 14',
    );
    expect(fallback).toEqual([LAPTOP]);
  });
});
