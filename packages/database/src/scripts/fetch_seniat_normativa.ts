/**
 * Download the SENIAT legal instruments the classification pipeline actually
 * needs, from the official "SENIAT en Línea — Normativa Legal" portal.
 *
 *   npx tsx src/scripts/fetch_seniat_normativa.ts [--dry-run] [--out DIR]
 *                                                [--only ID[,ID]] [--tier N]
 *                                                [--refresh] [--manifest FILE]
 *
 * What it does
 * ------------
 * 1. Reads the curated manifest (`docs/laws/ve/_seniat-normativa.json` by
 *    default). The manifest is the source of truth for *what* is needed and
 *    *why* — the portal is the source of truth for *where the file is*.
 * 2. Scrapes the 7 category pages and builds an index of
 *    gazette number -> (title, pdf url).
 * 3. Resolves each manifest entry by gazette number, optionally narrowed by a
 *    `titleContains` fragment, because one gazette can carry several documents
 *    and the same document can live under several upload paths.
 * 4. Downloads the PDFs, politely and resumably, and writes a provenance
 *    record (resolved url, sha256, bytes, content-type) per file.
 *
 * Why it does not simply save the 407 PDFs the portal links
 * ----------------------------------------------------------
 * Most of them are bilateral treaties, zone regimes, administrative
 * providencias and income-tax rules — none of which change how a product is
 * classified. The manifest keeps 31 instruments and records, in
 * `notOnPortal`, the 5 that the portal does not have (notably the current
 * consolidated arancel and the 2026 reform), so the gap is visible instead of
 * silent.
 *
 * Output
 * ------
 * PDFs land in `.data/seniat-normativa/` by default (gitignored — these are
 * 20–50 MB of full gazettes). The provenance manifest is written next to the
 * curated list in `docs/laws/ve/` and IS committed, so the bytes stay out of
 * git while the record of what was fetched stays in it.
 *
 * Nothing is written to the database. Ingestion into
 * `LegalKnowledgeParent` / `LegalKnowledgeChunk` is a separate step, because
 * the arancel instruments need their Section/Chapter Notes extracted first
 * (see `extract_arancel_pdf.ts`, which already recognises the notes blocks).
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';

const PORTAL = 'https://seniatenlinea.seniat.gob.ve';
const UA = 'tariffos-legal-corpus/1.0 (+https://github.com/tariffos)';
/** One request per second is far below anything that would look like load. */
const DELAY_MS = 1000;
const MAX_RETRIES = 3;
const TIMEOUT_MS = 60_000;

interface Category {
  slug: string;
  label: string;
}

interface Instrument {
  id: string;
  tier: number;
  legalType: string;
  gazette?: string;
  titleContains?: string;
  url?: string;
  title: string;
  why: string;
  sameDocumentAs?: string;
}

interface Manifest {
  country: string;
  source: string;
  sourceUrl: string;
  categories: Category[];
  instruments: Instrument[];
  notOnPortal: Array<{ id: string; title: string; why: string; howToGet: string }>;
}

interface CatalogEntry {
  gazette: string;
  title: string;
  url: string;
  category: string;
}

interface Argv {
  dryRun: boolean;
  out: string;
  only: string[] | null;
  tiers: number[] | null;
  refresh: boolean;
  manifestPath: string;
  all: boolean;
}

