/**
 * Extract the national tariff codes, chapter by chapter.
 *
 * The document is read locally (`pdfjs-dist`) and its text travels with
 * each request, so the extraction works against any OpenAI-compatible
 * endpoint — a local model included. The retired engine's file service
 * and context cache are gone: neither has an equivalent outside an
 * OpenAI-compatible endpoint, and both existed only to avoid re-sending
 * the same PDF.
 *
 * The walk is per chapter: for each chapter the model is asked for the
 * codes it contains, and the run stops after three consecutive empty
 * chapters. Every chapter is written to disk, so a run that dies half-way
 * resumes from where it stopped.
 *
 * Usage:
 *   npx tsx src/scripts/extract_by_chapter.ts [pdfPath] [--max-chars N]
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { z } from 'zod';
import { getLlmProvider } from '@tariffos/ai-client';

import { PDF_PATH } from './shared';
import { extractPdfText, withinBudget } from './pdf-text';

const OUTPUT_PATH = path.join(process.cwd(), '../../.data/extracted_tariffs_full.json');

/** One tariff row, as the arancel prints it. */
const TariffRow = z.object({
  hsCode: z.string().describe('Código arancelario a 10 dígitos (sin puntos ni espacios, ej: 1601000090)'),
  description: z.string().describe('Descripción completa del producto'),
  adValorem: z.number().describe('Tasa Ad Valorem como número (ej: 20.0, 0 si está exento)'),
  iva: z.number().describe('Tasa de IVA como número (ej: 16.0)'),
  customsFee: z.number().describe('Tasa aduanera, usualmente 1.0'),
  legalNotes: z.string().describe('Cualquier nota legal, requisito o condición adicional'),
  regimenLegal: z.string().describe('El régimen legal (1 al 8) listado en el arancel para este código, ej: \'3, 4\', \'5\', \'Ninguno\' o \'1, 2\''),
  isBK: z.boolean().describe('true si el código está catalogado como Bien de Capital (BK) o tiene la marca BK en el arancel, false de lo contrario'),
  isBIT: z.boolean().describe('true si el código está catalogado como Bien de Informática y Telecomunicaciones (BIT) o tiene la marca BIT en el arancel, false de lo contrario'),
});

const TariffRows = z.array(TariffRow);

/** Characters of document context sent with each request. */
const DEFAULT_MAX_CHARS = 400_000;

/** Empty chapters in a row after which the walk stops. */
const EMPTY_CHAPTERS_TO_STOP = 3;

/** The model that reads the document. `LLM_MODEL` decides it. */
const MODEL = process.env.LLM_MODEL?.trim() || 'gpt-4o-mini';

interface Options {
  pdfPath: string;
  maxChars: number;
}

function parseArgs(argv: string[]): Options {
  const opts: Options = { pdfPath: PDF_PATH, maxChars: DEFAULT_MAX_CHARS };
  const positional = argv.filter((a) => !a.startsWith('--'));
  if (positional[0]) opts.pdfPath = positional[0];
  const maxIdx = argv.indexOf('--max-chars');
  if (maxIdx >= 0) opts.maxChars = Number(argv[maxIdx + 1]) || DEFAULT_MAX_CHARS;
  return opts;
}

async function main(): Promise<void> {
  const opts = parseArgs(process.argv.slice(2));
  const provider = getLlmProvider();

  let allTariffs: z.infer<typeof TariffRow>[] = [];

  // Resume: the output file is the record of what was extracted.
  if (fs.existsSync(OUTPUT_PATH)) {
    try {
      const existing = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf-8'));
      if (Array.isArray(existing) && existing.length > 0) {
        allTariffs = existing;
        console.log(`Resuming: ${existing.length} records already in ${OUTPUT_PATH}.`);
      }
    } catch {
      console.warn('Could not read the existing output file, starting fresh.');
    }
  }

  console.log(`Reading ${opts.pdfPath}…`);
  const document = withinBudget(await extractPdfText(opts.pdfPath), opts.maxChars);

  let chapter = 1;
  let emptyChaptersInARow = 0;

  // Resume from the last chapter already extracted.
  if (allTariffs.length > 0) {
    const lastHsCode = allTariffs[allTariffs.length - 1].hsCode;
    if (lastHsCode && lastHsCode.length >= 2) {
      chapter = parseInt(lastHsCode.substring(0, 2), 10);
      console.log(`Resuming from Chapter ${chapter} (last HS Code ${lastHsCode}).`);
      // The last heading is dropped so it is re-extracted cleanly.
      if (lastHsCode.length >= 4) {
        const lastHeading = lastHsCode.substring(0, 4);
        allTariffs = allTariffs.filter((t) => !t.hsCode.startsWith(lastHeading));
      } else {
        const prefix = chapter.toString().padStart(2, '0');
        allTariffs = allTariffs.filter((t) => !t.hsCode.startsWith(prefix));
      }
    }
  }

  console.log('Starting extraction…');

  while (emptyChaptersInARow < EMPTY_CHAPTERS_TO_STOP) {
    const chapterStr = chapter.toString().padStart(2, '0');
    console.log(`\n--- Chapter ${chapterStr} ---`);

    const prompt =
      `Busca el Capítulo ${chapterStr} en el documento. Extrae TODOS los códigos arancelarios ` +
      `a 10 dígitos que pertenecen exclusivamente a este capítulo (todos los que empiezan por ` +
      `${chapterStr}). Extrae la descripción, Ad Valorem, IVA, régimen legal, y si son BK o BIT. ` +
      `Si el Capítulo ${chapterStr} no existe o no contiene códigos, devuelve un arreglo vacío [].`;

    try {
      const extracted = await provider.generateJson(
        `${document}\n\n---\n\n${prompt}`,
        TariffRows,
        { model: MODEL, temperature: 0 },
      );

      if (extracted.length === 0) {
        console.log(`No codes in Chapter ${chapterStr}.`);
        emptyChaptersInARow++;
      } else {
        console.log(`Extracted ${extracted.length} codes from Chapter ${chapterStr}.`);
        const existingCodes = new Set(allTariffs.map((t) => t.hsCode));
        const uniqueNew = extracted.filter((t) => !existingCodes.has(t.hsCode));
        console.log(
          `Adding ${uniqueNew.length} new codes ` +
            `(filtered ${extracted.length - uniqueNew.length} duplicates).`,
        );
        allTariffs = allTariffs.concat(uniqueNew);
        emptyChaptersInARow = 0;

        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(allTariffs, null, 2));
        console.log(`Progress saved to ${OUTPUT_PATH} (total: ${allTariffs.length}).`);
      }
    } catch (err) {
      console.error(`Error in Chapter ${chapterStr}:`, err);
      break;
    }

    chapter++;
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(allTariffs, null, 2));
  console.log(`\nDone. ${allTariffs.length} tariffs written to ${OUTPUT_PATH}`);
}

main()
  .then(() => process.exit(process.exitCode ?? 0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
