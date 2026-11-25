/**
 * Deterministic extraction of the Venezuelan arancel's **legal notes** into
 * `LegalKnowledgeParent` / `LegalKnowledgeChunk`.
 *
 *   npx tsx src/scripts/extract_arancel_notes.ts [--pdf FILE] [--dry-run]
 *                                          [--import] [--chapter NN]
 *
 * Source of truth: docs/laws/ve/Tradex-Arancel-de-Aduanas-Decreto-4.944-GOE-6.804.pdf
 * Instrument:      Decreto N° 4.944 (24 April 2024), Gaceta Oficial Extraordinaria N° 6.804
 *
 * Why this exists
 * ---------------
 * `extract_arancel_pdf.ts` extracts the *tariff table* from the same decree
 * deterministically, and it already recognises the notes blocks — it uses them
 * as row boundaries and then discards them. The notes are where the actual
 * classification rules live ("Este Capítulo no comprende…"), and they were
 * absent from the corpus: `LegalKnowledgeChunk` held 5 demo-seed rows, so the
 * quality gate audited against seed text and the re-ranker never ran (its
 * input is capped at 3 passages).
 *
 * This is the same job as `extract_arancel_pdf.ts`, inverted: capture the note
 * blocks instead of skipping them.
 *
 * Why it needs no API
 * -------------------
 * The decree is a *text* PDF, so `pdfjs-dist` (already a dependency of this
 * package) yields the page text with its geometry, and the notes have a rigid
 * layout. The chapter-note block looks like this:
 *
 *   CAPÍTULO 16                      <- heading, centred (x ~ 315)
 *   PREPARACIONES DE CARNE, …         <- title, on the NEXT line at any x
 *   Notas.                            <- note heading, body column
 *   1. Este Capítulo no comprende…    <- a numbered rule
 *      conservados por los…           <- its continuation (indented)
 *   2. Las preparaciones…             <- the next rule
 *   Notas de subpartida.              <- still the SAME chapter's note
 *   1. En la subpartida 1602.10, …    <- a rule that names a subheading
 *   Descripción de las Mercancías …   <- the tariff table starts; notes end
 *
 * Chunking rules (each one is a decision, and each has a reason)
 * --------------------------------------------------------------
 * R1. One chunk = one citable rule. A numbered item ("1.", "2.") starts a
 *     chunk; its lettered sub-items ("a)", "b)") continue it. Splitting them
 *     breaks the citation; merging two rules lets the gate cite the wrong one.
 *
 * R2. The heading is detected by the CODE in it, never by x-position. The
 *     body column drifts between pages (76 / 78 / 84 / 97 …) and the title
 *     line sits at a different x again, so only the upper bound (a tariff
 *     column is always far right) is stable.
 *
 * R3. The line after a heading is its TITLE and is never body text. Without
 *     this the chapter title leaks into the previous rule.
 *
 * R4. "Notas de subpartida" is NOT a new level — it continues the chapter's
 *     note. The subheading it governs is named *inside each rule* ("En la
 *     subpartida 1602.10, …"), so it is recorded as the rule's SCOPE, not as
 *     a path. Inventing a "subheading" parent here produced six colliding
 *     entries all keyed "98".
 *
 * R5. SUBCAPÍTULO is numbered in ROMAN numerals and is a label for the
 *     chapters beneath it, not a retrievable level. It annotates the current
 *     chapter instead of opening a new one.
 *
 * R6. Every rule records the codes it speaks about. That is what lets a note
 *     be found at subheading level without a hierarchy the arancel lacks.
 *
 * R7. The parent's `hierarchyPath` is the retrieval key and is the CHAPTER
 *     number, because the pipeline knows the chapter from the candidate codes
 *     before it needs any note. Retrieval is a hard filter on this field, not
 *     a similarity search.
 *
 * Embeddings are OPTIONAL and off by default. The `embedding` column is
 * `Unsupported("vector")` and nullable, and the legal corpus is retrieved with
 * a chapter filter plus a keyword rank, which is free and auditable.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

import * as crypto from 'node:crypto';

import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

import * as dotenv from 'dotenv';

// Load every candidate env file (dotenv does not override an already-set var),
// so the import finds DATABASE_URL wherever it lives.
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

const DEFAULT_PDF = path.resolve(
  process.cwd(),
  '../../docs/laws/ve/Tradex-Arancel-de-Aduanas-Decreto-4.944-GOE-6.804.pdf',
);
const DECREE = 'Decreto N° 4.944';
const GAZETTE = 'Gaceta Oficial Extraordinaria N° 6.804';
const VALID_FROM = new Date('2024-04-25');

/**
 * Anything further right than this is a tariff-table column, not note text.
 * The arancel indents its tables differently per subchapter, so the exact
 * body-column x drifts between pages. Only this upper bound is stable.
 */
