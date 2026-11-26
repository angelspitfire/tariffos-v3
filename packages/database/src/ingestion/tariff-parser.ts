import { ancestryOf, composeDocument } from '../arancel-tree';
import { formatNationalCode, nationalDigits, type CountryRecord } from '../country';

export interface NormalizedTariffRow {
  hsCode: string;
  formattedCode: string;
  description: string;
  composedDocument: string;
  adValorem: number;
  iva: number;
  customsFee: number;
  legalNotes: string | null;
  isBK: boolean;
  isBIT: boolean;
  isLeaf: boolean;
}

export interface ParsedTariffSchedule {
  rows: NormalizedTariffRow[];
  leafCount: number;
  errors: string[];
}

const DEFAULT_IVA_RATE = 16;
const DEFAULT_CUSTOMS_FEE = 1;

function parseCsvLine(line: string): string[] {
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
      continue;
    }
    if (ch === ',' && !inQuotes) {
      cells.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  cells.push(current.trim());
  return cells;
}

function parseAecFlags(raw: unknown, rateFallback: number): { rate: number; isBK: boolean; isBIT: boolean } {
  const text = typeof raw === 'string' ? raw.trim() : '';
  const isBIT = /\bBIT\b|BIT$/i.test(text);
  const isBK = !isBIT && /\bBK\b|BK$/i.test(text);
  const match = text.match(/(\d+(?:\.\d+)?)/);
  const parsedRate = match?.[1] ? Number.parseFloat(match[1]) : rateFallback;
  return { rate: Number.isFinite(parsedRate) ? parsedRate : rateFallback, isBK, isBIT };
}

function parseRawRecords(raw: string, format: 'tariff_csv' | 'tariff_json'): Array<Record<string, unknown>> {
  const clean = raw.replace(/^\uFEFF/, '').trim();
  if (!clean) return [];

  if (format === 'tariff_json') {
    const parsed = JSON.parse(clean) as unknown;
    if (Array.isArray(parsed)) return parsed.filter((r): r is Record<string, unknown> => Boolean(r && typeof r === 'object'));
    if (parsed && typeof parsed === 'object' && Array.isArray((parsed as { rows?: unknown }).rows)) {
      return (parsed as { rows: unknown[] }).rows.filter(
        (r): r is Record<string, unknown> => Boolean(r && typeof r === 'object'),
      );
    }
    throw new Error('JSON arancelario debe ser un arreglo o un objeto con propiedad rows[]');
  }

  const lines = clean.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0] ?? '').map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const record: Record<string, unknown> = {};
    headers.forEach((header, idx) => {
      record[header] = values[idx] ?? '';
    });
    return record;
  });
}

function toTextCell(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '';
}

function toFiniteNumber(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number.parseFloat(value.replace('%', '').trim());
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

/**
 * Parses and validates tabular tariff schedules (CSV or JSON) against the
 * target Country nomenclature depth and dot-grouping.
 */
export function parseTariffSchedule(
  raw: string,
  format: 'tariff_csv' | 'tariff_json',
  country: Pick<CountryRecord, 'code' | 'nomenclatureDigits' | 'codeGrouping'>,
): ParsedTariffSchedule {
  const records = parseRawRecords(raw, format);
  const errors: string[] = [];
  const validCandidates: Array<Omit<NormalizedTariffRow, 'composedDocument'>> = [];

  records.forEach((rec, index) => {
    const rawCode = toTextCell(rec.hsCode ?? rec.digits ?? rec.code).trim();
    const digits = nationalDigits(rawCode);
    const description = toTextCell(rec.description).replace(/\s+/g, ' ').trim();

    if (!digits || digits.length < 4 || digits.length > country.nomenclatureDigits) {
      errors.push(`Fila ${index + 1}: código HS inválido "${rawCode}" para ${country.code} (${country.nomenclatureDigits} dígitos)`);
      return;
    }
    if (!description) {
      errors.push(`Fila ${index + 1} (${digits}): descripción vacía`);
      return;
    }

    const baseRate = toFiniteNumber(rec.adValorem, 0);
    const aec = parseAecFlags(rec.aec, baseRate);
    const iva = toFiniteNumber(rec.iva, DEFAULT_IVA_RATE);
    const customsFee = toFiniteNumber(rec.customsFee, DEFAULT_CUSTOMS_FEE);

    if (aec.rate < 0 || iva < 0 || customsFee < 0) {
      errors.push(`Fila ${index + 1} (${digits}): alícuota negativa no permitida`);
      return;
    }

    const isBK = Boolean(rec.isBK) || aec.isBK;
    const isBIT = Boolean(rec.isBIT) || aec.isBIT;
    const legalNotes = toTextCell(rec.legalNotes).trim() || null;
    const isLeaf = digits.length === country.nomenclatureDigits;
    const formattedCode = isLeaf ? formatNationalCode(digits, country.codeGrouping) : rawCode || digits;

    validCandidates.push({
      hsCode: digits,
      formattedCode,
      description,
      adValorem: aec.rate,
      iva,
      customsFee,
      legalNotes,
      isBK,
      isBIT,
      isLeaf,
    });
  });

  const byCode = new Map(validCandidates.map((row) => [row.hsCode, row.description]));
  const rows: NormalizedTariffRow[] = validCandidates.map((row) => ({
    ...row,
    composedDocument: composeDocument(ancestryOf(row.hsCode, byCode), row.description),
  }));

  return {
    rows,
    leafCount: rows.filter((r) => r.isLeaf).length,
    errors,
  };
}
