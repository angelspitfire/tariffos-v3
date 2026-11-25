/**
 * IndexedDB Tariff Repository Adapter
 * Production persistence for tariff cache
 */

import { idb } from './IDBDatabase';
import { MOCK_TARIFF_CHAPTERS } from '@/__mocks__';
import type { TariffStatus } from '@/domain/entities/TariffItem';

const FUZZY_MIN_SCORE_THRESHOLD = 3 / 10;
const FUZZY_PREFIX_SCORE = 95 / 100;
const FUZZY_CONSECUTIVE_BONUS = 1 / 10;

function fuzzyMatch(text: string, query: string): { score: number; indices: number[] } | null {
  const t = text.toLowerCase(); const q = query.toLowerCase();
  if (q.length === 0) return null;
  if (t === q) return { score: 1, indices: t.split('').map((_: string, i: number) => i) };
  if (t.startsWith(q)) return { score: FUZZY_PREFIX_SCORE, indices: q.split('').map((_: string, i: number) => i) };
  const indices: number[] = []; let j = 0, consecutive = 0, score = 0;
  for (let i = 0; i < t.length; i++) { if (j < q.length && t[i] === q[j]) { indices.push(i); j++; consecutive++; score += 1 + consecutive * FUZZY_CONSECUTIVE_BONUS; } else { consecutive = 0; } }
  if (j < q.length) return null;
  const normalized = Math.min(score / t.length, 1);
  return normalized >= FUZZY_MIN_SCORE_THRESHOLD ? { score: normalized, indices } : null;
}

export class IndexedDBTariffRepository {
  private _allItems: unknown[] = [];
  private _initialized = false;

  private async ensureInitialized(): Promise<void> {
    if (this._initialized) return;
    const result = await idb.getAll<unknown>('tariffCache');
    if (!result.ok) throw result.error;
    const cached = result.value;
    const now = Date.now();
    const validCache = cached.filter((c: unknown) => now - (c as { cachedAt: number }).cachedAt < 7 * 24 * 60 * 60 * 1000);
    if (validCache.length > 0) {
      const { TariffItem } = await import('@/domain/entities/TariffItem');
      const { HSCode } = await import('@/domain/value-objects/HSCode');
      this._allItems = validCache.map((c: unknown) => {
        const data = c as { 
          code: { code: string }; 
          description: string; 
          descriptionEs?: string; 
          dutyAdValorem: number; 
          vat: number; 
          fodinfa: number; 
          unit: string; 
          status: string; 
          notes?: string; 
          requiresPermit?: boolean; 
          permitAgencies?: string[] 
        };
        return TariffItem.reconstruct({
          code: HSCode.createUnsafe(data.code.code),
          description: data.description,
          descriptionEs: data.descriptionEs,
          dutyAdValorem: data.dutyAdValorem,
          vat: data.vat,
          fodinfa: data.fodinfa,
          unit: data.unit,
          status: data.status as TariffStatus,
          notes: data.notes,
          requiresPermit: data.requiresPermit,
          permitAgencies: data.permitAgencies,
        });
      });
    } else {
      const { TariffItem } = await import('@/domain/entities/TariffItem');
      const { HSCode } = await import('@/domain/value-objects/HSCode');
      this._allItems = [];
      for (const chapter of MOCK_TARIFF_CHAPTERS as unknown[]) {
        for (const heading of (chapter as { headings: unknown[] }).headings) {
          for (const subheading of (heading as { subheadings: unknown[] }).subheadings) {
            for (const item of (subheading as { items: unknown[] }).items) {
              const codeResult = HSCode.create((item as { code: string }).code);
              if (codeResult.ok) {
                this._allItems.push(TariffItem.create({
                  code: codeResult.value, 
                  description: (item as { description: string }).description, 
                  descriptionEs: (item as { descriptionEs?: string }).descriptionEs,
                  dutyAdValorem: (item as { dutyAdValorem: number }).dutyAdValorem, 
                  vat: (item as { vat: number }).vat, 
                  fodinfa: (item as { fodinfa: number }).fodinfa,
                  unit: (item as { unit: string }).unit, 
                  status: (item as { status: string }).status as TariffStatus, 
                  notes: (item as { notes?: string }).notes,
                }));
              }
            }
          }
        }
      }
      const cacheData = this._allItems.map((item: unknown) => ({ 
        code: (item as { code: { code: string } }).code.code, 
        data: (item as { toSnapshot: () => unknown }).toSnapshot(), 
        cachedAt: Date.now() 
      }));
      const { idb } = await import('./IDBDatabase');
      for (const c of cacheData) { await idb.put('tariffCache', c); }
    }
    this._initialized = true;
  }

