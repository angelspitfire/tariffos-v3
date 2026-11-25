/**
 * InMemoryFilingRepository - in-memory implementation of IFilingRepository.
 * Stores filings in a Map<string, Filing>; simulates async I/O.
 */

import { Filing } from '@/domain/entities/Filing';
import { FilingCode } from '@/domain/entities/FilingCode';
import { FilingFilters, IFilingRepository } from '@/domain/repositories';
import { Result, Ok } from '@/domain/Result';

const SIMULATED_IO_DELAY_MS = 10;

async function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, SIMULATED_IO_DELAY_MS));
}

export class InMemoryFilingRepository implements IFilingRepository {
  private readonly store = new Map<string, Filing>();

  async findById(id: string): Promise<Result<Filing | null, Error>> {
    await delay();
    const filing = this.store.get(id);
    return Ok(filing ? Filing.reconstruct(filing.toSnapshot()) : null);
  }

  async findByCode(code: FilingCode): Promise<Result<Filing | null, Error>> {
    await delay();
    const filing = Array.from(this.store.values()).find((f) => f.code.equals(code));
    return Ok(filing ? Filing.reconstruct(filing.toSnapshot()) : null);
  }

  async findAll(filters?: FilingFilters): Promise<Result<Filing[], Error>> {
    await delay();
    let results = Array.from(this.store.values()).map((f) =>
      Filing.reconstruct(f.toSnapshot())
    );

    if (filters?.status?.length) {
      results = results.filter((f) => filters.status?.includes(f.status));
    }

    if (filters?.dateRange) {
      const { from, to } = filters.dateRange;
      results = results.filter((f) => f.createdAt >= from && f.updatedAt <= to);
    }

    if (filters?.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      results = results.filter(
        (f) => f.code.value.toLowerCase().includes(q) || f.title.toLowerCase().includes(q)
      );
    }

    if (filters?.offset) {
      results = results.slice(filters.offset);
    }
    if (filters?.limit) {
      results = results.slice(0, filters.limit);
    }

    return Ok(results);
  }

  async save(filing: Filing): Promise<Result<void, Error>> {
    await delay();
    this.store.set(filing.id, Filing.reconstruct(filing.toSnapshot()));
    return Ok(undefined);
  }

  async delete(id: string): Promise<Result<boolean, Error>> {
    await delay();
    return Ok(this.store.delete(id));
  }
}
