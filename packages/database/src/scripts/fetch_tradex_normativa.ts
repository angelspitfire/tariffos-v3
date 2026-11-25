/**
 * Download the Venezuelan customs-law corpus from Tradex's public normative
 * index (tradex.com.ve), which is where the arancel reform series lives.
 *
 *   npx tsx src/scripts/fetch_tradex_normativa.ts [--dry-run] [--out DIR]
 *                                              [--section <slug>] [--refresh]
 *
 * Why a second source
 * -------------------
 * SENIAT's portal carries the tax law and the treaties, but **not the arancel
 * reform series** — the eleven reforms between Decreto 4.944 (April 2024) and
 * Resolución 007-2026 (August 2026), including Decreto 5.198, which the
 * repo's `docs/laws/ve/_sources.json` still carries as a placeholder.
 *
 * Tradex publishes the arancel as its base decree plus one PDF per reform.
 * There is no published consolidated document: the consolidated view is a
 * *derived* artifact, and the primary sources are both more current and
 * attributable.
 *
 * Sections
 * --------
 *   normativa-arancelaria  the arancel, its 11 reforms, exoneration decrees
 *   normativa-aduanera     the LOA, the COT, general customs regulations
 *   valoracion-aduanera    customs valuation (GATT Art. VII, ALADI, MERCOSUR)
 *   regimenes-especiales  free zones and special customs regimes
 *
 * Each PDF is validated as a real PDF and hashed, and the provenance record
 * keeps the source URL so a citation can point at the exact document.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { createHash } from 'node:crypto';

const SITE = 'https://www.tradex.com.ve';
const UA = 'tariffos-legal-corpus/1.0 (+https://github.com/tariffos)';
const DELAY_MS = 700;
const MAX_RETRIES = 3;
const TIMEOUT_MS = 120_000;

const SECTIONS = [
  { slug: 'normativa-arancelaria', label: 'Normativa Arancelaria / Exoneración de Gravámenes' },
  { slug: 'normativa-aduanera', label: 'Normativa Aduanera General' },
  { slug: 'valoracion-aduanera', label: 'Normativa sobre Valoración Aduanera' },
  { slug: 'regimenes-especiales', label: 'Regímenes Aduaneros y Zonas Económicas Especiales' },
];

interface Found {
  section: string;
  title: string;
  url: string;
  file: string;
}

function parseArgs(argv: string[]): { dryRun: boolean; out: string; section: string | null; refresh: boolean } {
  const get = (flag: string): string | undefined => {
    const i = argv.indexOf(flag);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  return {
    dryRun: argv.includes('--dry-run'),
    out: get('--out') ?? path.resolve(process.cwd(), '../../.data/tradex-normativa'),
    section: get('--section') ?? null,
    refresh: argv.includes('--refresh'),
  };
}

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

async function fetchText(url: string): Promise<string> {
  let lastError: unknown;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: controller.signal });
      if (res.status >= 500) {
        lastError = new Error(`HTTP ${res.status}`);
        await sleep(1500 * 2 ** attempt);
        continue;
      }
      return await res.text();
    } catch (err) {
      lastError = err;
      await sleep(1500 * 2 ** attempt);
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

async function fetchBinary(url: string): Promise<Buffer> {
  let lastError: unknown;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (err) {
      lastError = err;
      await sleep(1500 * 2 ** attempt);
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

/** Pull every PDF link and its anchor text out of a section page. */
async function listSection(section: string): Promise<Found[]> {
  const html = await fetchText(`${SITE}/${section}/`);
  const out: Found[] = [];
  const seen = new Set<string>();
  for (const m of html.matchAll(/href="([^"]+\.pdf)"[^>]*>([\s\S]*?)<\/a>/gi)) {
    const href = m[1];
    const url = href.startsWith('http') ? href : SITE + href;
    if (seen.has(url)) continue;
    seen.add(url);
    const text = m[2]
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    // Tradex renders a "Descargar PDF" link next to the real title; keep the
    // first non-generic anchor text for the document, else fall back to the
    // file name.
    const title = text && !/^descargar\s+pdf$/i.test(text) ? text : path.basename(new URL(url).pathname);
    out.push({ section, title, url, file: path.basename(new URL(url).pathname) });
  }
  return out;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const sections = args.section ? SECTIONS.filter((s) => s.slug === args.section) : SECTIONS;
  if (sections.length === 0) {
    console.error(`[tradex] unknown section "${args.section}"`);
    process.exit(1);
  }

  console.log(`[tradex] source: ${SITE}`);
  const found: Found[] = [];
  for (const s of sections) {
    const items = await listSection(s.slug);
    console.log(`  [tradex] ${s.slug}: ${items.length} PDFs`);
    found.push(...items);
    await sleep(DELAY_MS);
  }
  console.log(`[tradex] ${found.length} documents found`);
  if (args.dryRun) {
    for (const f of found) console.log(`  → ${f.section}/${f.file}  ${f.title.slice(0, 70)}`);
    return;
  }

  fs.mkdirSync(args.out, { recursive: true });
  const provenance: Array<Record<string, unknown>> = [];
  let ok = 0;
  let skipped = 0;
  let failed = 0;

  for (const f of found) {
    const dest = path.join(args.out, f.file);
    try {
      let buf: Buffer;
      if (!args.refresh && fs.existsSync(dest)) {
        buf = fs.readFileSync(dest);
        skipped++;
      } else {
        buf = await fetchBinary(f.url);
        if (buf.length < 1000) throw new Error(`suspiciously small (${buf.length} bytes)`);
        if (!buf.subarray(0, 5).toString('latin1').startsWith('%PDF')) {
          throw new Error('not a PDF (no %PDF magic)');
        }
        fs.writeFileSync(dest, buf);
        ok++;
      }
      provenance.push({
        section: f.section,
        file: f.file,
        title: f.title,
        url: f.url,
        bytes: buf.length,
        sha256: createHash('sha256').update(buf).digest('hex'),
        downloadedAt: new Date().toISOString(),
        status: 'ok',
      });
    } catch (err) {
      failed++;
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`  ✗ ${f.file} — ${msg}`);
      provenance.push({ section: f.section, file: f.file, title: f.title, url: f.url, status: 'failed', error: msg });
    }
    await sleep(DELAY_MS);
  }

  const outPath = path.resolve(process.cwd(), '../../docs/laws/ve/tradex-normativa.provenance.json');
  fs.writeFileSync(
    outPath,
    JSON.stringify(
      {
        source: 'Tradex — Normativa Aduanera',
        sourceUrl: SITE,
        generatedAt: new Date().toISOString(),
        outputDir: path.relative(path.resolve(process.cwd(), '../..'), args.out),
        found: found.length,
        ok,
        skipped,
        failed,
        files: provenance,
      },
      null,
      2,
    ) + '\n',
  );
  console.log(`[tradex] ${ok} downloaded · ${skipped} already present · ${failed} failed`);
  console.log(`[tradex] provenance → ${outPath}`);
  if (failed) process.exitCode = 1;
}

main().catch((err) => {
  console.error('[tradex] failed:', err);
  process.exit(1);
});