function parseArgs(argv: string[]): Argv {
  const get = (flag: string): string | undefined => {
    const i = argv.indexOf(flag);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const tiers = get('--tier');
  return {
    dryRun: argv.includes('--dry-run'),
    out: get('--out') ?? path.resolve(process.cwd(), '../../.data/seniat-normativa'),
    only: get('--only')?.split(',').map((s) => s.trim()).filter(Boolean) ?? null,
    tiers: tiers ? tiers.split(',').map((s) => Number(s.trim())).filter((n) => Number.isFinite(n)) : null,
    refresh: argv.includes('--refresh'),
    manifestPath: get('--manifest') ?? path.resolve(process.cwd(), '../../docs/laws/ve/_seniat-normativa.json'),
    all: argv.includes('--all'),
  };
}

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

async function fetchWithRetry(url: string, accept: string): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: accept }, signal: controller.signal });
      if (res.status === 429 || res.status >= 500) {
        lastError = new Error(`HTTP ${res.status} ${res.statusText}`);
        await sleep(2000 * 2 ** attempt);
        continue;
      }
      return res;
    } catch (err) {
      lastError = err;
      await sleep(2000 * 2 ** attempt);
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

/** "Gaceta Oficial N° 6.507 Extra." -> "6.507" (the numeric part is the key). */
function gazetteKey(raw: string): string {
  const m = raw.match(/([0-9][0-9.,]*)/);
  return m ? m[1].replace(/[.,]/g, '') : '';
}

/**
 * The portal's anchor text is "Gaceta Oficial N° <num> <description>", sometimes
 * with a country prefix ("Colombia Gaceta Oficial N° 40.359 ..."). Take the
 * number that follows "Gaceta Oficial N°" and treat the rest as the title.
 */
function parseAnchor(text: string): { gazette: string; title: string } | null {
  const clean = text.replace(/\s+/g, ' ').trim();
  const m = clean.match(/Gaceta Oficial\s+N[°ºo]\s*([0-9][0-9.,]*)\s*(Extra\.\s*)?(.*)$/i);
  if (!m) return null;
  return {
    gazette: m[1].replace(/[.,]/g, ''),
    title: clean.replace(/^.*?Gaceta Oficial\s+N[°ºo]\s*[0-9][0-9.,]*\s*(Extra\.\s*)?/i, '').trim(),
  };
}

async function buildCatalog(categories: Category[]): Promise<CatalogEntry[]> {
  const catalog: CatalogEntry[] = [];
  const seen = new Set<string>();
  for (const cat of categories) {
    const res = await fetchWithRetry(`${PORTAL}/${cat.slug}/`, 'text/html');
    const html = await res.text();
    const anchors = html.matchAll(
      /href="(\/wp-content\/uploads\/[^"]+\.pdf)"[^>]*>([\s\S]*?)<\/a>/gi,
    );
    for (const m of anchors) {
      const href = m[1];
      const text = m[2].replace(/<[^>]+>/g, ' ');
      const parsed = parseAnchor(text);
      if (!parsed) continue;
      const key = `${parsed.gazette}::${href}`;
      if (seen.has(key)) continue;
      seen.add(key);
      catalog.push({ gazette: parsed.gazette, title: parsed.title, url: PORTAL + href, category: cat.slug });
    }
    console.log(`  [catalog] ${cat.slug}: ${catalog.length} entries so far`);
    await sleep(DELAY_MS);
  }
  return catalog;
}

/**
 * Resolve one manifest entry to a catalogue URL.
 * Same gazette can carry several documents (GO 39.558 appears twice), so
 * `titleContains` disambiguates. `sameDocumentAs` points at a twin entry
 * that is literally the same PDF.
 */
function resolve(
  inst: Instrument,
  catalog: CatalogEntry[],
  byId: Map<string, Instrument>,
): { url: string; title: string } | { error: string } {
  if (inst.url) {
    const match = catalog.find((c) => c.url.endsWith(inst.url!));
    return { url: match?.url ?? PORTAL + inst.url, title: inst.title };
  }
  if (inst.sameDocumentAs) {
    const twin = byId.get(inst.sameDocumentAs);
    if (!twin) return { error: `sameDocumentAs target "${inst.sameDocumentAs}" is not in the manifest` };
    const resolved = resolve(twin, catalog, byId);
    if ('error' in resolved) return resolved;
    return { url: resolved.url, title: inst.title };
  }
  if (!inst.gazette) return { error: 'no gazette number and no url in the manifest' };

  // Read through a local: the check above narrows `inst.gazette` for the
  // rest of the function, but the narrowing does not survive into the
  // callback below.
  const gazette = inst.gazette;
  const candidates = catalog.filter((c) => c.gazette === gazette.replace(/[.,]/g, ''));
  if (candidates.length === 0) return { error: `gazette ${inst.gazette} is not on the portal` };
  if (candidates.length === 1) return { url: candidates[0].url, title: inst.title };

  if (inst.titleContains) {
    const needle = inst.titleContains.toLowerCase();
    const hit = candidates.find((c) => c.title.toLowerCase().includes(needle));
    if (hit) return { url: hit.url, title: inst.title };
    return {
      error: `gazette ${inst.gazette} has ${candidates.length} documents and none matches "${inst.titleContains}"`,
    };
  }
  return {
    error: `gazette ${inst.gazette} has ${candidates.length} documents and the manifest does not say which (add titleContains)`,
  };
}

