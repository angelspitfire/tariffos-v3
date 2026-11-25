/**
 * MockTariffRepository - mock implementation of ITariffRepository.
 * Uses MOCK_TARIFF_CHAPTERS as the data source.
 */

import { TariffChapter } from '@/domain/repositories';
import { MOCK_TARIFF_CHAPTERS } from '@/__mocks__';

export class MockTariffRepository {
  async searchTariff(
    query: string,
    filters?: {
      chapter?: string[];
      status?: string[];
      dutyRange?: [number, number];
    },
  ): Promise<TariffChapter[]> {
    let results = [...MOCK_TARIFF_CHAPTERS];

    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      results = results.filter((chapter) =>
        chapter.title.toLowerCase().includes(lowerQuery),
      );
    }

    if (filters?.chapter?.length) {
      results = results.filter((chapter) =>
        filters.chapter?.includes(chapter.code),
      );
    }

    if (filters?.status?.length) {
      results = results.filter((chapter) =>
        chapter.headings.some((heading) =>
          heading.subheadings.some((subheading) =>
            subheading.items.some((item) => filters.status?.includes(item.status)),
          ),
        ),
      );
    }

    if (filters?.dutyRange) {
      const [minDuty, maxDuty] = filters.dutyRange;
      results = results.filter((chapter) =>
        chapter.headings.some((heading) =>
          heading.subheadings.some((subheading) =>
            subheading.items.some((item) => {
              const duty = item.dutyAdValorem;
              return duty >= minDuty && duty <= maxDuty;
            }),
          ),
        ),
      );
    }

    return results;
  }

  async getTarItem(code: string): Promise<TariffChapter | null> {
    for (const chapter of MOCK_TARIFF_CHAPTERS) {
      for (const heading of chapter.headings) {
        for (const subheading of heading.subheadings) {
          for (const item of subheading.items) {
            if (item.code === code) {
              return chapter;
            }
          }
        }
      }
    }
    return null;
  }

  async getChapters(): Promise<string[]> {
    const chapterCodes = new Set<string>();
    for (const chapter of MOCK_TARIFF_CHAPTERS) {
      chapterCodes.add(chapter.code);
    }
    return Array.from(chapterCodes).sort();
  }
}