import { prisma } from '@tariffos/database';
import { SkuPrecedentSchema, type SkuPrecedent } from '@tariffos/shared-types';
import { resolveCloudTenantContext } from '@/lib/agent/cloud-session';
import { saveProductMasterEmbedding } from '@/lib/agent/product-master-embedding';

interface ProductMetadata {
  precedentId?: string;
  sku?: string;
  normalizedSku?: string;
  title?: string;
  jurisdictionId?: string;
  adValoremPercent?: number;
  vatPercent?: number;
  legalRegime?: string;
  originCountry?: string;
  incoterm?: SkuPrecedent['incoterm'];
  approvedBy?: string;
  reviewStatus?: SkuPrecedent['reviewStatus'];
  usageCount?: number;
}

function mapProductToPrecedent(row: {
  id: string;
  description: string;
  hsCode: string | null;
  reasoning: string | null;
  metadata: unknown;
  createdAt: Date;
  updatedAt: Date;
}): SkuPrecedent {
  const meta = (row.metadata && typeof row.metadata === 'object' ? row.metadata : {}) as ProductMetadata;
  const sku = meta.sku ?? row.id;
  return {
    id: meta.precedentId ?? row.id,
    sku,
    normalizedSku: meta.normalizedSku ?? sku.toUpperCase(),
    title: meta.title ?? row.description.slice(0, 80),
    description: row.description,
    hsCode: row.hsCode ?? '0000.00.00.00',
    jurisdictionId: meta.jurisdictionId ?? 've-seniat',
    adValoremPercent: meta.adValoremPercent ?? 0,
    vatPercent: meta.vatPercent ?? 16,
    legalRegime: meta.legalRegime ?? 'General',
    ...(meta.originCountry ? { originCountry: meta.originCountry } : {}),
    ...(meta.incoterm ? { incoterm: meta.incoterm } : {}),
    ...(row.reasoning ? { notes: row.reasoning } : {}),
    ...(meta.approvedBy ? { approvedBy: meta.approvedBy } : {}),
    reviewStatus: meta.reviewStatus ?? 'approved',
    usageCount: meta.usageCount ?? 1,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function GET(): Promise<Response> {
  const auth = await resolveCloudTenantContext();
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

  const rows = await prisma.productMaster.findMany({
    where: { tenantId: auth.context.tenantId },
    orderBy: { updatedAt: 'desc' },
    take: 200,
  });

  return Response.json({
    precedents: rows.filter((r) => Boolean(r.hsCode)).map(mapProductToPrecedent),
  });
}

export async function PUT(request: Request): Promise<Response> {
  const auth = await resolveCloudTenantContext();
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const parsed = SkuPrecedentSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 400 });
  }

  const p = parsed.data;
  const tenantId = auth.context.tenantId;
  const metadata = {
    precedentId: p.id,
    sku: p.sku,
    normalizedSku: p.normalizedSku,
    title: p.title,
    jurisdictionId: p.jurisdictionId,
    adValoremPercent: p.adValoremPercent,
    vatPercent: p.vatPercent,
    legalRegime: p.legalRegime,
    originCountry: p.originCountry ?? null,
    incoterm: p.incoterm ?? null,
    approvedBy: p.approvedBy ?? null,
    reviewStatus: p.reviewStatus,
    usageCount: p.usageCount,
  };

  const saved = await prisma.productMaster.upsert({
    where: { tenantId_description: { tenantId, description: p.description } },
    update: {
      hsCode: p.hsCode,
      confidence: 0.99,
      reasoning: p.notes ?? null,
      metadata,
    },
    create: {
      id: p.id,
      tenantId,
      description: p.description,
      hsCode: p.hsCode,
      confidence: 0.99,
      reasoning: p.notes ?? null,
      metadata,
    },
    select: { id: true },
  });

  await saveProductMasterEmbedding(saved.id, p.description);

  return Response.json({ ok: true, id: saved.id });
}

export async function DELETE(request: Request): Promise<Response> {
  const auth = await resolveCloudTenantContext();
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

  const id = new URL(request.url).searchParams.get('id')?.trim();
  if (!id) return Response.json({ error: 'Missing id parameter' }, { status: 400 });

  await prisma.productMaster.deleteMany({
    where: { id, tenantId: auth.context.tenantId },
  });
  return Response.json({ ok: true });
}
