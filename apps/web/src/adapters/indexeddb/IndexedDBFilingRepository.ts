/**
 * IndexedDB Filing Repository Adapter
 * Production persistence for filings
 */

import { Filing } from '@/domain/entities';
import { FilingCode } from '@/domain/entities';
import { FilingFilters } from '@/domain/repositories';
import { idb } from './IDBDatabase';

const STORE_NAME = 'filings';

export class IndexedDBFilingRepository {
  async save(filing: Filing): Promise<{ ok: true; value: Filing } | { ok: false; error: Error }> {
    try { const snapshot = filing.toSnapshot(); await idb.put(STORE_NAME, snapshot); return { ok: true, value: filing }; } 
    catch (error) { return { ok: false, error: error instanceof Error ? error : new Error('Failed to save filing') }; }
  }

  async findById(id: string): Promise<{ ok: true; value: Filing | null } | { ok: false; error: Error }> {
    try { const result = await idb.get<Filing>(STORE_NAME, id); if (!result.ok) throw result.error; return { ok: true, value: result.value ? Filing.reconstruct(result.value.toSnapshot()) : null }; } 
    catch (error) { return { ok: false, error: error instanceof Error ? error : new Error('Failed to find filing by ID') }; }
  }

  async findByCode(code: FilingCode): Promise<{ ok: true; value: Filing | null } | { ok: false; error: Error }> {
    try { const result = await idb.getAllByIndex<Filing>(STORE_NAME, 'code', code.value); if (!result.ok) throw result.error; return { ok: true, value: result.value[0] ? Filing.reconstruct(result.value[0].toSnapshot()) : null }; } 
    catch (error) { return { ok: false, error: error instanceof Error ? error : new Error('Failed to find filing by code') }; }
  }

  async findAll(filters?: FilingFilters): Promise<{ ok: true; value: Filing[] } | { ok: false; error: Error }> {
    try {
      const result = await idb.getAll<Filing>(STORE_NAME);
      if (!result.ok) throw result.error;
      let filings = result.value.map((f: Filing) => Filing.reconstruct(f.toSnapshot()));

      if (filters) {
        if (filters.status && filters.status.length > 0) filings = filings.filter((f: Filing) => filters.status!.includes(f.status));
        if (filters.dateRange) filings = filings.filter((f: Filing) => f.createdAt >= filters.dateRange!.from && f.createdAt <= filters.dateRange!.to);
        if (filters.searchQuery) { const q = filters.searchQuery.toLowerCase(); filings = filings.filter((f: Filing) => f.title.toLowerCase().includes(q) || f.code.value.toLowerCase().includes(q)); }
        if (filters.offset) filings = filings.slice(filters.offset);
        if (filters.limit) filings = filings.slice(0, filters.limit);
      }

      filings.sort((a: Filing, b: Filing) => b.updatedAt.getTime() - a.updatedAt.getTime());
      return { ok: true, value: filings };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error : new Error('Failed to find filings') };
    }
  }

  async delete(id: string): Promise<{ ok: true; value: true } | { ok: false; error: Error }> {
    try { await idb.delete(STORE_NAME, id); return { ok: true, value: true }; } 
    catch (error) { return { ok: false, error: error instanceof Error ? error : new Error('Failed to delete filing') }; }
  }
}
