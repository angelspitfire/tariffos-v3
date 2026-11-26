import { AUTO_APPROVE_CONFIDENCE_THRESHOLD, type InvoiceItemInput } from '@tariffos/agent';
import type { ClassificationLinePayload } from '@tariffos/shared-types';

export const DEFAULT_MICRO_BATCH_SIZE = 10;
const AUTO_CLASSIFY_CONFIDENCE_THRESHOLD = AUTO_APPROVE_CONFIDENCE_THRESHOLD;

export interface BatchSummary {
  totalLines: number;
  autoClassifiedCount: number;
  proposedReviewCount: number;
  blockedCount: number;
  averageConfidencePct: number;
  totalCifUsd: number;
  totalDutiesUsd: number;
  totalIvaUsd: number;
}

export function chunkItems<T>(items: readonly T[], size = DEFAULT_MICRO_BATCH_SIZE): T[][] {
  const safeSize = Math.max(1, Math.floor(size));
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += safeSize) {
    chunks.push(items.slice(i, i + safeSize));
  }
  return chunks;
}

function splitDelimitedRow(line: string, delimiter: string): string[] {
  if (delimiter !== ',') {
    return line.split(delimiter).map((cell) => cell.trim());
  }
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      cells.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  cells.push(current.trim());
  return cells;
}

function detectDelimiter(sample: string): string | null {
  if (sample.includes('|')) return '|';
  if (sample.includes('\t')) return '\t';
  if (sample.includes(',')) return ',';
  return null;
}

function isHeaderRow(cells: string[]): boolean {
  const joined = cells.map((c) => c.toLowerCase()).join(' ');
  return (
    joined.includes('description') ||
    joined.includes('descripcion') ||
    joined.includes('descripción') ||
    (joined.includes('sku') && (joined.includes('cif') || joined.includes('origin')))
  );
}

function parseNumberSafe(value: string | undefined, fallback = 0): number {
  if (!value) return fallback;
  const cleaned = value.replace(/[$,\s]/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Parse CSV, pipe-delimited, tab-delimited, or plain newline text into InvoiceItemInput rows.
 */
export function parseBatchTextToItems(text: string, defaultOrigin = 'CN'): InvoiceItemInput[] {
  const rawLines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (rawLines.length === 0) return [];

  const delimiter = detectDelimiter(rawLines[0]);
  if (!delimiter) {
    return rawLines.map((description, idx) => ({
      lineId: `line-${idx + 1}`,
      description,
      originCountry: defaultOrigin,
      cifValue: 0,
    }));
  }

  const firstCells = splitDelimitedRow(rawLines[0], delimiter);
  const startIndex = isHeaderRow(firstCells) ? 1 : 0;
  const items: InvoiceItemInput[] = [];

  for (let i = startIndex; i < rawLines.length; i += 1) {
    const cells = splitDelimitedRow(rawLines[i], delimiter);
    if (cells.length === 0 || cells.every((c) => c.length === 0)) continue;

    if (cells.length === 1) {
      items.push({
        lineId: `line-${items.length + 1}`,
        description: cells[0],
        originCountry: defaultOrigin,
        cifValue: 0,
      });
      continue;
    }

    const [sku, description, origin, cifRaw, qtyRaw] = cells;
    if (!description) continue;

    items.push({
      lineId: `line-${items.length + 1}`,
      sku: sku || undefined,
      description,
      originCountry: origin && origin.length >= 2 ? origin.toUpperCase() : defaultOrigin,
      cifValue: parseNumberSafe(cifRaw, 0),
      quantity: qtyRaw ? parseNumberSafe(qtyRaw, 1) : undefined,
    });
  }

  return items;
}

export function buildBatchSummary(lines: readonly ClassificationLinePayload[]): BatchSummary {
  if (lines.length === 0) {
    return {
      totalLines: 0,
      autoClassifiedCount: 0,
      proposedReviewCount: 0,
      blockedCount: 0,
      averageConfidencePct: 0,
      totalCifUsd: 0,
      totalDutiesUsd: 0,
      totalIvaUsd: 0,
    };
  }

  let autoClassifiedCount = 0;
  let proposedReviewCount = 0;
  let blockedCount = 0;
  let confidenceSum = 0;
  let totalCifUsd = 0;
  let totalDutiesUsd = 0;
  let totalIvaUsd = 0;

  for (const line of lines) {
    confidenceSum += line.confidencePct;
    totalCifUsd += line.duties.cif;
    totalDutiesUsd += line.duties.arancelAmount;
    totalIvaUsd += line.duties.ivaAmount;

    if (line.tierUsed === 'pre_gate_blocked' || line.flags.some((f) => f.type === 'blocking')) {
      blockedCount += 1;
    } else if (line.confidencePct >= AUTO_CLASSIFY_CONFIDENCE_THRESHOLD && line.verifiedAgainstDb) {
      autoClassifiedCount += 1;
    } else {
      proposedReviewCount += 1;
    }
  }

  return {
    totalLines: lines.length,
    autoClassifiedCount,
    proposedReviewCount,
    blockedCount,
    averageConfidencePct: Math.round(confidenceSum / lines.length),
    totalCifUsd: roundCurrency(totalCifUsd),
    totalDutiesUsd: roundCurrency(totalDutiesUsd),
    totalIvaUsd: roundCurrency(totalIvaUsd),
  };
}
