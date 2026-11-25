/**
 * Mock tool handlers for development.
 * Returns mock data matching the tool result schemas.
 * Replace with real backend calls when integrating.
 */

import {
  INITIAL_MANIFEST,
  INITIAL_TAX_DATA,
  INITIAL_DISCREPANCY,
  SINGLE_ITEM_MOCK,
} from '@/__mocks__';
import { INITIAL_DISAMBIGUATION } from '@/__mocks__';
import { INITIAL_PERMITS_DATA } from '@/__mocks__';
import { INITIAL_EXONERATION_DATA } from '@/__mocks__';
import { INITIAL_DOSSIER_DATA } from '@/__mocks__';
import {
  MOCK_TOTAL_CIF,
  MOCK_TOTAL_DUTIES,
  FILING_ID,
  MOCK_DELAY_SHORT_MS,
  MOCK_DELAY_MEDIUM_MS,
  MOCK_DELAY_LONG_MS,
  MOCK_DELAY_EXTRA_LONG_MS,
} from '@/__mocks__';
import { MOCK_TARIFF_CHAPTERS, MAX_TARIFF_SEARCH_RESULTS } from '@/__mocks__';

export const mockToolHandlers = {
  classify_batch_manifest: async () => {
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MEDIUM_MS));
    return {
      filingId: FILING_ID,
      mode: 'batch' as const,
      items: INITIAL_MANIFEST,
      totalCif: MOCK_TOTAL_CIF,
      totalDuties: MOCK_TOTAL_DUTIES,
    };
  },

  classify_single_item: async (args: { description: string; hsCode?: string }) => {
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_SHORT_MS));
    return {
      ...SINGLE_ITEM_MOCK,
      description: args.description,
      hsCode: args.hsCode ?? SINGLE_ITEM_MOCK.hsCode,
    };
  },

  calculate_taxes: async () => {
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MEDIUM_MS));
    return INITIAL_TAX_DATA;
  },

  audit_discrepancies: async () => {
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_LONG_MS));
    return INITIAL_DISCREPANCY;
  },

  resolve_disambiguation: async (args: { lineItemId: string; filingId?: string }) => {
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MEDIUM_MS));
    return {
      ...INITIAL_DISAMBIGUATION,
      lineItemId: args.lineItemId,
      filingId: args.filingId ?? FILING_ID,
    };
  },

  verify_permits_compliance: async () => {
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MEDIUM_MS));
    return INITIAL_PERMITS_DATA;
  },

  simulate_exonerations: async (args: { filingId: string; agreement?: string }) => {
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MEDIUM_MS));
    return {
      ...INITIAL_EXONERATION_DATA,
      agreement: args.agreement ?? 'all',
    };
  },

  generate_customs_dossier: async () => {
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_EXTRA_LONG_MS));
    return INITIAL_DOSSIER_DATA;
  },

  extract_document: async () => {
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_LONG_MS));
    return {
      filingId: `EXT-${Date.now()}`,
      items: INITIAL_MANIFEST,
      totalCif: MOCK_TOTAL_CIF,
      totalDuties: MOCK_TOTAL_DUTIES,
      extractedFields: {
        invoiceNumber: `INV-${Date.now()}`,
        vendor: 'Mock Vendor Ltd.',
        date: new Date().toISOString().split('T')[0],
        currency: 'USD',
      },
    };
  },
};

// Chapter data for tariff reference
export async function getTariffChapters() {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return MOCK_TARIFF_CHAPTERS;
}

export async function searchTariffItems(query: string) {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const q = query.toLowerCase();
  const results = MOCK_TARIFF_CHAPTERS.flatMap((chapter) =>
    chapter.headings.flatMap((heading) =>
      heading.subheadings.flatMap((subheading) =>
        subheading.items
          .filter(
            (item) =>
              item.code.toLowerCase().includes(q) ||
              item.description.toLowerCase().includes(q) ||
              (item.descriptionEs ?? '').toLowerCase().includes(q)
          )
          .map((item) => ({
            item,
            chapter: chapter.code,
            heading: heading.code,
            subheading: subheading.code,
          }))
      )
    )
  );
  return results.slice(0, MAX_TARIFF_SEARCH_RESULTS);
}