const TABLE_COLUMN_MIN_X = 300;

/**
 * The band a real heading sits in. Measured across the whole decree:
 *   notes body      x ≈ 70 – 140   (drifts per page)
 *   SUMARIO entries x ≈ 37 – 165   (the table of contents)
 *   real headings   x ≈ 300 – 330  (centred)
 *   decree articles x ≈ 375 – 395  (the front matter's right column)
 *   tariff columns  x ≈ 400 – 500
 * A heading outside [250, 400) is a contents entry, not a heading.
 */
const HEADING_MIN_X = 250;
const HEADING_MAX_X = 400;

/** A title is prose, not a page number from a contents list. */
const TITLE_MIN_LEN = 8;
const BARE_NUMBER_RE = /^[\d.\s]+$/;

/** A numbered item ("1. ", "12. ") starts a new citable rule (R1). */
const NUM_ITEM_RE = /^(\d{1,2})\.\s/;
/** A lettered sub-item continues the rule above it (R1). */
const LETTER_ITEM_RE = /^([a-zñ])\)\s/i;

/** Headings, detected by their code rather than their position (R2). */
const SECTION_RE = /^SECCI[ÓO]N\s+([IVXLC]+)\b/i;
const CHAPTER_RE = /^CAP[ÍI]TULO\s+(\d{1,2})\b/i;
/** SUBCAPÍTULO is roman and is a label, not a level (R5). */
const SUBCHAP_RE = /^SUBCAP[ÍI]TULO\s+([IVXLC]+)\b/i;

/** "Notas de subpartida.", "Notas de subcapítulo", "Notas de Sección". */
const NOTES_OF_RE = /^Notas\s+de\s+(Secci[óo]n|Subpartida|Subcap[íi]tulo)\b/i;
/** A bare note heading: "Nota.", "Notas.", "Nota Complementaria.". */
const NOTE_HEAD_RE = /^Notas?\b(?:\s+Complementarias?\b)?\s*[.:]?$/i;
/** A note heading that shares its line with the first item. */
const NOTE_HEAD_WITH_ITEM_RE =
  /^Notas?\b(?:\s+Complementarias?\b)?\s*[.:]\s*((?:\d{1,2}\.\s).*)$/i;
/** The table header — the notes are over and the tariff rows begin. */
const TABLE_HEADER_RE = /Descripci[óo]n de las Mercanc[íi]as\s+Tarifa\s+Ad\s+Valorem/i;

/**
 * A code the rule speaks about (R6). The arancel writes codes in dotted
 * groups: 4-digit "84.71", 6-digit "21.06.90", 8-digit "01.01.21.00",
 * 10-digit "01.01.21.00.10".
 */
const CODE_REF_RE = /\b(\d{2}(?:\.\d{2}){1,4})\b/g;

interface Line {
  y: number;
  x: number;
  text: string;
}

interface NoteChunk {
  text: string;
  ruleNumber: string;
  scope: string[];
}

