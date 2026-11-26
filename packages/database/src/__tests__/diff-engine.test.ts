import { describe, expect, it } from 'vitest';
import { computeLegalChunksDiff, computeTariffRowsDiff } from '../ingestion/diff-engine';

describe('diff-engine', () => {
  it('detects added, modified, removed legal chunks and affected HS scope codes', () => {
    const existing = [
      { heading: 'LOA', ruleNumber: '1', content: 'Texto vigente 1.', scope: ['84.71'] },
      { heading: 'LOA', ruleNumber: '2', content: 'Texto antiguo 2.', scope: ['85.04'] },
      { heading: 'LOA', ruleNumber: '3', content: 'Texto derogado 3.', scope: ['87.03'] },
    ];
    const incoming = [
      { heading: 'LOA', ruleNumber: '1', content: 'Texto vigente 1.', scope: ['84.71'] },
      { heading: 'LOA', ruleNumber: '2', content: 'Texto reformado 2.', scope: ['85.04', '8504.40'] },
      { heading: 'LOA', ruleNumber: '4', content: 'Nuevo artículo 4.', scope: ['3920.10'] },
    ];

    const diff = computeLegalChunksDiff(incoming, existing);
    expect(diff.addedChunks).toBe(1);
    expect(diff.modifiedChunks).toBe(1);
    expect(diff.removedChunks).toBe(1);
    expect(diff.affectedHsCodes).toEqual(['3920.10', '85.04', '8504.40', '87.03']);
    expect(diff.sampleChanges).toHaveLength(3);
  });

  it('detects added, modified, and removed tariff schedule rows', () => {
    const existing = [
      { hsCode: '8504409000', description: 'Convertidores', adValorem: 10, iva: 16, isBK: false, isBIT: false, legalNotes: null },
      { hsCode: '8471309090', description: 'Portátiles', adValorem: 0, iva: 16, isBK: false, isBIT: true, legalNotes: null },
    ];
    const incoming = [
      { hsCode: '8504409000', description: 'Convertidores', adValorem: 14, iva: 16, isBK: true, isBIT: false, legalNotes: 'RL 20' },
      { hsCode: '8517629100', description: 'Routers', adValorem: 0, iva: 16, isBK: false, isBIT: true, legalNotes: null },
    ];

    const diff = computeTariffRowsDiff(incoming, existing);
    expect(diff.addedCount).toBe(1);
    expect(diff.modifiedCount).toBe(1);
    expect(diff.removedCount).toBe(1);
    expect(diff.affectedHsCodes).toEqual(['8471309090', '8504409000', '8517629100']);
    const mod = diff.changes.find((c) => c.hsCode === '8504409000');
    expect(mod?.changeType).toBe('modified');
    expect(mod?.fieldsChanged).toEqual(['adValorem', 'isBK', 'legalNotes']);
    expect(mod?.beforeAdValorem).toBe(10);
    expect(mod?.afterAdValorem).toBe(14);
  });
});
