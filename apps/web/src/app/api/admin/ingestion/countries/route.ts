import { primeCountry, prisma, recordAdminAudit } from '@tariffos/database';
import {
  CountryConfigInputSchema,
  type CountryIngestionSummary,
} from '@tariffos/shared-types';
import { parseJsonBody, requireAdmin } from '@/lib/admin/http-helpers';
import {
  listOfflineCountriesSummary,
  upsertOfflineCountry,
} from '@/lib/admin/ingestion-offline-store';
import { appendOfflineAudit } from '@/lib/admin/offline-store';
import { isCloudModeEnabled } from '@/lib/runtime-config';

export async function GET(): Promise<Response> {
  const guard = await requireAdmin('ingestion:read');
  if (!guard.ok) return guard.response;

  if (!isCloudModeEnabled()) {
    return Response.json(
      { mode: 'offline', countries: listOfflineCountriesSummary() },
      { status: 200 },
    );
  }

  const [countries, docGroups, tariffGroups, embeddingGroups] = await Promise.all([
    prisma.country.findMany({ orderBy: { code: 'asc' } }),
    prisma.legalKnowledgeParent.groupBy({
      by: ['countryCode', 'status'],
      _count: { _all: true },
    }),
    prisma.nationalTariff.groupBy({
      by: ['countryCode'],
      where: { isActive: true, isDerogated: false },
      _count: { _all: true },
    }),
    prisma.tariffNodeEmbedding.groupBy({
      by: ['countryCode'],
      _count: { _all: true },
    }),
  ]);

  const tariffMap = new Map(tariffGroups.map((g) => [g.countryCode, g._count._all]));
  const embedMap = new Map(embeddingGroups.map((g) => [g.countryCode, g._count._all]));

  const summaries: CountryIngestionSummary[] = [...countries]
    .sort((a, b) => (a.code === 'VE' ? -1 : b.code === 'VE' ? 1 : a.code.localeCompare(b.code)))
    .map((country) => {
      const forCountry = docGroups.filter((d) => d.countryCode === country.code);
      const countStatus = (status: string) =>
        forCountry.find((d) => d.status === status)?._count._all ?? 0;

      return {
        code: country.code,
        name: country.name,
        legislation: country.legislation,
        nomenclatureDigits: country.nomenclatureDigits,
        codeGrouping: country.codeGrouping,
        datasetVersion: country.datasetVersion,
        isActive: country.isActive,
        publishedDocuments: countStatus('PUBLISHED'),
        draftDocuments: countStatus('DRAFT'),
        derogatedDocuments: countStatus('DEROGATED'),
        activeTariffs: tariffMap.get(country.code) ?? 0,
        embeddedTariffs: embedMap.get(country.code) ?? 0,
      };
    });

  return Response.json({ mode: 'cloud', countries: summaries }, { status: 200 });
}

export async function POST(request: Request): Promise<Response> {
  const guard = await requireAdmin('ingestion:manage');
  if (!guard.ok) return guard.response;

  const rawBody = await parseJsonBody(request);
  if (rawBody === null) {
    return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const parsed = CountryConfigInputSchema.safeParse(rawBody);
  if (!parsed.success) {
    return Response.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const input = parsed.data;

  if (!isCloudModeEnabled()) {
    const saved = upsertOfflineCountry(input);
    appendOfflineAudit({
      actorUserId: guard.context.userId,
      actorEmail: guard.context.userEmail,
      actorRole: guard.context.role,
      action: 'ingestion.country_upserted',
      targetType: 'country',
      targetId: saved.code,
      tenantId: null,
      beforeState: null,
      afterState: saved,
      reason: `Configuración de país ${saved.code} (${saved.nomenclatureDigits} dígitos)`,
    });
    return Response.json({ mode: 'offline', country: saved }, { status: 201 });
  }

  const saved = await prisma.$transaction(async (tx) => {
    const row = await tx.country.upsert({
      where: { code: input.code },
      create: {
        code: input.code,
        name: input.name,
        legislation: input.legislation,
        nomenclatureDigits: input.nomenclatureDigits,
        codeGrouping: input.codeGrouping,
        datasetVersion: input.datasetVersion ?? null,
        isActive: input.isActive,
      },
      update: {
        name: input.name,
        legislation: input.legislation,
        nomenclatureDigits: input.nomenclatureDigits,
        codeGrouping: input.codeGrouping,
        datasetVersion: input.datasetVersion ?? null,
        isActive: input.isActive,
      },
    });

    await recordAdminAudit(tx, {
      actorUserId: guard.context.userId,
      actorEmail: guard.context.userEmail,
      actorRole: guard.context.role,
      action: 'ingestion.country_upserted',
      targetType: 'country',
      targetId: row.code,
      afterState: {
        code: row.code,
        name: row.name,
        nomenclatureDigits: row.nomenclatureDigits,
        codeGrouping: row.codeGrouping,
      },
      reason: `Configuración de país ${row.code}`,
    });
    return row;
  });

  primeCountry(saved);
  return Response.json({ mode: 'cloud', country: saved }, { status: 201 });
}
