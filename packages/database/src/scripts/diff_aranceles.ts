/**
 * Compare two Venezuelan arancel PDFs and report exactly what changed.
 *
 *   npx tsx src/scripts/diff_aranceles.ts <old.pdf> <new.pdf> [--out report.json]
 *                                             [--label-old "Decreto 4.944"] [--label-new "Consolidado 2026"]
 *
 * Why this exists
 * ---------------
 * The arancel is re-issued as a consolidated decree that supersedes the
 * individual gazettes (Decreto 2.647/2016 + Decreto 4.111 + 4.684 + 4.734 +
 * 4.944/2024 + 5.198/2026 …). Both matter: the consolidated document is the
 * working text, the gazettes are the provenance of what was in force when.
 *
 * The question this answers is the one a client actually asks — "my code
 * changed, why?" — and it is also the only way to verify the reported
 * "~1,371 subpartidas" modified by the 2026 reform, instead of taking it on
 * faith.
 *
 * Both PDFs are parsed by `extract_arancel_pdf.ts`, the deterministic
 * extractor (no API, no model). This script shells out to it and compares the
 * two row sets.
 *
 * What is reported
 *               - codes added and removed, at every digit length
 *               - ad-valorem, IVA, régimen legal and unit changes
 *               - description changes on a code that survived
 *               - a per-chapter breakdown, so "which chapters moved" is one read
 */
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { execFileSync } from 'node:child_process';

interface Row {
  code: string;
  digits: string;
  digitCount: number;
  description: string;
  aec: string | null;
  iva: string | null;
  exAec: string | null;
  importacionRaw: string | null;
  exportacionRaw: string | null;
  unidad: string | null;
  regimenImportacion: number[];
  regimenExportacion: number[];
}

interface Extract {
  counts: Record<string, number>;
  rows: Row[];
}

function extract(pdf: string, tag: string): Extract {
  const out = path.join(os.tmpdir(), `arancel-${tag}-${process.pid}.json`);
  const script = path.resolve(process.cwd(), 'src/scripts/extract_arancel_pdf.ts');
  console.log(`[diff] extracting ${path.basename(pdf)} …`);
  execFileSync('npx', ['tsx', script, pdf, out], { stdio: ['ignore', 'pipe', 'inherit'] });
  const parsed = JSON.parse(fs.readFileSync(out, 'utf8')) as Extract;
  fs.unlinkSync(out);
  return parsed;
}

interface Change {
  code: string;
  digitCount: number;
  chapter: string;
  field: string;
  before: string | null;
  after: string | null;
}