function safeName(id: string): string {
  return `${id}.pdf`;
}

async function download(url: string, dest: string, refresh: boolean): Promise<{ sha256: string; bytes: number }> {
  if (!refresh && fs.existsSync(dest)) {
    const buf = fs.readFileSync(dest);
    return { sha256: crypto.createHash('sha256').update(buf).digest('hex'), bytes: buf.length };
  }
  const res = await fetchWithRetry(url, 'application/pdf');
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1000) throw new Error(`suspiciously small (${buf.length} bytes) — not a PDF`);
  if (!buf.subarray(0, 5).toString('latin1').startsWith('%PDF')) {
    throw new Error('response is not a PDF (no %PDF magic) — the portal may be serving an error page');
  }
  fs.writeFileSync(dest, buf);
  return { sha256: crypto.createHash('sha256').update(buf).digest('hex'), bytes: buf.length };
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const manifest = JSON.parse(fs.readFileSync(args.manifestPath, 'utf8')) as Manifest;
  const byId = new Map(manifest.instruments.map((i) => [i.id, i]));

  const wanted = manifest.instruments.filter((i) => {
    if (args.only && !args.only.includes(i.id)) return false;
    if (args.tiers && !args.tiers.includes(i.tier)) return false;
    return true;
  });

  console.log(`[seniat-normativa] manifest: ${args.manifestPath}`);
  console.log(`[seniat-normativa] ${wanted.length} of ${manifest.instruments.length} instruments selected`);
  if (args.dryRun) console.log('[seniat-normativa] DRY RUN — no downloads');

  console.log('[seniat-normativa] building the catalogue from the portal…');
  const catalog = await buildCatalog(manifest.categories);
  console.log(`[seniat-normativa] catalogue: ${catalog.length} documents across ${manifest.categories.length} category pages`);

  // `--all` pulls every document the portal links, not just the curated set.
  // The curated entries keep their tier and `why`; the rest are recorded as
  // tier 0 "portal extra" so nothing is downloaded invisibly.
  const extras: Instrument[] = [];
  if (args.all) {
    const claimed = new Set<string>();
    for (const inst of wanted) {
      const r = resolve(inst, catalog, new Map(manifest.instruments.map((i) => [i.id, i])));
      if (!('error' in r)) claimed.add(r.url);
    }
    for (const entry of catalog) {
      if (claimed.has(entry.url)) continue;
      extras.push({
        id: `extra-${entry.url.split('/').pop()!.replace(/\.[a-z]+$/i, '').replace(/[^A-Za-z0-9._-]+/g, '-').slice(0, 60)}`,
        tier: 0,
        legalType: 'LEGAL_NOTE',
        gazette: entry.gazette,
        url: entry.url,
        title: `${entry.gazette} — ${entry.title.slice(0, 180)}`,
        why: `Portal document not in the curated list (category: ${entry.category}). Kept because --all was requested.`,
      });
    }
    console.log(`[seniat-normativa] --all: ${extras.length} additional portal documents to fetch`);
  }

  fs.mkdirSync(args.out, { recursive: true });
  const provenance: Array<Record<string, unknown>> = [];
  const problems: string[] = [];

  for (const inst of [...wanted, ...extras]) {
    const resolved = resolve(inst, catalog, byId);
    if ('error' in resolved) {
      problems.push(`${inst.id}: ${resolved.error}`);
      console.log(`  ✗ ${inst.id} — ${resolved.error}`);
      continue;
    }
    const dest = path.join(args.out, safeName(inst.id));
    if (args.dryRun) {
      console.log(`  → ${inst.id} [tier ${inst.tier}] ${resolved.url}`);
      provenance.push({ id: inst.id, tier: inst.tier, legalType: inst.legalType, url: resolved.url, status: 'would-download' });
      continue;
    }
    try {
      const { sha256, bytes } = await download(resolved.url, dest, args.refresh);
      console.log(`  ✓ ${inst.id} [tier ${inst.tier}] ${(bytes / 1024 / 1024).toFixed(2)} MB  ${sha256.slice(0, 12)}`);
      provenance.push({
        id: inst.id,
        tier: inst.tier,
        legalType: inst.legalType,
        gazette: inst.gazette ?? null,
        title: inst.title,
        why: inst.why,
        url: resolved.url,
        file: path.relative(path.resolve(process.cwd(), '../..'), dest),
        sha256,
        bytes,
        downloadedAt: new Date().toISOString(),
        status: 'ok',
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      problems.push(`${inst.id}: ${msg}`);
      console.log(`  ✗ ${inst.id} — ${msg}`);
      provenance.push({ id: inst.id, tier: inst.tier, legalType: inst.legalType, url: resolved.url, status: 'failed', error: msg });
    }
    await sleep(DELAY_MS);
  }

  const outPath = path.resolve(
    path.dirname(args.manifestPath),
    'seniat-normativa.provenance.json',
  );

  // A flat, human-readable index of every URL the portal exposes for these
  // documents — so the list of "where things are" is in the repo, not only
  // derivable by re-scraping.
  const indexPath = path.resolve(path.dirname(args.manifestPath), 'seniat-normativa.urls.txt');
  const indexLines = [
    '# SENIAT en Línea — Normativa Legal: document URLs',
    `# source: ${manifest.sourceUrl}`,
    `# catalogue: ${catalog.length} documents across ${manifest.categories.length} category pages`,
    '# columns: <local file> | <gazette> | <url> | <title>',
    '',
  ];
  for (const f of provenance) {
    if (f.status !== 'ok' && f.status !== 'would-download') continue;
    indexLines.push(
      `${String(f.file ?? `${f.id}.pdf`)} | ${String(f.gazette ?? '')} | ${String(f.url ?? '')} | ${String(f.title ?? f.id)}`,
    );
  }
  if (!args.dryRun) {
    fs.writeFileSync(indexPath, indexLines.join('\n') + '\n');
    console.log(`[seniat-normativa] url index → ${indexPath}`);
  }

  const report = {
    country: manifest.country,
    source: manifest.source,
    sourceUrl: manifest.sourceUrl,
    generatedAt: new Date().toISOString(),
    outputDir: path.relative(path.resolve(process.cwd(), '../..'), args.out),
    catalogueSize: catalog.length,
    requested: wanted.length,
    ok: provenance.filter((p) => p.status === 'ok').length,
    failed: provenance.filter((p) => p.status === 'failed').length,
    unresolved: problems.length,
    files: provenance,
    notOnPortal: manifest.notOnPortal,
  };
  if (!args.dryRun) {
    fs.writeFileSync(outPath, JSON.stringify(report, null, 2) + '\n');
    console.log(`[seniat-normativa] provenance → ${outPath}`);
  }

  console.log(
    `[seniat-normativa] ${report.ok} ok · ${report.failed} failed · ${report.unresolved} unresolved` +
      ` · ${manifest.notOnPortal.length} instruments the portal does not have (see notOnPortal in the manifest)`,
  );
  if (problems.length) {
    console.log('[seniat-normativa] problems:');
    for (const p of problems) console.log(`   - ${p}`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('[seniat-normativa] failed:', err);
  process.exit(1);
});