interface Note {
  legalType: 'SECTION' | 'CHAPTER';
  /** "24" (the retrieval key) or "SEC-XV". */
  hierarchyPath: string;
  /** "CAPÍTULO 24 — TABACO Y MANUFACTURAS DE TABACO". */
  label: string;
  title: string;
  chunks: NoteChunk[];
}

/**
 * The document handle, as the loader hands it back.
 *
 * `getDocument()` returns a loading task whose `promise` resolves to the
 * document; this names that result without importing an internal type.
 */
type LoadedDocument = Awaited<ReturnType<typeof getDocument>['promise']>;

async function pageLines(
  doc: LoadedDocument,
  pageNo: number,
): Promise<Line[]> {
  const page = await doc.getPage(pageNo);
  const content = await page.getTextContent();
  const byY = new Map<number, Array<{ x: number; s: string }>>();
  for (const item of content.items) {
    const str = (item as { str?: string }).str;
    if (!str || !str.trim()) continue;
    const y = Math.round((item as { transform: number[] }).transform[5]);
    const x = (item as { transform: number[] }).transform[4];
    if (!byY.has(y)) byY.set(y, []);
    byY.get(y)!.push({ x, s: str });
  }
  return [...byY.entries()]
    .sort((a, b) => b[0] - a[0]) // top of the page first
    .map(([y, items]) => ({
      y,
      x: Math.min(...items.map((i) => i.x)),
      text: items.sort((a, b) => a.x - b.x).map((i) => i.s).join(' ').replace(/\s+/g, ' ').trim(),
    }))
    .filter((l) => l.text.length > 0);
}

const joinLines = (lines: string[]): string => lines.join(' ').replace(/\s+/g, ' ').trim();

/** The dotted codes a rule refers to (R6). */
function scopeOf(text: string): string[] {
  const out = new Set<string>();
  for (const m of text.matchAll(CODE_REF_RE)) out.add(m[1]);
  return [...out];
}