  async search(query: string, filters?: unknown): Promise<{ ok: true; value: unknown[] } | { ok: false; error: Error }> {
    await this.ensureInitialized();
    const trimmed = query.trim().toLowerCase(); if (trimmed.length === 0) return { ok: true, value: [] };
    let items = this._allItems;
    const scored = items.map((item: unknown) => {
      const codeMatch = fuzzyMatch((item as { code: { code: string } }).code.code, trimmed);
      const descMatch = fuzzyMatch((item as { description: string }).description, trimmed);
      const descEsMatch = (item as { descriptionEs?: string }).descriptionEs ? fuzzyMatch((item as { descriptionEs: string }).descriptionEs, trimmed) : null;
      const matches = [codeMatch, descMatch, descEsMatch].filter((m: unknown): m is { score: number; indices: number[] } => m !== null).sort((a: unknown, b: unknown) => (b as { score: number }).score - (a as { score: number }).score);
      return matches.length > 0 ? { item, score: matches[0].score } : null;
    }).filter((r: unknown): r is { item: unknown; score: number } => r !== null).sort((a: unknown, b: unknown) => (b as { score: number }).score - (a as { score: number }).score || (a as { item: { code: { code: string } } }).item.code.code.localeCompare((b as { item: { code: { code: string } } }).item.code.code));
    items = scored.map((r: unknown) => (r as { item: unknown }).item);
    if (filters) {
      const f = filters as { chapter?: string[]; status?: string[]; dutyRange?: [number, number]; unit?: string[]; requiresPermit?: boolean };
      if (f.chapter && f.chapter.length > 0) items = items.filter((item: unknown) => f.chapter!.includes((item as { code: { chapter: string } }).code.chapter));
      if (f.status && f.status.length > 0) items = items.filter((item: unknown) => f.status!.includes((item as { status: string }).status));
      if (f.dutyRange) items = items.filter((item: unknown) => (item as { dutyAdValorem: number }).dutyAdValorem >= f.dutyRange![0] && (item as { dutyAdValorem: number }).dutyAdValorem <= f.dutyRange![1]);
      if (f.unit && f.unit.length > 0) items = items.filter((item: unknown) => f.unit!.includes((item as { unit: string }).unit));
      if (f.requiresPermit !== undefined) items = items.filter((item: unknown) => (item as { requiresPermit: boolean }).requiresPermit === f.requiresPermit);
    }
    return { ok: true, value: items.slice(0, 50) };
  }

  async getByCode(code: unknown): Promise<{ ok: true; value: unknown } | { ok: false; error: Error }> { const item = this._allItems.find((i: unknown) => (i as { code: { equals: (c: unknown) => boolean } }).code.equals(code)) ?? null; return { ok: true, value: item }; }
  async getTree(): Promise<{ ok: true; value: unknown }> { const { MOCK_TARIFF_CHAPTERS } = await import('@/__mocks__'); return { ok: true, value: MOCK_TARIFF_CHAPTERS }; }
  async getFavorites(): Promise<{ ok: true; value: unknown[] }> { return { ok: true, value: [] }; }
  async getHistory(): Promise<{ ok: true; value: unknown[] }> { return { ok: true, value: [] }; }
  async toggleFavorite(_code: unknown, _isFavorite: boolean): Promise<{ ok: true; value: undefined }> { return { ok: true, value: undefined }; }
  async addToHistory(_entry: unknown): Promise<{ ok: true; value: undefined }> { return { ok: true, value: undefined }; }
  async removeFromHistory(_code: string): Promise<{ ok: true; value: undefined }> { return { ok: true, value: undefined }; }
  async clearHistory(): Promise<{ ok: true; value: unknown }> { return { ok: true, value: undefined }; }
}
