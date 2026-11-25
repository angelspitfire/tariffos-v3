/**
 * Extract the national tariff codes from the consolidated arancel PDF.
 *
 * The document is read locally (`pdfjs-dist`) and its text travels with
 * each request, so the extraction works against any OpenAI-compatible
 * endpoint — a local model included. There is no file upload and no
 * context cache: neither has an equivalent outside an OpenAI-compatible
 * endpoint, and both were only there to avoid re-sending the same PDF.
 *
 * The extraction walks the document in batches, asking for the codes that
 * follow the last one it saw. Every batch is written to disk, so a run
 * that dies half-way can be resumed.
 *
 * Usage:
 *   npx tsx src/scripts/extract_pdf.ts [pdfPath] [--max-chars N] [--batch N]
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { z } from 'zod';
import { getLlmProvider } from '@tariffos/ai-client';

import { PDF_PATH } from './shared';
import { extractPdfText, withinBudget } from './pdf-text';

const OUTPUT_PATH = path.join(process.cwd(), '../../.data/extracted_tariffs.json');

/** One tariff row, as the arancel prints it. */
const TariffRow = z.object({
  hsCode: z.string().describe('The 10 digit HS code, e.g. 1601000090'),
  description: z.string().describe('The description of the product'),
  adValorem: z.number().describe('Ad Valorem tariff rate as a percentage, e.g. 20.0'),
  iva: z.number().describe('IVA rate as a percentage, e.g. 16.0'),
  customsFee: z.number().describe('Customs fee, usually 1.0'),
  legalNotes: z.string().describe('Any specific notes, BK, BIT, or requirements mentioned for this code'),
});

const TariffRows = z.array(TariffRow);

/** Characters of document context sent with each request. */
const DEFAULT_MAX_CHARS = 400_000;

/** Codes asked for per request. */
const DEFAULT_BATCH = 50;

/** The model that reads the document. `LLM_MODEL` decides it. */
const MODEL = process.env.LLM_MODEL?.trim() || 'gpt-4o-mini';

interface Options {
  pdfPath: string;
  maxChars: number;
  batch: number;
}

function parseArgs(argv: string[]): Options {
  const opts: Options = { pdfPath: PDF_PATH, maxChars: DEFAULT_MAX_CHARS, batch: DEFAULT_BATCH };
  const positional = argv.filter((a) => !a.startsWith('--'));
  if (positional[0]) opts.pdfPath = positional[0];
  const maxIdx = argv.indexOf('--max-chars');
  if (maxIdx >= 0) opts.maxChars = Number(argv[maxIdx + 1]) || DEFAULT_MAX_CHARS;
  const batchIdx = argv.indexOf('--batch');
  if (batchIdx >= 0) opts.batch = Number(argv[batchIdx + 1]) || DEFAULT_BATCH;
  return opts;
}

async function main(): Promise<void> {
  const opts = parseArgs(process.argv.slice(2));
  const provider = getLlmProvider();

  console.log(`Reading ${opts.pdfPath}…`);
  const document = withinBudget(await extractPdfText(opts.pdfPath), opts.maxChars);

  let allTariffs: z.infer<typeof TariffRow>[] = [];
  let lastHsCode = '';
  let isDone = false;
  let iterations = 0;

  console.log('Starting extraction…');

  while (!isDone && iterations < 50) {
    iterations++;
    console.log(
      `Iteration ${iterations}. Last extracted HS Code: ${lastHsCode || 'none'}`,
    );

    const prompt =
      lastHsCode === ''
        ? `Extrae todos los códigos arancelarios (a 10 dígitos) del documento, empezando por el principio (Capítulo 01). Extrae hasta ${opts.batch} códigos. Devuelve solo el arreglo JSON.`
        : `Extrae la SIGUIENTE tanda de códigos arancelarios a 10 dígitos, empezando ESTRICTAMENTE por el código posterior a ${lastHsCode}. Extrae hasta ${opts.batch} códigos. Si ya no hay más códigos, devuelve un arreglo vacío [].`;

    try {
      const extracted = await provider.generateJson(
        `${document}\n\n---\n\n${prompt}`,
        TariffRows,
        { model: MODEL, temperature: 0 },
      );

      if (extracted.length === 0) {
        console.log('Empty array returned — extraction complete.');
        isDone = true;
        break;
      }

      allTariffs = allTariffs.concat(extracted);
      lastHsCode = extracted[extracted.length - 1].hsCode;

      console.log(
        `Extracted ${extracted.length} items. Total so far: ${allTariffs.length}`,
      );

      // Save progress: a run that dies half-way can be resumed.
      fs.writeFileSync(OUTPUT_PATH, JSON.stringify(allTariffs, null, 2));
      console.log(`Progress saved to ${OUTPUT_PATH}`);

      if (extracted.length < opts.batch) {
        console.log('Fewer items than requested — probably near the end.');
      }
    } catch (err) {
      console.error('Error during extraction iteration:', err);
      break;
    }
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