async function extractNotes(pdfPath: string): Promise<{ notes: Note[]; pages: number }> {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await getDocument({ data, useSystemFonts: true }).promise;

  const notes: Note[] = [];
  /**
   * The note being read, if any.
   *
   * Typed explicitly: it is only ever assigned inside the closures below, so
   * without the annotation TypeScript infers `null` for every read and
   * narrows the value to `never`.
   */
  let current: Note | null = null;
  /**
   * The same note, held in a box.
   *
   * `current` is only assigned inside the closures below, and TypeScript
   * does not track assignments made in a closure — it reads every use as
   * `null` and narrows it to `never`. The box gives the assignments a place
   * the analysis can see.
   */
  const currentRef: { note: Note | null } = { note: null };
  let chunkLines: string[] = [];
  let chunkRule = '';
  /**
   * A heading is only a heading if notes follow it. The arancel's SUMARIO
   * lists "SECCIÓN I … CAPÍTULO 1 …" and the appendix repeats section titles,
   * and neither is followed by a note — so the decision is deferred until a
   * note heading or a numbered item actually appears.
   */
  let pending: { legalType: Note['legalType']; path: string; label: string; title: string } | null = null;
  /** The line after a heading is its title, not body text (R3). */
  let expectTitle = false;
  /** A SUBCAPÍTULO label annotates the chapters beneath it (R5). */
  let subchapterLabel = '';

  const flushChunk = (): void => {
    if (!current || chunkLines.length === 0) return;
    const text = joinLines(chunkLines);
    if (text.length > 20) {
      current.chunks.push({ text, ruleNumber: chunkRule, scope: scopeOf(text) });
    }
    chunkLines = [];
  };

  const closeNote = (): void => {
    flushChunk();
    if (current && current.chunks.length > 0) {
      // The same chapter can be opened twice (a note that continues after the
      // tariff table). Merge rather than emit a colliding second parent.
      const existing = notes.find(
        (n) => n.legalType === current!.legalType && n.hierarchyPath === current!.hierarchyPath,
      );
      if (existing) {
        existing.chunks.push(...current.chunks);
        if (!existing.title) existing.title = current.title;
      } else {
        notes.push(current);
      }
    }
    currentRef.note = null;
    current = null;
    chunkLines = [];
  };

  /** Open the block for a heading that has just been confirmed by a note. */
  const openPending = (): void => {
    if (!pending) return;
    const heading = pending;
    const note: Note = {
      legalType: heading.legalType,
      hierarchyPath: heading.path,
      label: heading.label,
      title: heading.title,
      chunks: [],
    };
    currentRef.note = note;
    current = note;
    pending = null;
  };

  for (let p = 1; p <= doc.numPages; p++) {
    const lines = await pageLines(doc, p);
    for (const line of lines) {
      const t = line.text;

      // The tariff table starts — the notes for this chapter are over.
      if (TABLE_HEADER_RE.test(t)) {
        closeNote();
        pending = null;
        expectTitle = false;
        continue;
      }

      // A section heading: SECCIÓN I
      const sec = t.match(SECTION_RE);
      if (sec && line.x >= HEADING_MIN_X && line.x < HEADING_MAX_X) {
        closeNote();
        pending = { legalType: 'SECTION', path: `SEC-${sec[1].toUpperCase()}`, label: t, title: '' };
        expectTitle = true;
        continue;
      }

      // A chapter heading: CAPÍTULO 24
      const chap = t.match(CHAPTER_RE);
      if (chap && line.x >= HEADING_MIN_X && line.x < HEADING_MAX_X) {
        closeNote();
        pending = {
          legalType: 'CHAPTER',
          path: chap[1].padStart(2, '0'),
          label: t,
          title: '',
        };
        expectTitle = true;
        continue;
      }

      // A subchapter heading: SUBCAPÍTULO I — a label, not a level (R5).
      const sub = t.match(SUBCHAP_RE);
      if (sub) {
        flushChunk();
        subchapterLabel = t;
        expectTitle = true;
        continue;
      }

      // The title line belongs to the heading above it (R3).
      if (expectTitle) {
        expectTitle = false;
        // A contents entry's "title" is a page number. That means the heading
        // was never real, so the pending block is dropped rather than given a
        // meaningless subject.
        const isProse = t.length >= TITLE_MIN_LEN && !BARE_NUMBER_RE.test(t);
        if (!isProse) {
          pending = null;
          continue;
        }
        // Read through a local: assigning `pending = null` above narrows the
        // variable for the rest of the block, and TypeScript then reads the
        // assignments below as unreachable.
        const heading = pending;
        const note = currentRef.note;
        if (heading) {
          heading.label = `${heading.label} — ${t}`;
          heading.title = t;
        } else if (note) {
          note.title = t;
          note.label = `${note.label} — ${t}`;
        }
        continue;
      }

      // "Notas de subpartida." / "Notas de subcapítulo" / "Notas de Sección"
      // — all continue the current note; they do not open a new level (R4).
      if (NOTES_OF_RE.test(t)) {
        flushChunk();
        if (!current) openPending();
        continue;
      }

      // A bare note heading: "Nota.", "Notas.", "Nota Complementaria.".
      if (line.x <= 140) {
        if (NOTE_HEAD_RE.test(t)) {
          flushChunk();
          if (!current) openPending();
          continue;
        }
        const withItem = t.match(NOTE_HEAD_WITH_ITEM_RE);
        if (withItem) {
          flushChunk();
          if (!current) openPending();
          chunkLines.push(withItem[1].trim());
          chunkRule = withItem[1].trim().match(NUM_ITEM_RE)?.[1] ?? '';
          continue;
        }
      }

      if (!current) {
        // A numbered item with no confirmed heading: it belongs to whatever
        // block is open, or to nothing. A pending heading is confirmed by it.
        if (NUM_ITEM_RE.test(t) && pending) {
          openPending();
        } else {
          continue;
        }
      }

      // Beyond this x the line is a tariff-table column, not note text (R2).
      if (line.x > TABLE_COLUMN_MIN_X) continue;

      // A numbered item starts a new rule; everything else continues it (R1).
      const num = t.match(NUM_ITEM_RE);
      if (num) {
        flushChunk();
        chunkLines.push(t);
        chunkRule = num[1];
      } else if (LETTER_ITEM_RE.test(t)) {
        if (chunkLines.length > 0) chunkLines.push(t);
      } else if (chunkLines.length > 0) {
        chunkLines.push(t);
      }
    }
  }
  closeNote();

  // A section note is retrieved by chapter, so attach it to every chapter of
  // its section. Only a note whose heading is the section itself qualifies —
  // the arancel also opens with a general "Notas de Sección." preamble about
  // the indicative nature of section titles, which is not a section's note.
  const sectionNoteByPath = new Map<string, Note>();
  for (const n of notes) {
    if (n.legalType === 'SECTION' && /^SECCI[ÓO]N\b/i.test(n.label)) {
      sectionNoteByPath.set(n.hierarchyPath, n);
    }
  }
  for (const n of notes) {
    if (n.legalType !== 'CHAPTER') continue;
    const chap = parseInt(n.hierarchyPath, 10);
    if (!Number.isFinite(chap)) continue;
    const secNo = WCO_SECTION_OF_CHAPTER[chap];
    if (!secNo) continue;
    const sec = sectionNoteByPath.get(`SEC-${romanize(secNo)}`);
    if (sec && sec.chunks.length > 0) {
      n.chunks = [...sec.chunks, ...n.chunks];
      n.label = `${n.label}  (+ Notas de Sección ${romanize(secNo)})`;
    }
  }

  return { notes, pages: doc.numPages };
}

