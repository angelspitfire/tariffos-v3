/**
 * InMemoryTariffRepository - in-memory implementation of ITariffRepository.
 * Loads tariff data from MOCK_TARIFF_CHAPTERS, fuzzy-searches code/description,
 * returns the hierarchical tree, and keeps favorites/history in memory.
 */

import { TariffItem } from '@/domain/entities/TariffItem';
import { TariffStatus } from '@/domain/entities/TariffItem';
import { HSCode } from '@/domain/value-objects/HSCode';
import {
  ITariffRepository,
  TariffSearchFilters,
  TariffFavorite,
  TariffHistoryEntry,
} from '@/domain/repositories';
import { MOCK_TARIFF_CHAPTERS } from '@/__mocks__/tariff-chapters';
import { Result, Ok } from '@/domain/Result';

const SIMULATED_IO_DELAY_MS = 10;

async function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, SIMULATED_IO_DELAY_MS));
}

function mockItemToDomainItem(item: {
  code: string;
  description: string;
  descriptionEs?: string;
  dutyAdValorem: number;
  vat: number;
  fodinfa: number;
  unit: string;
  status: string;
  notes?: string;
}): TariffItem {
  return TariffItem.create({
    code: HSCode.createUnsafe(item.code),
    description: item.description,
    descriptionEs: item.descriptionEs,
    dutyAdValorem: item.dutyAdValorem,
    vat: item.vat,
    fodinfa: item.fodinfa,
    unit: item.unit,
    status: item.status as TariffStatus,
    notes: item.notes,
  });
}

function loadAllItems(): TariffItem[] {
  const items: TariffItem[] = [];
  for (const chapter of MOCK_TARIFF_CHAPTERS) {
    for (const heading of chapter.headings) {
      for (const subheading of heading.subheadings) {
        for (const item of subheading.items) {
          items.push(mockItemToDomainItem(item));
        }
      }
    }
  }
  return items;
}

function fuzzyScore(target: string, query: string): number | null {
  const t = target.toLowerCase();
  const q = query.toLowerCase();
  if (!q) return 0;
  let qi = 0;
  let score = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      score += 1;
      qi += 1;
    }
  }
  return qi === q.length ? score : null;
}

export class InMemoryTariffRepository implements ITariffRepository {
  private readonly items: TariffItem[] = loadAllItems();
  private readonly favorites = new Map<string, TariffFavorite>();
  private readonly history: TariffHistoryEntry[] = [];

  async search(query: string, filters?: TariffSearchFilters): Promise<Result<TariffItem[], Error>> {
    await delay();
    const trimmed = query.trim();
    let results = this.items;

    if (trimmed) {
      const scored = results
        .map((item) => {
          const codeScore = fuzzyScore(item.code.code, trimmed);
          const descScore = fuzzyScore(item.description, trimmed);
          const descEsScore = item.descriptionEs
            ? fuzzyScore(item.descriptionEs, trimmed)
            : null;
          const best = [codeScore, descScore, descEsScore]
            .filter((s): s is number => s !== null)
            .sort((a, b) => b - a)[0];
          return best === undefined ? null : { item, score: best };
        })
        .filter((r): r is { item: TariffItem; score: number } => r !== null)
        .sort((a, b) => b.score - a.score);
      results = scored.map((r) => r.item);
    }

    if (filters?.chapter?.length) {
      results = results.filter((item) => filters.chapter?.includes(item.code.chapter));
    }

    if (filters?.status?.length) {
      results = results.filter((item) => filters.status?.includes(item.status));
    }

    if (filters?.unit?.length) {
      results = results.filter((item) => filters.unit?.includes(item.unit));
    }

    return Ok([...results]);
  }

  async getByCode(code: string): Promise<Result<TariffItem | null, Error>> {
    await delay();
    const item = this.items.find((i) => i.code.code === code);
    return Ok(item ?? null);
  }

  async getTree(): Promise<Result<unknown[], Error>> {
    await delay();
    return Ok(MOCK_TARIFF_CHAPTERS);
  }

  async getFavorites(): Promise<Result<TariffFavorite[], Error>> {
    await delay();
    return Ok([...this.favorites.values()]);
  }

  async getHistory(): Promise<Result<TariffHistoryEntry[], Error>> {
    await delay();
    return Ok([...this.history].reverse());
  }

  async toggleFavorite(code: string, isFavorite: boolean): Promise<Result<void, Error>> {
    await delay();
    if (isFavorite) {
      if (!this.favorites.has(code)) {
        const item = this.items.find((i) => i.code.code === code);
        this.favorites.set(code, {
          id: crypto.randomUUID(),
          code,
          name: item?.description ?? code,
          notes: '',
          addedAt: new Date(),
          createdAt: new Date(),
        });
      }
    } else {
      this.favorites.delete(code);
    }
    return Ok(undefined);
  }

  async addToHistory(entry: TariffHistoryEntry): Promise<Result<void, Error>> {
    await delay();
    this.history.push({ ...entry, viewedAt: new Date() });
    return Ok(undefined);
  }

  async removeFromHistory(code: string): Promise<Result<void, Error>> {
    await delay();
    const index = this.history.findIndex((e) => e.code === code);
    if (index !== -1) this.history.splice(index, 1);
    return Ok(undefined);
  }

  async clearHistory(): Promise<Result<void, Error>> {
    await delay();
    this.history.length = 0;
    return Ok(undefined);
  }
}
