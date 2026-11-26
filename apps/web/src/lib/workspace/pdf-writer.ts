const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN_X = 48;
const TOP_Y = 742;
const BOTTOM_Y = 56;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;

export type PdfFontKey = 'F1' | 'F2' | 'F3';

const WIN_ANSI_MAP: Record<number, number> = {
  0x20ac: 0x80,
  0x201a: 0x82,
  0x201e: 0x84,
  0x2026: 0x85,
  0x2020: 0x86,
  0x2021: 0x87,
  0x2030: 0x89,
  0x2039: 0x8b,
  0x2018: 0x91,
  0x2019: 0x92,
  0x201c: 0x93,
  0x201d: 0x94,
  0x2022: 0x95,
  0x2013: 0x96,
  0x2014: 0x97,
  0x2122: 0x99,
  0x203a: 0x9b,
};

function encodeWinAnsiByte(code: number): number {
  if (code >= 0x20 && code <= 0x7e) return code;
  if (code >= 0xa0 && code <= 0xff) return code;
  return WIN_ANSI_MAP[code] ?? 0x3f;
}

function escapePdfLiteral(text: string): string {
  let out = '';
  for (let i = 0; i < text.length; i += 1) {
    const byte = encodeWinAnsiByte(text.charCodeAt(i));
    if (byte === 0x28 || byte === 0x29 || byte === 0x5c) {
      out += `\\${String.fromCharCode(byte)}`;
    } else {
      out += String.fromCharCode(byte);
    }
  }
  return out;
}

export function wrapPdfText(text: string, fontSize: number, maxWidth = CONTENT_WIDTH): string[] {
  const approxCharWidth = fontSize * 0.51;
  const maxChars = Math.max(12, Math.floor(maxWidth / approxCharWidth));
  const paragraphs = text.replace(/\r/g, '').split('\n');
  const lines: string[] = [];

  for (const para of paragraphs) {
    const words = para.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push('');
      continue;
    }
    let current = '';
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (candidate.length <= maxChars) {
        current = candidate;
      } else {
        if (current) lines.push(current);
        current = word.length > maxChars ? `${word.slice(0, maxChars - 1)}-` : word;
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

export class PdfDocumentBuilder {
  private pages: string[][] = [[]];
  private cursorY = TOP_Y;

  private get currentCommands(): string[] {
    return this.pages[this.pages.length - 1]!;
  }

  ensureSpace(neededHeight: number): void {
    if (this.cursorY - neededHeight < BOTTOM_Y) {
      this.pages.push([]);
      this.cursorY = TOP_Y;
    }
  }

  drawBanner(title: string, subtitle: string): void {
    this.currentCommands.push(
      `0.059 0.090 0.165 rg 0 ${PAGE_HEIGHT - 68} ${PAGE_WIDTH} 68 re f`,
      `BT /F2 13 Tf 1 1 1 rg ${MARGIN_X} ${PAGE_HEIGHT - 30} Td (${escapePdfLiteral(title)}) Tj ET`,
      `BT /F1 9 Tf 0.796 0.835 0.882 rg ${MARGIN_X} ${PAGE_HEIGHT - 48} Td (${escapePdfLiteral(subtitle)}) Tj ET`,
    );
    this.cursorY = PAGE_HEIGHT - 90;
  }

  addGap(pts: number): void {
    this.cursorY -= pts;
  }

  drawRule(): void {
    this.ensureSpace(12);
    this.currentCommands.push(
      `0.82 0.85 0.89 RG 0.6 w ${MARGIN_X} ${this.cursorY} m ${PAGE_WIDTH - MARGIN_X} ${this.cursorY} l S`,
    );
    this.cursorY -= 12;
  }

  drawSectionTitle(title: string): void {
    this.ensureSpace(24);
    this.cursorY -= 4;
    this.currentCommands.push(
      `BT /F2 10.5 Tf 0.059 0.090 0.165 rg ${MARGIN_X} ${this.cursorY} Td (${escapePdfLiteral(title)}) Tj ET`,
    );
    this.cursorY -= 15;
  }

  drawTextLines(
    text: string,
    opts: { font?: PdfFontKey; size?: number; indent?: number; color?: string; lineHeight?: number } = {},
  ): void {
    const font = opts.font ?? 'F1';
    const size = opts.size ?? 9.5;
    const indent = opts.indent ?? 0;
    const color = opts.color ?? '0.15 0.19 0.25';
    const lineHeight = opts.lineHeight ?? size + 4;
    const lines = wrapPdfText(text, size, CONTENT_WIDTH - indent);

    for (const line of lines) {
      this.ensureSpace(lineHeight);
      if (line.length > 0) {
        this.currentCommands.push(
          `BT /${font} ${size} Tf ${color} rg ${MARGIN_X + indent} ${this.cursorY} Td (${escapePdfLiteral(line)}) Tj ET`,
        );
      }
      this.cursorY -= lineHeight;
    }
  }

  toBytes(): Uint8Array {
    const totalPages = this.pages.length;
    const objects: string[] = [];
    const pageObjIds: number[] = [];

    // 1: Catalog, 2: Pages, 3..5: Fonts
    const firstPageObj = 6;
    for (let i = 0; i < totalPages; i += 1) {
      pageObjIds.push(firstPageObj + i * 2);
    }

    objects.push('<< /Type /Catalog /Pages 2 0 R >>');
    objects.push(
      `<< /Type /Pages /Kids [${pageObjIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${totalPages} >>`,
    );
    objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
    objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
    objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Courier-Bold /Encoding /WinAnsiEncoding >>');

    for (let i = 0; i < totalPages; i += 1) {
      const footer = `BT /F1 8 Tf 0.45 0.50 0.56 rg ${MARGIN_X} 28 Td (${escapePdfLiteral(
        `TariffOS - Documento de clasificacion arancelaria | Pagina ${i + 1} de ${totalPages}`,
      )}) Tj ET`;
      const stream = [...this.pages[i]!, footer].join('\n');
      const pageId = firstPageObj + i * 2;
      const contentId = pageId + 1;
      objects.push(
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> /Contents ${contentId} 0 R >>`,
      );
      objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    }

    const chunks: string[] = ['%PDF-1.4\n'];
    const offsets: number[] = [0];
    let byteOffset = chunks[0]!.length;

    for (let i = 0; i < objects.length; i += 1) {
      offsets.push(byteOffset);
      const entry = `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
      chunks.push(entry);
      byteOffset += entry.length;
    }

    const xrefOffset = byteOffset;
    const xrefLines = [`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`];
    for (let i = 1; i < offsets.length; i += 1) {
      xrefLines.push(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
    }
    const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
    const raw = chunks.join('') + xrefLines.join('') + trailer;

    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i += 1) {
      bytes[i] = raw.charCodeAt(i) & 0xff;
    }
    return bytes;
  }
}
