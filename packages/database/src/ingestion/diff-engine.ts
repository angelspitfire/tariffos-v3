import type { LegalChunkDiffItem, TariffRowChange } from '@tariffos/shared-types';

const MAX_DIFF_SAMPLE = 50;
const PREVIEW_MAX_CHARS = 180;

export interface DiffableLegalChunk {
  heading: string;
  ruleNumber: string | null;
  content: string;
  scope: string[];
}

export interface LegalChunksDiffResult {
  addedChunks: number;
  modifiedChunks: number;
  removedChunks: number;
  affectedHsCodes: string[];
  sampleChanges: LegalChunkDiffItem[];
}

export interface DiffableTariffRow {
  hsCode: string;
  description: string;
  adValorem: number;
  iva: number;
  isBK: boolean;
  isBIT: boolean;
  legalNotes: string | null;
}

export interface TariffRowsDiffResult {
  addedCount: number;
  modifiedCount: number;
  removedCount: number;
  affectedHsCodes: string[];
  changes: TariffRowChange[];
}

function chunkKey(chunk: DiffableLegalChunk, fallbackIdx: number): string {
  return chunk.ruleNumber
    ? `${chunk.heading.trim()}::${chunk.ruleNumber.trim()}`
    : `${chunk.heading.trim()}::#${fallbackIdx}`;
}

export function computeLegalChunksDiff(
  incoming: DiffableLegalChunk[],
  existing: DiffableLegalChunk[],
): LegalChunksDiffResult {
  const existingMap = new Map<string, DiffableLegalChunk>();
  existing.forEach((chunk, idx) => existingMap.set(chunkKey(chunk, idx), chunk));

  const incomingMap = new Map<string, DiffableLegalChunk>();
  incoming.forEach((chunk, idx) => incomingMap.set(chunkKey(chunk, idx), chunk));

  let addedChunks = 0;
  let modifiedChunks = 0;
  let removedChunks = 0;
  const affectedCodes = new Set<string>();
  const sampleChanges: LegalChunkDiffItem[] = [];

  for (const [key, inc] of incomingMap) {
    const prev = existingMap.get(key);
    if (!prev) {
      addedChunks += 1;
      inc.scope.forEach((c) => affectedCodes.add(c));
      if (sampleChanges.length < MAX_DIFF_SAMPLE) {
        sampleChanges.push({
          status: 'added',
          heading: inc.heading,
          ruleNumber: inc.ruleNumber,
          preview: inc.content.slice(0, PREVIEW_MAX_CHARS),
          scope: inc.scope,
        });
      }
      continue;
    }

    if (prev.content.trim() !== inc.content.trim()) {
      modifiedChunks += 1;
      prev.scope.forEach((c) => affectedCodes.add(c));
      inc.scope.forEach((c) => affectedCodes.add(c));
      if (sampleChanges.length < MAX_DIFF_SAMPLE) {
        sampleChanges.push({
          status: 'modified',
          heading: inc.heading,
          ruleNumber: inc.ruleNumber,
          preview: inc.content.slice(0, PREVIEW_MAX_CHARS),
          scope: inc.scope,
        });
      }
    }
  }

  for (const [key, prev] of existingMap) {
    if (incomingMap.has(key)) continue;
    removedChunks += 1;
    prev.scope.forEach((c) => affectedCodes.add(c));
    if (sampleChanges.length < MAX_DIFF_SAMPLE) {
      sampleChanges.push({
        status: 'removed',
        heading: prev.heading,
        ruleNumber: prev.ruleNumber,
        preview: prev.content.slice(0, PREVIEW_MAX_CHARS),
        scope: prev.scope,
      });
    }
  }

  return {
    addedChunks,
    modifiedChunks,
    removedChunks,
    affectedHsCodes: Array.from(affectedCodes).sort(),
    sampleChanges,
  };
}

export function computeTariffRowsDiff(
  incoming: DiffableTariffRow[],
  existing: DiffableTariffRow[],
): TariffRowsDiffResult {
  const existingMap = new Map(existing.map((row) => [row.hsCode, row]));
  const incomingMap = new Map(incoming.map((row) => [row.hsCode, row]));

  let addedCount = 0;
  let modifiedCount = 0;
  let removedCount = 0;
  const affectedCodes = new Set<string>();
  const changes: TariffRowChange[] = [];

  for (const [hsCode, inc] of incomingMap) {
    const prev = existingMap.get(hsCode);
    if (!prev) {
      addedCount += 1;
      affectedCodes.add(hsCode);
      if (changes.length < MAX_DIFF_SAMPLE) {
        changes.push({
          hsCode,
          changeType: 'added',
          description: inc.description,
          fieldsChanged: ['new'],
          afterAdValorem: inc.adValorem,
        });
      }
      continue;
    }

    const fieldsChanged: string[] = [];
    if (prev.description !== inc.description) fieldsChanged.push('description');
    if (prev.adValorem !== inc.adValorem) fieldsChanged.push('adValorem');
    if (prev.iva !== inc.iva) fieldsChanged.push('iva');
    if (prev.isBK !== inc.isBK) fieldsChanged.push('isBK');
    if (prev.isBIT !== inc.isBIT) fieldsChanged.push('isBIT');
    if ((prev.legalNotes ?? null) !== (inc.legalNotes ?? null)) fieldsChanged.push('legalNotes');

    if (fieldsChanged.length > 0) {
      modifiedCount += 1;
      affectedCodes.add(hsCode);
      if (changes.length < MAX_DIFF_SAMPLE) {
        changes.push({
          hsCode,
          changeType: 'modified',
          description: inc.description,
          fieldsChanged,
          beforeAdValorem: prev.adValorem,
          afterAdValorem: inc.adValorem,
        });
      }
    }
  }

  for (const [hsCode, prev] of existingMap) {
    if (incomingMap.has(hsCode)) continue;
    removedCount += 1;
    affectedCodes.add(hsCode);
    if (changes.length < MAX_DIFF_SAMPLE) {
      changes.push({
        hsCode,
        changeType: 'removed',
        description: prev.description,
        fieldsChanged: ['derogated'],
        beforeAdValorem: prev.adValorem,
      });
    }
  }

  return {
    addedCount,
    modifiedCount,
    removedCount,
    affectedHsCodes: Array.from(affectedCodes).sort(),
    changes,
  };
}
