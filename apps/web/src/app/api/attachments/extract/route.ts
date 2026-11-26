import { PdfTextAdapter } from '@tariffos/agent';
import { resolveCloudTenantContext } from '@/lib/agent/cloud-session';
import { formatRowsToDelimitedText, parseXlsxBufferToRows } from '@/lib/inngest/xlsx-parser';
import { isCloudModeEnabled } from '@/lib/runtime-config';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MAX_PDF_PAGES = 15;
const MAX_EXTRACTED_CHARS = 48_000;
const ALLOWED_IMAGE_MIME = new Set(['image/png', 'image/jpeg', 'image/webp']);
const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export async function POST(request: Request): Promise<Response> {
  if (isCloudModeEnabled()) {
    const auth = await resolveCloudTenantContext();
    if (!auth.ok) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: 'Invalid multipart form payload' }, { status: 400 });
  }

  const entry = formData.get('file');
  if (!(entry instanceof File)) {
    return Response.json({ error: 'Missing file upload field' }, { status: 400 });
  }

  if (entry.size > MAX_UPLOAD_BYTES) {
    return Response.json({ error: 'File exceeds 10 MB limit' }, { status: 413 });
  }

  const mime = entry.type.toLowerCase();
  const nameLower = entry.name.toLowerCase();

  if (mime === XLSX_MIME || nameLower.endsWith('.xlsx')) {
    const rows = parseXlsxBufferToRows(new Uint8Array(await entry.arrayBuffer()));
    return Response.json({
      kind: 'xlsx',
      text: formatRowsToDelimitedText(rows).slice(0, MAX_EXTRACTED_CHARS),
      rowCount: rows.length,
    });
  }

  if (mime === 'application/pdf' || nameLower.endsWith('.pdf')) {
    const buffer = Buffer.from(await entry.arrayBuffer());
    const dataUrl = `data:application/pdf;base64,${buffer.toString('base64')}`;
    const adapter = new PdfTextAdapter();
    const pages: string[] = [];

    for (let page = 1; page <= MAX_PDF_PAGES; page += 1) {
      const doc = await adapter.extract({
        kind: 'text',
        ref: dataUrl,
        page,
      });
      if (!doc?.text?.trim()) break;
      pages.push(doc.text.trim());
    }

    return Response.json({
      kind: 'pdf',
      text: pages.join('\n\n').slice(0, MAX_EXTRACTED_CHARS),
      pagesExtracted: pages.length,
    });
  }

  if (ALLOWED_IMAGE_MIME.has(mime)) {
    if (entry.size > MAX_IMAGE_BYTES) {
      return Response.json({ error: 'Image exceeds 4 MB limit' }, { status: 413 });
    }
    const buffer = Buffer.from(await entry.arrayBuffer());
    return Response.json({
      kind: 'image',
      mimeType: mime,
      dataUrl: `data:${mime};base64,${buffer.toString('base64')}`,
    });
  }

  if (mime.startsWith('text/') || mime === 'application/json' || /\.(txt|csv|json)$/i.test(nameLower)) {
    const text = (await entry.text()).slice(0, MAX_EXTRACTED_CHARS);
    return Response.json({ kind: 'text', text });
  }

  return Response.json(
    { error: `Unsupported attachment type: ${entry.type || entry.name}` },
    { status: 415 },
  );
}
