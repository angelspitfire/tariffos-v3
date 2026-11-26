export interface HistoricalPrecedentRow {
  sku?: string;
  description: string;
  hsCode: string;
  originCountry?: string;
  notes?: string;
  confidence: number;
}

function normalizeHsCode(raw: string): string | null {
  const digits = raw.replace(/[^0-9]/g, '');
  if (digits.length < 4 || digits.length > 10) return null;
  const padded = digits.padEnd(10, '0');
  return `${padded.slice(0, 4)}.${padded.slice(4, 6)}.${padded.slice(6, 8)}.${padded.slice(8, 10)}`;
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]!;
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if ((ch === ',' || ch === ';') && !inQuotes) {
      cells.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  cells.push(current.trim());
  return cells;
}

function toText(value: unknown): string {
  return typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '';
}

function coerceRow(record: Record<string, unknown>): HistoricalPrecedentRow | null {
  const description = toText(
    record.description ?? record.descripcion ?? record.product ?? record.producto,
  );
  const rawHs = toText(record.hsCode ?? record.hs_code ?? record.codigo ?? record.arancel);
  const hsCode = normalizeHsCode(rawHs);
  if (!description || !hsCode) return null;

  const sku = toText(record.sku) || undefined;
  const originCountry = toText(record.originCountry ?? record.origin ?? record.origen) || undefined;
  const notes = toText(record.notes ?? record.notas) || undefined;
  const confRaw = Number(record.confidence ?? 0.99);
  const confidence = Number.isFinite(confRaw) && confRaw > 0 && confRaw <= 1 ? confRaw : 0.99;

  return { sku, description, hsCode, originCountry, notes, confidence };
}

/**
 * Parses and deduplicates historical classified invoice rows (JSON or CSV)
 * into normalized 10-digit `ProductMaster` precedent records for Tier 0 lookup.
 */
export function parseHistoricalPrecedents(
  raw: string,
  format: 'json' | 'csv',
): HistoricalPrecedentRow[] {
  const items: Array<Record<string, unknown>> = [];

  if (format === 'json') {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      for (const row of parsed) {
        if (row && typeof row === 'object') items.push(row as Record<string, unknown>);
      }
    }
  } else {
    const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) return [];
    const headers = parseCsvLine(lines[0]!).map((h) => h.toLowerCase());
    for (const line of lines.slice(1)) {
      const cells = parseCsvLine(line);
      const obj: Record<string, unknown> = {};
      headers.forEach((h, idx) => {
        obj[h] = cells[idx] ?? '';
      });
      items.push(obj);
    }
  }

  const deduped = new Map<string, HistoricalPrecedentRow>();
  for (const item of items) {
    const coerced = coerceRow(item);
    if (!coerced) continue;
    deduped.set(coerced.description.toLowerCase(), coerced);
  }
  return Array.from(deduped.values());
}