function main(): void {
  const argv = process.argv.slice(2);
  const [oldPdf, newPdf] = argv.filter((a) => !a.startsWith('--') && argv[argv.indexOf(a) - 1]?.startsWith('--') !== true);
  const outArg = argv.indexOf('--out');
  const labelOld = argv.includes('--label-old') ? argv[argv.indexOf('--label-old') + 1] : path.basename(oldPdf ?? 'old');
  const labelNew = argv.includes('--label-new') ? argv[argv.indexOf('--label-new') + 1] : path.basename(newPdf ?? 'new');

  if (!oldPdf || !newPdf) {
    console.error('usage: tsx diff_aranceles.ts <old.pdf> <new.pdf> [--out report.json]');
    process.exit(1);
  }
  for (const p of [oldPdf, newPdf]) {
    if (!fs.existsSync(p)) {
      console.error(`[diff] not found: ${p}`);
      process.exit(1);
    }
  }

  const a = extract(oldPdf, 'old');
  const b = extract(newPdf, 'new');
  console.log(`[diff] ${labelOld}: ${a.counts.rows} rows (${a.counts.leaves} leaves)`);
  console.log(`[diff] ${labelNew}: ${b.counts.rows} rows (${b.counts.leaves} leaves)`);

  const mapA = new Map(a.rows.map((r) => [r.digits, r]));
  const mapB = new Map(b.rows.map((r) => [r.digits, r]));

  const added: Row[] = [];
  const removed: Row[] = [];
  const changes: Change[] = [];

  for (const [digits, row] of mapB) {
    if (!mapA.has(digits)) added.push(row);
  }
  for (const [digits, row] of mapA) {
    if (!mapB.has(digits)) removed.push(row);
  }

  const FIELDS: Array<[string, (r: Row) => string | null]> = [
    ['description', (r) => r.description],
    ['aec', (r) => r.aec],
    ['iva', (r) => r.iva],
    ['exAec', (r) => r.exAec],
    ['importacion', (r) => r.importacionRaw],
    ['exportacion', (r) => r.exportacionRaw],
    ['unidad', (r) => r.unidad],
    ['regimenImportacion', (r) => r.regimenImportacion.join(',') || null],
    ['regimenExportacion', (r) => r.regimenExportacion.join(',') || null],
  ];

  for (const [digits, before] of mapA) {
    const after = mapB.get(digits);
    if (!after) continue;
    for (const [field, get] of FIELDS) {
      const bv = get(before);
      const av = get(after);
      if ((bv ?? '') !== (av ?? '')) {
        changes.push({
          code: after.code,
          digitCount: after.digitCount,
          chapter: digits.slice(0, 4),
          field,
          before: bv,
          after: av,
        });
      }
    }
  }

  const byLen = (rows: Row[]): Record<string, number> => {
    const m: Record<string, number> = {};
    for (const r of rows) m[r.digitCount] = (m[r.digitCount] ?? 0) + 1;
    return m;
  };
  const byField: Record<string, number> = {};
  for (const c of changes) byField[c.field] = (byField[c.field] ?? 0) + 1;

  // Which chapters moved, and how much.
  const chapterMoves = new Map<string, { added: number; removed: number; changed: number }>();
  const touch = (ch: string, kind: 'added' | 'removed' | 'changed'): void => {
    const e = chapterMoves.get(ch) ?? { added: 0, removed: 0, changed: 0 };
    e[kind]++;
    chapterMoves.set(ch, e);
  };
  for (const r of added) touch(r.digits.slice(0, 4), 'added');
  for (const r of removed) touch(r.digits.slice(0, 4), 'removed');
  for (const c of changes) touch(c.chapter, 'changed');

  const leafChanges = changes.filter((c) => c.digitCount === 10);
  const changedLeafCodes = new Set(leafChanges.map((c) => c.code));

  console.log('\n=== summary ===');
  console.log(`codes added      : ${added.length}  ${JSON.stringify(byLen(added))}`);
  console.log(`codes removed    : ${removed.length}  ${JSON.stringify(byLen(removed))}`);
  console.log(`field changes    : ${changes.length}  ${JSON.stringify(byField)}`);
  console.log(`10-digit leaves touched: ${changedLeafCodes.size}`);

  const worst = [...chapterMoves.entries()]
    .map(([ch, v]) => ({ ch, total: v.added + v.removed + v.changed, ...v }))
    .sort((x, y) => y.total - x.total)
    .slice(0, 15);
  console.log('\nchapters with the most movement:');
  for (const w of worst) console.log(`  ${w.ch}  +${w.added} -${w.removed} ~${w.changed}`);

  if (changes.length) {
    console.log('\nfirst changes:');
    for (const c of changes.slice(0, 20)) {
      console.log(`  ${c.code} [${c.field}] ${String(c.before).slice(0, 40)} -> ${String(c.after).slice(0, 40)}`);
    }
  }

  if (outArg >= 0) {
    const outPath = path.resolve(argv[outArg + 1]);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(
      outPath,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          old: { label: labelOld, file: oldPdf, counts: a.counts },
          new: { label: labelNew, file: newPdf, counts: b.counts },
          added: added.map((r) => ({ code: r.code, digits: r.digits, digitCount: r.digitCount, description: r.description, aec: r.aec, iva: r.iva })),
          removed: removed.map((r) => ({ code: r.code, digits: r.digits, digitCount: r.digitCount, description: r.description, aec: r.aec, iva: r.iva })),
          changes,
          chapterMoves: Object.fromEntries(chapterMoves),
        },
        null,
        2,
      ) + '\n',
    );
    console.log(`\n[diff] report → ${outPath}`);
  }
}

main();