/**
 * WCO section → chapter ranges. The 21 HS sections and their chapter spans
 * are fixed by the Harmonized System, so this is a constant, not a guess.
 */
const WCO_SECTION_OF_CHAPTER: Record<number, number> = (() => {
  const spans: Array<[number, number]> = [
    [1, 5], [6, 14], [15, 24], [25, 27], [28, 38], [39, 40], [41, 43], [44, 45],
  ];
  const out: Record<number, number> = {};
  let s = 1;
  for (const [lo, hi] of spans) {
    for (let c = lo; c <= hi; c++) out[c] = s;
    s++;
  }
  return out;
})();

/** 1 -> "I", 15 -> "XV". */
function romanize(n: number): string {
  const table: Array<[number, string]> = [
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];
  let out = '';
  let rest = n;
  for (const [v, s] of table) {
    while (rest >= v) {
      out += s;
      rest -= v;
    }
  }
  return out;
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes('--dry-run');
  const doImport = argv.includes('--import');
  const pdfArg = argv.indexOf('--pdf');
  const pdfPath = pdfArg >= 0 ? path.resolve(argv[pdfArg + 1]) : DEFAULT_PDF;
  const chapterArg = argv.indexOf('--chapter');
  const onlyChapter = chapterArg >= 0 ? argv[chapterArg + 1].replace(/[^0-9]/g, '') : null;

  if (!fs.existsSync(pdfPath)) {
    console.error(`[notes] PDF not found: ${pdfPath}`);
    process.exit(1);
  }
  console.log(`[notes] source: ${pdfPath}`);

  const { notes, pages } = await extractNotes(pdfPath);
  const selected = onlyChapter
    ? notes.filter(
        (n) =>
          n.hierarchyPath === onlyChapter.padStart(2, '0') ||
          n.hierarchyPath.startsWith(`${onlyChapter.padStart(2, '0')}/`),
      )
    : notes;
  const chunkCount = selected.reduce((n, x) => n + x.chunks.length, 0);
  console.log(`[notes] ${pages} pages -> ${selected.length} note blocks, ${chunkCount} chunks`);
  if (onlyChapter) console.log(`[notes] filtered to chapter ${onlyChapter}`);
  const byType = selected.reduce<Record<string, number>>((acc, n) => {
    acc[n.legalType] = (acc[n.legalType] ?? 0) + 1;
    return acc;
  }, {});
  console.log(`[notes] by type: ${JSON.stringify(byType)}`);

  const chapters = selected.filter((n) => n.legalType === 'CHAPTER').map((n) => n.hierarchyPath).sort();
  console.log(`[notes] chapters with notes: ${chapters.length} -> ${chapters.join(' ')}`);

  const withScope = selected.filter((n) => n.chunks.some((c) => c.scope.length > 0));
  console.log(`[notes] blocks with a subheading scope: ${withScope.length}`);

  if (dryRun) {
    console.log('\n[notes] --- sample ---');
    for (const n of selected.slice(0, 2)) {
      console.log(`\n### [${n.legalType}] ${n.hierarchyPath} — ${n.label}`);
      for (const c of n.chunks.slice(0, 3)) {
        console.log(`   - [${c.ruleNumber || '-'}] ${c.text.slice(0, 220)}${c.scope.length ? `   scope: ${c.scope.join(',')}` : ''}`);
      }
    }
    const big = [...selected].sort((a, b) => b.chunks.length - a.chunks.length)[0];
    if (big) {
      console.log(`\n[notes] --- largest block: [${big.legalType}] ${big.hierarchyPath} (${big.chunks.length} chunks) ---`);
      console.log(`   ${big.chunks[0]?.text.slice(0, 400)}`);
    }
    return;
  }

  if (!doImport) {
    console.log('[notes] dry run only — pass --import to write to the database');
    return;
  }

  const { getUnscopedSystemPrisma } = await import('../client.js');
  const db = getUnscopedSystemPrisma();
  const country = await db.country.findFirst({ where: { code: 'VE' } });
  if (!country) throw new Error('VE country row not found');

  let parents = 0;
  let chunks = 0;
  for (const n of notes) {
    if (n.chunks.length === 0) continue;
    const content = n.chunks.map((c) => c.text).join('\n\n');
    // The versioned identity: the same path can exist again for a later
    // instrument (a chapter note as amended by successive reforms).
    const parent = await db.legalKnowledgeParent.upsert({
      where: {
        countryCode_legalType_hierarchyPath_validFromDate: {
          countryCode: country.code,
          legalType: n.legalType,
          hierarchyPath: n.hierarchyPath,
          validFromDate: VALID_FROM,
        },
      },
      create: {
        countryCode: country.code,
        legalType: n.legalType,
        hierarchyPath: n.hierarchyPath,
        title: n.title,
        content,
        sourceFile: path.basename(pdfPath),
        officialDocumentNumber: GAZETTE,
        decreeNumber: DECREE,
        validFromDate: VALID_FROM,
        isDerogated: false,
        status: 'PUBLISHED',
      },
      update: { content, title: n.title, status: 'PUBLISHED' },
    });
    parents++;

    await db.legalKnowledgeChunk.deleteMany({ where: { parentId: parent.id } });
    for (const [i, c] of n.chunks.entries()) {
      await db.$executeRaw`
        INSERT INTO "LegalKnowledgeChunk"
          (id, "parentId", content, heading, "ruleNumber", scope, "chunkIndex", "createdAt", search)
        VALUES (
          ${crypto.randomUUID()}, ${parent.id}, ${c.text}, ${n.label}, ${c.ruleNumber || null},
          ${c.scope}, ${i}, now(),
          to_tsvector('spanish', translate(${n.label + ' ' + c.text}, 'áéíóúüñÁÉÍÓÚÜÑ', 'aeiouunAEIOUUN'))
        )`;
      chunks++;
    }
  }

  console.log(`[notes] wrote ${parents} parents and ${chunks} chunks (embeddings left null — no API spend)`);
  console.log('[notes] retrieval: chapter-scoped `hierarchyPath LIKE \'<chapter>%\'` plus a keyword rank;');
  console.log('[notes] see docs/research/decision-engine-evaluation-2026-10-19.md');
}

main().catch((err) => {
  console.error('[notes] failed:', err);
  process.exit(1);
});
