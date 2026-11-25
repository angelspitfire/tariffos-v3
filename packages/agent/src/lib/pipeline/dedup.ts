import type { InvoiceItemInput } from './types.js';

export interface DeduplicatedGroup {
  key: string;
  representative: InvoiceItemInput;
  members: InvoiceItemInput[];
}

/** Normalize SKU or description into a deterministic deduplication key. */
export function buildItemKey(item: InvoiceItemInput): string {
  const sku = item.sku?.trim().toLowerCase();
  if (sku) return `sku:${sku}|${item.originCountry.toUpperCase()}`;
  const normalizedDesc = item.description
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
  return `desc:${normalizedDesc}|${item.originCountry.toUpperCase()}`;
}

/** Group identical invoice lines so each unique product is classified once. */
export function deduplicateInvoiceItems(items: InvoiceItemInput[]): DeduplicatedGroup[] {
  const groups = new Map<string, DeduplicatedGroup>();

  for (const item of items) {
    const key = buildItemKey(item);
    const existing = groups.get(key);
    if (existing) {
      existing.members.push(item);
    } else {
      groups.set(key, { key, representative: item, members: [item] });
    }
  }

  return Array.from(groups.values());
}
