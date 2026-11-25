/**
 * Deterministic extractor for the Venezuelan Arancel de Aduanas.
 *
 * Source of truth:  docs/laws/ve/Tradex-Arancel-de-Aduanas-Decreto-4.944-GOE-6.804.pdf
 * Instrument:       Decreto N° 4.944 (24 April 2024), Gaceta Oficial Extraordinaria N° 6.804
 *
 * This replaces the stochastic LLM reading in `extract_by_chapter.ts`, which:
 *   - dropped sibling leaves (3,337 of the 11,829 official ten-digit codes were absent),
 *   - invented splits the decree does not contain (e.g. `1601.00.00.00` was stored as three
 *     codes `1601000010/20/90`), and
 *   - fabricated codes and descriptions (e.g. `3004.20.59.12` "Las demás cefadroxilos y
 *     cefiximas" — neither the code nor the word "cefixima" occurs anywhere in the decree).
 *
 * The PDF is a table with seven columns. Their x positions are NOT constant: the tables of
 * the later subchapters (98.xx) are indented differently, so the boundaries are re-derived
 * from each page's own header row (`Código`, `AEC`, `Ex.AEC`, `Importación`, `Exportación`,
 * `Física`).
 *
 *   (1) Código          the dotted tariff code
 *   (2) Descripción     preceded by one "-" per hierarchy level (the "guiones")
 *   (3) AEC             ad valorem
 *   (4) Ex.AEC          exceptional AEC marking (e.g. "2E", "0A")
 *   (5) Importación     artículo 21 legal-regime cell (raw string is preserved verbatim)
 *   (6) Exportación     legal-regime cell (raw string is preserved verbatim)
 *   (7) Física          unit of measure ("kg", "u", "ℓ", "m³", ...)
 *
 * Description text wraps onto following lines, and the numeric columns are frequently drawn
 * on a line *below* the code (sometimes *above* the last description line), so a row is
 * accumulated until the next code is seen.
 *
 * Usage:
 *   npx tsx src/scripts/extract_arancel_pdf.ts <pdf> <out.json> [baselinePortableDir]
 *
 * The optional baseline directory is diffed against the extraction (missing / fabricated
 * codes) so a regression is visible before any re-seed.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

/** e.g. 21.06 | 2106.90 | 0101.2 | 2106.90.30 | 2106.90.30.12 */
const CODE_RE = /^\d{2,4}(?:\.\d{1,2}){1,3}$/;

const HEADER_TOKENS = [
  'Código',
  'Descripción',
  'Unidad',
  'AEC',
  'Ex.AEC',
  'Importación',
  'Exportación',
  'Física',
  'GACETA OFICIAL',
  'Extraordinario',
];

/** Lines that begin a new chapter/section block and must never be glued onto a row. */
const BLOCK_START_RE = /^(CAPÍTULO|SECCIÓN|SECCION|Notas?\b|TÍTULO|SUBCAPÍTULO)/i;

interface Item {
  str: string;
  x: number;
  y: number;
}

interface Line {
  y: number;
  items: Item[];
}

interface Anchors {
  code: number;
  desc: number;
  aec: number;
  exAec: number;
  imp: number;
  exp: number;
  unidad: number;
}

/** Fallback geometry (chapter 1-97 tables, verified against Decreto 4.944). */
const DEFAULT_ANCHORS: Anchors = {
  code: 98,
  desc: 150,
  aec: 406,
  exAec: 441,
  imp: 478,
  exp: 528,
  unidad: 576,
};

