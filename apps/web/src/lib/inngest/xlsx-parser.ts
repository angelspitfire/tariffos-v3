import { inflateRawSync } from 'node:zlib';

const MAX_ROWS = 2_000;
const EOCD_SIGNATURE = 0x06054b50;
const CD_SIGNATURE = 0x02014b50;
const LOCAL_SIGNATURE = 0x04034b50;

function decodeXmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(Number.parseInt(dec, 10)));
}

function columnLettersToIndex(letters: string): number {
  let idx = 0;
  for (let i = 0; i < letters.length; i += 1) {
    idx = idx * 26 + (letters.charCodeAt(i) - 64);
  }
  return Math.max(0, idx - 1);
}

function findEocdOffset(buf: Buffer): number {
  const minOffset = Math.max(0, buf.length - 65_557);
  for (let i = buf.length - 22; i >= minOffset; i -= 1) {
    if (buf.readUInt32LE(i) === EOCD_SIGNATURE) return i;
  }
  return -1;
}

function readZipEntries(input: Uint8Array): Map<string, string> {
  const buf = Buffer.from(input);
  const files = new Map<string, string>();
  const eocdOffset = findEocdOffset(buf);
  if (eocdOffset < 0) return files;

  const entryCount = buf.readUInt16LE(eocdOffset + 10);
  let cdOffset = buf.readUInt32LE(eocdOffset + 16);

  for (let i = 0; i < entryCount && cdOffset + 46 <= eocdOffset; i += 1) {
    if (buf.readUInt32LE(cdOffset) !== CD_SIGNATURE) break;
    const method = buf.readUInt16LE(cdOffset + 10);
    const compSize = buf.readUInt32LE(cdOffset + 20);
    const nameLen = buf.readUInt16LE(cdOffset + 28);
    const extraLen = buf.readUInt16LE(cdOffset + 30);
    const commentLen = buf.readUInt16LE(cdOffset + 32);
    const localOffset = buf.readUInt32LE(cdOffset + 42);
    const name = buf.subarray(cdOffset + 46, cdOffset + 46 + nameLen).toString('utf8');
    cdOffset += 46 + nameLen + extraLen + commentLen;

    const isRelevant =
      name === 'xl/sharedStrings.xml' || /^xl\/worksheets\/sheet\d+\.xml$/i.test(name);
    if (!isRelevant || localOffset + 30 > buf.length) continue;
    if (buf.readUInt32LE(localOffset) !== LOCAL_SIGNATURE) continue;

    const localNameLen = buf.readUInt16LE(localOffset + 26);
    const localExtraLen = buf.readUInt16LE(localOffset + 28);
    const dataStart = localOffset + 30 + localNameLen + localExtraLen;
    const dataEnd = dataStart + compSize;
    if (dataEnd > buf.length) continue;

    const compressed = buf.subarray(dataStart, dataEnd);
    try {
      const content =
        method === 0
          ? compressed.toString('utf8')
          : method === 8
            ? inflateRawSync(compressed).toString('utf8')
            : null;
      if (content !== null) files.set(name, content);
    } catch {
      // Skip malformed ZIP entry gracefully
    }
  }
  return files;
}

function parseSharedStrings(xml: string | undefined): string[] {
  if (!xml) return [];
  const strings: string[] = [];
  const siRe = /<si\b[^>]*>([\s\S]*?)<\/si>/gi;
  const tRe = /<t\b[^>]*>([\s\S]*?)<\/t>/gi;

  for (const siMatch of xml.matchAll(siRe)) {
    const inner = siMatch[1] ?? '';
    const chunks: string[] = [];
    for (const tMatch of inner.matchAll(tRe)) {
      chunks.push(decodeXmlEntities(tMatch[1] ?? ''));
    }
    strings.push(chunks.join(''));
  }
  return strings;
}

function parseSheetRows(sheetXml: string, sharedStrings: readonly string[]): string[][] {
  const rows: string[][] = [];
  const rowRe = /<row\b[^>]*>([\s\S]*?)<\/row>/gi;
  const cellRe = /<c\b([^>]*)(?:\/>|>([\s\S]*?)<\/c>)/gi;

  for (const rowMatch of sheetXml.matchAll(rowRe)) {
    if (rows.length >= MAX_ROWS) break;
    const cells: string[] = [];
    const rowBody = rowMatch[1] ?? '';

    for (const cellMatch of rowBody.matchAll(cellRe)) {
      const attrs = cellMatch[1] ?? '';
      const body = cellMatch[2] ?? '';
      const refMatch = /\br="([A-Z]+)\d+"/i.exec(attrs);
      const colIdx = refMatch?.[1] ? columnLettersToIndex(refMatch[1].toUpperCase()) : cells.length;
      const typeMatch = /\bt="([^"]+)"/i.exec(attrs);
      const cellType = typeMatch?.[1] ?? 'n';

      let value = '';
      if (cellType === 'inlineStr') {
        const inlineChunks = Array.from(body.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/gi)).map((m) =>
          decodeXmlEntities(m[1] ?? ''),
        );
        value = inlineChunks.join('').trim();
      } else {
        const vMatch = /<v\b[^>]*>([\s\S]*?)<\/v>/i.exec(body);
        const rawVal = vMatch?.[1]?.trim() ?? '';
        if (cellType === 's') {
          const strIdx = Number.parseInt(rawVal, 10);
          value = Number.isInteger(strIdx) ? (sharedStrings[strIdx] ?? '').trim() : '';
        } else {
          value = decodeXmlEntities(rawVal).trim();
        }
      }

      while (cells.length <= colIdx) cells.push('');
      cells[colIdx] = value;
    }

    if (cells.some((cell) => cell.length > 0)) {
      rows.push(cells);
    }
  }
  return rows;
}

/** Parses the first worksheet of an OOXML `.xlsx` archive into normalized string rows. */
export function parseXlsxBufferToRows(buffer: Uint8Array): string[][] {
  if (buffer.length < 22) return [];
  const entries = readZipEntries(buffer);
  const sheetKey =
    entries.has('xl/worksheets/sheet1.xml')
      ? 'xl/worksheets/sheet1.xml'
      : Array.from(entries.keys()).filter((k) => /^xl\/worksheets\/sheet\d+\.xml$/i.test(k)).sort()[0];
  if (!sheetKey) return [];

  const sharedStrings = parseSharedStrings(entries.get('xl/sharedStrings.xml'));
  return parseSheetRows(entries.get(sheetKey) ?? '', sharedStrings);
}

/** Formats parsed spreadsheet rows into pipe-delimited text consumable by `parseBatchTextToItems`. */
export function formatRowsToDelimitedText(rows: readonly (readonly string[])[]): string {
  return rows.map((row) => row.map((cell) => cell.replace(/\r?\n/g, ' ').trim()).join(' | ')).join('\n');
}
