// @vitest-environment node
import { deflateRawSync } from 'node:zlib';
import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  resolveCloudTenantContext: vi.fn(),
  pdfExtract: vi.fn(),
}));

vi.mock('@tariffos/agent', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tariffos/agent')>();
  return {
    ...actual,
    PdfTextAdapter: class {
      extract = mocks.pdfExtract;
    },
  };
});

vi.mock('@/lib/agent/cloud-session', () => ({
  resolveCloudTenantContext: mocks.resolveCloudTenantContext,
}));

import { POST } from './route';

describe('POST /api/attachments/extract', () => {
  const originalCloud = process.env.NEXT_PUBLIC_CLOUD_MODE;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'false';
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    if (originalCloud === undefined) delete process.env.NEXT_PUBLIC_CLOUD_MODE;
    else process.env.NEXT_PUBLIC_CLOUD_MODE = originalCloud;
  });

  it('enforces cloud authentication when NEXT_PUBLIC_CLOUD_MODE is true', async () => {
    vi.stubEnv('NEXT_PUBLIC_CLOUD_MODE', 'true');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key-123');
    mocks.resolveCloudTenantContext.mockResolvedValue({
      ok: false,
      status: 401,
      error: 'Authentication required',
    });

    const form = new FormData();
    form.append('file', new File(['hello'], 'spec.txt', { type: 'text/plain' }));
    const req = new NextRequest('http://localhost/api/attachments/extract', {
      method: 'POST',
      body: form,
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('extracts PDF text across pages using PdfTextAdapter', async () => {
    mocks.pdfExtract
      .mockResolvedValueOnce({ text: 'Página 1: Inversor solar 5kW MPPT 48V', claims: [], reader: 'text-layer', source: {} })
      .mockResolvedValueOnce({ text: 'Página 2: Eficiencia 97.6% IP65', claims: [], reader: 'text-layer', source: {} })
      .mockResolvedValueOnce(null);

    const form = new FormData();
    form.append('file', new File([new Uint8Array([0x25, 0x50, 0x44, 0x46])], 'ficha.pdf', { type: 'application/pdf' }));
    const req = new NextRequest('http://localhost/api/attachments/extract', {
      method: 'POST',
      body: form,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = (await res.json()) as { kind: string; text: string; pagesExtracted: number };
    expect(json.kind).toBe('pdf');
    expect(json.pagesExtracted).toBe(2);
    expect(json.text).toContain('Inversor solar 5kW');
    expect(json.text).toContain('Eficiencia 97.6%');
  });

  it('returns base64 dataUrl for image attachments', async () => {
    const form = new FormData();
    form.append('file', new File([new Uint8Array([1, 2, 3])], 'placa.png', { type: 'image/png' }));
    const req = new NextRequest('http://localhost/api/attachments/extract', {
      method: 'POST',
      body: form,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = (await res.json()) as { kind: string; mimeType: string; dataUrl: string };
    expect(json.kind).toBe('image');
    expect(json.mimeType).toBe('image/png');
    expect(json.dataUrl).toMatch(/^data:image\/png;base64,/);
  });

  it('extracts delimited rows from .xlsx spreadsheet attachments', async () => {
    const sheetXml = `<?xml version="1.0"?><worksheet><sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>SKU</t></is></c><c r="B1" t="inlineStr"><is><t>Descripcion</t></is></c></row><row r="2"><c r="A2" t="inlineStr"><is><t>MTR-5</t></is></c><c r="B2" t="inlineStr"><is><t>Motor 5HP</t></is></c></row></sheetData></worksheet>`;
    const nameBuf = Buffer.from('xl/worksheets/sheet1.xml', 'utf8');
    const rawBuf = Buffer.from(sheetXml, 'utf8');
    const compBuf = deflateRawSync(rawBuf);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(8, 8);
    local.writeUInt32LE(compBuf.length, 18);
    local.writeUInt32LE(rawBuf.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(8, 10);
    central.writeUInt32LE(compBuf.length, 20);
    central.writeUInt32LE(rawBuf.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    const offset = 30 + nameBuf.length + compBuf.length;
    const eocd = Buffer.alloc(22);
    eocd.writeUInt32LE(0x06054b50, 0);
    eocd.writeUInt16LE(1, 8);
    eocd.writeUInt16LE(1, 10);
    eocd.writeUInt32LE(46 + nameBuf.length, 12);
    eocd.writeUInt32LE(offset, 16);
    const xlsxBytes = Buffer.concat([local, nameBuf, compBuf, central, nameBuf, eocd]);

    const form = new FormData();
    form.append(
      'file',
      new File([xlsxBytes], 'lote.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
    );
    const req = new NextRequest('http://localhost/api/attachments/extract', {
      method: 'POST',
      body: form,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = (await res.json()) as { kind: string; text: string; rowCount: number };
    expect(json.kind).toBe('xlsx');
    expect(json.rowCount).toBe(2);
    expect(json.text).toContain('MTR-5 | Motor 5HP');
  });
});