export interface ArancelRow {
  /** Dotted code exactly as printed, e.g. "2106.90.30.12". */
  code: string;
  /** Digits only, e.g. "2106903012". */
  digits: string;
  /**
   * Number of digits in the code (4..10). Venezuelan codes nest a variable number of
   * "guiones" levels, so a code can be 5 digits ("0101.2") as well as 6 ("2106.90").
   * Only 10 digits are leaves of the national nomenclature.
   */
  digitCount: number;
  /** Number of leading guiones ("-") in the printed description — the true depth. */
  guiones: number;
  description: string;
  /** Ancestor rows present in the document, outermost first. */
  path: Array<{ code: string; description: string }>;
  /** Column (3): AEC ad valorem, raw. */
  aec: string | null;
  /** Column (4): Ex.AEC, raw. */
  exAec: string | null;
  /**
   * Columns (5)/(6): régimen legal, raw then parsed. Article 21 of the decree codifies
   * 21 régimes (1-21); the printed cell is a comma-separated list, e.g. "5,12" = régimes
   * 5 and 12. Keep the raw string so nothing is lost if the separator ever changes.
   */
  importacionRaw: string | null;
  exportacionRaw: string | null;
  regimenImportacion: number[];
  regimenExportacion: number[];
  /** Column (7): unit of measure. */
  unidad: string | null;
  page: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const digitsOf = (code: string) => code.replace(/\./g, '');

/** "5,12" -> [5, 12]; "3" -> [3]; null -> []. */
function parseRegimenList(raw: string | null): number[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((part) => Number.parseInt(part.trim(), 10))
    .filter((n) => Number.isInteger(n));
}

function cleanDescription(parts: string[]): string {
  return parts
    .join(' ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:])/g, '$1')
    .trim();
}

/** Group raw text items into visual lines (same y, sorted by x). */
function toLines(items: Item[]): Line[] {
  const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
  const lines: Line[] = [];
  for (const item of sorted) {
    const last = lines[lines.length - 1];
    if (last && Math.abs(last.y - item.y) <= 2.5) last.items.push(item);
    else lines.push({ y: item.y, items: [item] });
  }
  for (const line of lines) line.items.sort((a, b) => a.x - b.x);
  return lines;
}

/**
 * Recover the column geometry of a table page by locating the first occurrence of each
 * header label. Falls back to the previous page (a table spans pages) and finally to
 * DEFAULT_ANCHORS.
 */
function findAnchors(lines: Line[], fallback: Anchors): Anchors {
  const found: Partial<Record<keyof Anchors, number>> = {};
  const labels: Record<string, keyof Anchors> = {
    Código: 'code',
    Descripción: 'desc',
    AEC: 'aec',
    'Ex.AEC': 'exAec',
    Importación: 'imp',
    Exportación: 'exp',
    Física: 'unidad',
    Unidad: 'unidad',
  };
  for (const line of lines) {
    for (const item of line.items) {
      const key = labels[item.str.trim()];
      if (key && found[key] === undefined) found[key] = item.x;
    }
  }
  if (found.aec === undefined || found.exAec === undefined) return fallback;
  return { ...fallback, ...found } as Anchors;
}

/** Column boundaries derived from the anchors of the page. */
function boundaries(a: Anchors) {
  return {
    codeDesc: (a.code + a.desc) / 2,
    descAec: a.aec - 4,
    aecEx: (a.aec + a.exAec) / 2,
    exImp: (a.exAec + a.imp) / 2,
    impExp: (a.imp + a.exp) / 2,
    expUni: (a.exp + a.unidad) / 2,
  };
}

// ---------------------------------------------------------------------------
// Core extraction
// ---------------------------------------------------------------------------
async function extractRows(pdfPath: string): Promise<{ rows: ArancelRow[]; pages: number }> {
  const doc = await getDocument({
    data: new Uint8Array(fs.readFileSync(pdfPath)),
    useSystemFonts: false,
  }).promise;

  const rows: ArancelRow[] = [];
  let anchors = DEFAULT_ANCHORS;

  for (let pageNo = 1; pageNo <= doc.numPages; pageNo++) {
    const page = await doc.getPage(pageNo);
    const content = await page.getTextContent();
    const items: Item[] = [];
    for (const raw of content.items as any[]) {
      if (typeof raw?.str !== 'string' || raw.str.trim() === '') continue;
      items.push({ str: raw.str, x: raw.transform[4], y: raw.transform[5] });
    }

    const lines = toLines(items);
    anchors = findAnchors(lines, anchors);
    const b = boundaries(anchors);

    let current: ArancelRow | null = null;

    for (const line of lines) {
      const text = line.items.map((i) => i.str).join(' ');
      if (HEADER_TOKENS.some((t) => text.includes(t))) continue;

      // Column (1): a tariff code, always left of the description column.
      const codeItem = line.items.find((i) => i.x < b.codeDesc && CODE_RE.test(i.str.trim()));

      if (codeItem) {
        const code = codeItem.str.trim();
        const digits = digitsOf(code);
        current = {
          code,
          digits,
          digitCount: digits.length,
          guiones: 0,
          description: '',
          path: [],
          aec: null,
          exAec: null,
          importacionRaw: null,
          exportacionRaw: null,
          regimenImportacion: [],
          regimenExportacion: [],
          unidad: null,
          page: pageNo,
        };
        rows.push(current);
      }

      const dashItems = line.items.filter((i) => i.str.trim() === '-');
      const descItems = line.items.filter(
        (i) => i.x >= b.codeDesc && i.x < b.descAec && i.str.trim() !== '-',
      );

      if (descItems.length > 0) {
        const descText = cleanDescription(descItems.map((i) => i.str));
        if (BLOCK_START_RE.test(descText)) {
          current = null;
        } else if (current) {
          if (current.guiones === 0 && dashItems.length > 0) current.guiones = dashItems.length;
          current.description = current.description
            ? `${current.description} ${descText}`.replace(/\s+/g, ' ').trim()
            : descText;
        }
      }

      if (!current) continue;
      for (const item of line.items) {
        const value = item.str.trim();
        const x = item.x;
        if (x < b.descAec) continue;
        if (x < b.aecEx && current.aec === null) current.aec = value;
        else if (x < b.exImp && current.exAec === null) current.exAec = value;
        else if (x < b.impExp && current.importacionRaw === null) current.importacionRaw = value;
        else if (x < b.expUni && current.exportacionRaw === null) current.exportacionRaw = value;
        else if (current.unidad === null) current.unidad = value;
      }
    }
  }

  return { rows, pages: doc.numPages };
}

// ---------------------------------------------------------------------------
// Hierarchy annotation
// ---------------------------------------------------------------------------
function annotatePaths(rows: ArancelRow[]): void {
  const byDigits = new Map<string, ArancelRow>();
  for (const row of rows) if (!byDigits.has(row.digits)) byDigits.set(row.digits, row);

  for (const row of rows) {
    const path: Array<{ code: string; description: string }> = [];
    const digits = row.digits;
    for (let len = 2; len < digits.length; len++) {
      const ancestor = byDigits.get(digits.slice(0, len));
      if (ancestor) path.push({ code: ancestor.code, description: ancestor.description });
    }
    row.path = path;
  }
}

// ---------------------------------------------------------------------------
// Baseline comparison
// ---------------------------------------------------------------------------
function readBaseline(portableDir: string): Set<string> {
  const codes = new Set<string>();
  for (const file of fs.readdirSync(portableDir)) {
    if (!file.startsWith('cap-') || !file.endsWith('.json')) continue;
    const data = JSON.parse(fs.readFileSync(path.join(portableDir, file), 'utf8'));
    for (const product of data.products ?? []) {
      for (const tariff of product.tariffs ?? []) codes.add(digitsOf(String(tariff.code)));
    }
  }
  return codes;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const [pdfPath, outPath, baselineDir] = process.argv.slice(2);
  if (!pdfPath || !outPath) {
    console.error('usage: tsx extract_arancel_pdf.ts <pdf> <out.json> [baselinePortableDir]');
    process.exit(1);
  }

  console.error(`reading ${pdfPath} ...`);
  const { rows, pages } = await extractRows(pdfPath);
  for (const row of rows) {
    row.regimenImportacion = parseRegimenList(row.importacionRaw);
    row.regimenExportacion = parseRegimenList(row.exportacionRaw);
  }
  annotatePaths(rows);

  const leaves = rows.filter((r) => r.digitCount === 10);
  const leafCodes = new Set(leaves.map((r) => r.digits));
  const duplicates = new Map<string, number>();
  for (const row of rows) duplicates.set(row.digits, (duplicates.get(row.digits) ?? 0) + 1);
  const repeated = [...duplicates.entries()].filter(([, n]) => n > 1).map(([c]) => c);
  const orphans = leaves.filter((r) => r.path.length === 0);

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(
    outPath,
    JSON.stringify(
      {
        schemaVersion: 've-arancel-rows-1.0',
        instrument: 'Decreto N° 4.944',
        gazette: 'Gaceta Oficial Extraordinaria N° 6.804',
        instrumentDate: '2024-04-24',
        publishedDate: '2024-04-25',
        country: 'VE',
        sourceFile: path.relative(process.cwd(), pdfPath),
        sourcePages: pages,
        generatedAt: new Date().toISOString(),
        counts: {
          rows: rows.length,
          leaves: leaves.length,
          distinctLeafCodes: leafCodes.size,
          repeatedCodes: repeated.length,
          leafRowsWithoutParent: orphans.length,
        },
        rows,
      },
      null,
      0,
    ),
  );

  console.log(`pages            : ${pages}`);
  console.log(`rows             : ${rows.length}`);
  const byDigits = new Map<number, number>();
  for (const row of rows) byDigits.set(row.digitCount, (byDigits.get(row.digitCount) ?? 0) + 1);
  console.log(
    `  by code length : ${[...byDigits.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([n, c]) => `${n}:${c}`)
      .join('  ')}`,
  );
  console.log(`10-digit leaves  : ${leaves.length} (distinct ${leafCodes.size})`);
  console.log(`repeated codes   : ${repeated.length}  ${repeated.slice(0, 6).join(' ')}`);
  console.log(`orphan leaves    : ${orphans.length}`);
  console.log(`written          : ${outPath}`);

  // Column sanity: the unit column must never hold ad valorem values.
  const unitValues = new Map<string, number>();
  for (const r of leaves) {
    // A row can carry no unit (the cell is empty in the decree).
    const unit = r.unidad ?? '(none)';
    unitValues.set(unit, (unitValues.get(unit) ?? 0) + 1);
  }
  console.log(
    `unit values      : ${[...unitValues.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([u, n]) => `${u}:${n}`)
      .join('  ')}`,
  );

  // Régimen legal sanity: article 21 codifies régimes 1..21.
  const badRegimen = new Set<number>();
  const regimenUse = new Map<number, number>();
  for (const r of leaves) {
    for (const n of r.regimenImportacion) {
      if (n < 1 || n > 21) badRegimen.add(n);
      regimenUse.set(n, (regimenUse.get(n) ?? 0) + 1);
    }
  }
  console.log(
    `regimen 1..21    : used ${[...regimenUse.keys()].sort((a, b) => a - b).join(',')}` +
      (badRegimen.size ? `  OUT OF RANGE: ${[...badRegimen].join(',')}` : ''),
  );

  // Spot checks that motivated this work.
  for (const code of [
    '2106.90.30.12',
    '2106.90.30.42',
    '2106.90.90.10',
    '3004.90.69.10',
    '2106.90.70',
    '3004.20.59.12',
    '1601.00.00.00',
    '0909.21.00.00',
  ]) {
    const found = rows.find((r) => r.digits === digitsOf(code));
    console.log(`  ${code.padEnd(14)} ${found ? `OK  "${found.description.slice(0, 60)}"` : 'ABSENT'}`);
  }

  if (baselineDir) {
    const baseline = readBaseline(baselineDir);
    const missing = [...leafCodes].filter((c) => !baseline.has(c));
    const fabricated = [...baseline].filter((c) => !leafCodes.has(c));
    console.log(`\nbaseline (${baseline.size}) vs extraction (${leafCodes.size}):`);
    console.log(`  in decree, absent from baseline : ${missing.length}`);
    console.log(`  in baseline, absent from decree : ${fabricated.length}`);
    fs.writeFileSync(
      outPath.replace(/\.json$/, '.diff.json'),
      JSON.stringify({ missingFromBaseline: missing, absentFromDecree: fabricated }, null, 2),
    );
    console.log(`  diff written                    : ${outPath.replace(/\.json$/, '.diff.json')}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
