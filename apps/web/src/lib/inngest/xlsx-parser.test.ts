import { deflateRawSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { formatRowsToDelimitedText, parseXlsxBufferToRows } from './xlsx-parser';

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    crc ^= bytes[i]!;
    for (let b = 0; b < 8; b += 1) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createStoredZip(entries: Array<{ name: string; content: string; compress?: boolean }>): Uint8Array {
  const localChunks: Buffer[] = [];
  const centralChunks: Buffer[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBuf = Buffer.from(entry.name, 'utf8');
    const rawBuf = Buffer.from(entry.content, 'utf8');
    const method = entry.compress ? 8 : 0;
    const dataBuf = entry.compress ? deflateRawSync(rawBuf) : rawBuf;
    const crc = crc32(rawBuf);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(method, 8);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(dataBuf.length, 18);
    local.writeUInt32LE(rawBuf.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    localChunks.push(local, nameBuf, dataBuf);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(method, 10);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(dataBuf.length, 20);
    central.writeUInt32LE(rawBuf.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt32LE(offset, 42);
    centralChunks.push(central, nameBuf);

    offset += 30 + nameBuf.length + dataBuf.length;
  }

  const centralDir = Buffer.concat(centralChunks);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralDir.length, 12);
  eocd.writeUInt32LE(offset, 16);

  return Buffer.concat([...localChunks, centralDir, eocd]);
}

describe('xlsx-parser (zero-dependency OOXML)', () => {
  it('parses deflate-compressed sharedStrings and sparse sheet cells cleanly', () => {
    const sharedStringsXml = `<?xml version="1.0" encoding="UTF-8"?>
      <sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
        <si><t>SKU</t></si>
        <si><t>Descripcion</t></si>
        <si><t>Origen</t></si>
        <si><t>CIF</t></si>
        <si><t>INV-5KW</t></si>
        <si><t>Inversor solar 5kW &amp; MPPT</t></si>
        <si><t>CN</t></si>
      </sst>`;

    const sheetXml = `<?xml version="1.0" encoding="UTF-8"?>
      <worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
        <sheetData>
          <row r="1">
            <c r="A1" t="s"><v>0</v></c>
            <c r="B1" t="s"><v>1</v></c>
            <c r="C1" t="s"><v>2</v></c>
            <c r="D1" t="s"><v>3</v></c>
          </row>
          <row r="2">
            <c r="A2" t="s"><v>4</v></c>
            <c r="B2" t="s"><v>5</v></c>
            <c r="C2" t="s"><v>6</v></c>
            <c r="D2"><v>1450.5</v></c>
          </row>
          <row r="3">
            <c r="B3" t="inlineStr"><is><t>Motor trifasico 10HP</t></is></c>
            <c r="D3"><v>890</v></c>
          </row>
        </sheetData>
      </worksheet>`;

    const zip = createStoredZip([
      { name: 'xl/sharedStrings.xml', content: sharedStringsXml, compress: true },
      { name: 'xl/worksheets/sheet1.xml', content: sheetXml, compress: true },
    ]);

    const rows = parseXlsxBufferToRows(zip);
    expect(rows).toEqual([
      ['SKU', 'Descripcion', 'Origen', 'CIF'],
      ['INV-5KW', 'Inversor solar 5kW & MPPT', 'CN', '1450.5'],
      ['', 'Motor trifasico 10HP', '', '890'],
    ]);

    expect(formatRowsToDelimitedText(rows)).toBe(
      'SKU | Descripcion | Origen | CIF\nINV-5KW | Inversor solar 5kW & MPPT | CN | 1450.5\n | Motor trifasico 10HP |  | 890',
    );
  });

  it('degrades cleanly to [] on non-ZIP or corrupted buffers', () => {
    expect(parseXlsxBufferToRows(new Uint8Array([1, 2, 3, 4]))).toEqual([]);
  });
});
