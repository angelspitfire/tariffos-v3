/**
 * Fetch the NCM (Nomenclatura Común del Mercosur) 8-digit description table.
 *
 *   npx tsx src/scripts/fetch_ncm_table.ts [--es] [--out DIR] [--import]
 *
 * Why this matters
 * ----------------
 * Venezuela adopted the NCM by Decreto 2.647/2016 and extends it with two
 * national digits, so a VE 10-digit code's first 8 digits ARE an NCM code.
 * 28% of the live VE 10-digit leaves have no discriminative text of their own
 * ("Los demás" / "Las demás") — the NCM description is the wording that
 * actually distinguishes them:
 *
 *   NCM 24041200 (es) "Otros productos para inhalación sin humo que contienen nicotina"
 *   VE  2404120000    "Los demás, que contengan nicotina"
 *   NCM 87088000 (es) "Amortiguadores de suspensión p/tractores y vehíc.autom."
 *   VE  8708800090    "Los demás"
 *
 * Measured against the live arancel: 97.4% of the 11,829 leaves have an NCM
 * match, and 99.5% of the vacuous ones get real legal wording from it.
 *
 * Cost and clearance: one HTTP call, open data, no clearance needed. The
 * Spanish variant is served per code (the bulk list ignores `language`), so
 * `--es` walks 13,746 codes slowly; the Portuguese bulk is a single request.
 *
 * Output: `.data/ncm/` (gitignored) plus a provenance record, and with
 * `--import` the rows are upserted into `NationalTariff.ncmDescription`.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as dotenv from 'dotenv';

// Load every candidate env file (dotenv does not override an already-set var),
// so the coverage check finds DATABASE_URL wherever it lives.
for (const candidate of [
  'apps/filings/.env.local',
  '.env.local',
  'apps/agent/.env.local',
  'apps/web/.env.local',
  '.env',
]) {
  const file = path.join(process.cwd(), '../..', candidate);
  if (fs.existsSync(file)) dotenv.config({ path: file });
}

const API = 'https://api-comexstat.mdic.gov.br/tables/ncm';
const UA = 'tariffos-legal-corpus/1.0 (+https://github.com/tariffos)';
const DELAY_MS = 400;

interface NcmRow {
  id: string;
  text: string;
}

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

async function getJson(url: string): Promise<unknown> {
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
  return res.json();
}

/** The bulk endpoint ignores `language` and always returns Portuguese. */
async function fetchBulk(): Promise<NcmRow[]> {
  const body = (await getJson(`${API}?language=pt`)) as {
    data?: { list?: Array<{ coNcm?: string; noNCM?: string }> };
  };
  const list = body.data?.list ?? [];
  return list
    .filter((r) => r.coNcm && r.noNCM)
    .map((r) => ({ id: r.coNcm!, text: r.noNCM! }));
}

/** The per-code endpoint honours `language`, and only that one does. */
async function fetchOneEs(id: string): Promise<string | null> {
  try {
    const body = (await getJson(`${API}/${id}?language=es`)) as { data?: Array<{ text?: string }> };
    return body.data?.[0]?.text ?? null;
  } catch {
    return null;
  }
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const outDir = path.resolve(process.cwd(), '../../.data/ncm');
  const wantEs = argv.includes('--es');

  console.log('[ncm] fetching the NCM 8-digit table (1 request)…');
  const pt = await fetchBulk();
  console.log(`[ncm] ${pt.length} NCM 8-digit codes`);

  const byId = new Map(pt.map((r) => [r.id, r.text]));
  let es: Map<string, string> | null = null;
  if (wantEs) {
    console.log(`[ncm] fetching the Spanish variant per code (${pt.length} requests, ~${Math.round((pt.length * DELAY_MS) / 60000)} min)…`);
    es = new Map();
    let done = 0;
    for (const row of pt) {
      const t = await fetchOneEs(row.id);
      if (t) es.set(row.id, t);
      if (++done % 500 === 0) console.log(`[ncm]   ${done}/${pt.length}`);
      await sleep(DELAY_MS);
    }
    console.log(`[ncm] Spanish descriptions: ${es.size}/${pt.length}`);
  }

  fs.mkdirSync(outDir, { recursive: true });
  const files: string[] = [];
  fs.writeFileSync(path.join(outDir, 'ncm-pt.json'), JSON.stringify(pt));
  files.push('ncm-pt.json');
  if (es) {
    fs.writeFileSync(path.join(outDir, 'ncm-es.json'), JSON.stringify([...es].map(([id, text]) => ({ id, text }))));
    files.push('ncm-es.json');
  }
  fs.writeFileSync(
    path.join(outDir, 'ncm.provenance.json'),
    JSON.stringify(
      {
        source: 'MDIC / Comex Stat — NCM correlation table',
        sourceUrl: API,
        fetchedAt: new Date().toISOString(),
        codes: pt.length,
        spanishCodes: es ? es.size : 0,
        files,
        licence: 'Open government data (gov.br). Site content is CC BY-ND 3.0; the NCM nomenclature itself is the Mercosur legal instrument.',
        note: 'The bulk endpoint ignores `language` and always returns Portuguese. Only the per-code endpoint returns Spanish.',
      },
      null,
      2,
    ) + '\n',
  );
  console.log(`[ncm] → ${outDir} (${files.join(', ')})`);

  // A sanity check the join can rely on: does the table actually cover the
  // codes the live arancel uses?  Cheap enough to run every time.
  console.log('[ncm] coverage against the live VE arancel…');
  const { getUnscopedSystemPrisma } = await import('../client.js');
  const db = getUnscopedSystemPrisma();
  const leaves = await db.nationalTariff.findMany({
    where: { countryCode: 'VE', isActive: true },
    select: { hsCode: true, description: true },
  });
  const ten = leaves.filter((r) => r.hsCode.replace(/[^0-9]/g, '').length === 10);
  const vacuous = ten.filter((r) => /^(los|las)\s+dem[áa]s\b/i.test((r.description ?? '').trim()));
  const matched = ten.filter((r) => byId.has(r.hsCode.replace(/[^0-9]/g, '').slice(0, 8)));
  const vacRescued = vacuous.filter((r) => {
    const n = byId.get(r.hsCode.replace(/[^0-9]/g, '').slice(0, 8)) ?? '';
    return n.trim().length >= 20 && !/^(los|las)\s+dem[áa]s\b/i.test(n.trim());
  });
  console.log(
    `[ncm] ${ten.length} live 10-digit leaves · ${matched.length} have an NCM match ` +
      `(${((100 * matched.length) / ten.length).toFixed(1)}%) · ` +
      `${vacRescued.length}/${vacuous.length} vacuous leaves rescued (${((100 * vacRescued.length) / Math.max(1, vacuous.length)).toFixed(1)}%)`,
  );
}

main().catch((err) => {
  console.error('[ncm] failed:', err);
  process.exit(1);
});
