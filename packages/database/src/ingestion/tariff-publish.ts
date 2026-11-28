import { clearPrimedCountries } from '../country';
import { Prisma, type PrismaClient } from '../generated/client';
import type { NormalizedTariffRow } from './tariff-parser';

export type PrismaTx = Parameters<Parameters<PrismaClient['$transaction']>[0]>[0];

const BULK_UPSERT_CHUNK_SIZE = 500;

export interface PublishTariffScheduleInput {
  countryCode: string;
  rows: NormalizedTariffRow[];
  validFromDate: Date;
  datasetVersion?: string | null;
}

async function upsertRowsBulkSql(
  tx: PrismaTx,
  countryCode: string,
  rows: readonly NormalizedTariffRow[],
  validFromDate: Date,
): Promise<void> {
  for (let i = 0; i < rows.length; i += BULK_UPSERT_CHUNK_SIZE) {
    const chunk = rows.slice(i, i + BULK_UPSERT_CHUNK_SIZE);
    const ids = chunk.map((r) => `${countryCode}:${r.hsCode}`);
    const countryCodes = chunk.map(() => countryCode);
    const hsCodes = chunk.map((r) => r.hsCode);
    const descriptions = chunk.map((r) => r.description);
    const adValorems = chunk.map((r) => r.adValorem);
    const baseAdValorems = chunk.map((r) => r.baseAdValorem ?? null);
    const exceptionCodes = chunk.map((r) => r.tariffExceptionCode ?? null);
    const statisticalUnits = chunk.map((r) => r.statisticalUnit ?? null);
    const ivas = chunk.map((r) => r.iva);
    const customsFees = chunk.map((r) => r.customsFee);
    const legalNotesList = chunk.map((r) => r.legalNotes);
    const isBKs = chunk.map((r) => r.isBK);
    const isBITs = chunk.map((r) => r.isBIT);
    const validFroms = chunk.map(() => validFromDate);

    await tx.$executeRaw(Prisma.sql`
      INSERT INTO "NationalTariff" (
        "id", "countryCode", "hsCode", "description", "adValorem", "baseAdValorem",
        "tariffExceptionCode", "statisticalUnit", "iva", "customsFee",
        "legalNotes", "isBK", "isBIT", "isActive", "isDerogated", "validFromDate", "validToDate", "updatedAt"
      )
      SELECT
        u.id, u.country_code, u.hs_code, u.description, u.ad_valorem, u.base_ad_valorem,
        u.exception_code, u.statistical_unit, u.iva, u.customs_fee,
        u.legal_notes, u.is_bk, u.is_bit, true, false, u.valid_from, NULL, now()
      FROM UNNEST(
        ${ids}::text[], ${countryCodes}::text[], ${hsCodes}::text[], ${descriptions}::text[],
        ${adValorems}::double precision[], ${baseAdValorems}::double precision[],
        ${exceptionCodes}::text[], ${statisticalUnits}::text[],
        ${ivas}::double precision[], ${customsFees}::double precision[],
        ${legalNotesList}::text[], ${isBKs}::boolean[], ${isBITs}::boolean[], ${validFroms}::timestamp(3)[]
      ) AS u(
        id, country_code, hs_code, description, ad_valorem, base_ad_valorem,
        exception_code, statistical_unit, iva, customs_fee, legal_notes, is_bk, is_bit, valid_from
      )
      ON CONFLICT ("countryCode", "hsCode") DO UPDATE SET
        "description" = EXCLUDED."description",
        "adValorem" = EXCLUDED."adValorem",
        "baseAdValorem" = EXCLUDED."baseAdValorem",
        "tariffExceptionCode" = EXCLUDED."tariffExceptionCode",
        "statisticalUnit" = EXCLUDED."statisticalUnit",
        "iva" = EXCLUDED."iva",
        "customsFee" = EXCLUDED."customsFee",
        "legalNotes" = EXCLUDED."legalNotes",
        "isBK" = EXCLUDED."isBK",
        "isBIT" = EXCLUDED."isBIT",
        "isActive" = true,
        "isDerogated" = false,
        "validFromDate" = EXCLUDED."validFromDate",
        "validToDate" = NULL,
        "updatedAt" = now()
    `);
  }
}

export async function publishTariffScheduleRows(
  tx: PrismaTx,
  input: PublishTariffScheduleInput,
): Promise<{ upsertedCount: number; derogatedTariffCount: number }> {
  const derogationDate = new Date(input.validFromDate.getTime() - 1);
  const incomingCodes = new Set(input.rows.map((r) => r.hsCode));

  const existingActive = await tx.nationalTariff.findMany({
    where: {
      countryCode: input.countryCode,
      isActive: true,
      isDerogated: false,
    },
    select: { hsCode: true },
  });

  const omittedCodes = existingActive
    .map((r) => r.hsCode)
    .filter((code) => !incomingCodes.has(code));

  let derogatedTariffCount = 0;
  if (omittedCodes.length > 0) {
    const updated = await tx.nationalTariff.updateMany({
      where: {
        countryCode: input.countryCode,
        hsCode: { in: omittedCodes },
      },
      data: {
        isActive: false,
        isDerogated: true,
        validToDate: derogationDate,
      },
    });
    derogatedTariffCount = updated.count;
  }

  if (input.rows.length > 0) {
    if (typeof tx.$executeRaw === 'function') {
      await upsertRowsBulkSql(tx, input.countryCode, input.rows, input.validFromDate);
    } else {
      for (const row of input.rows) {
        await tx.nationalTariff.upsert({
          where: { countryCode_hsCode: { countryCode: input.countryCode, hsCode: row.hsCode } },
          create: {
            countryCode: input.countryCode,
            hsCode: row.hsCode,
            description: row.description,
            adValorem: row.adValorem,
            baseAdValorem: row.baseAdValorem ?? null,
            tariffExceptionCode: row.tariffExceptionCode ?? null,
            statisticalUnit: row.statisticalUnit ?? null,
            iva: row.iva,
            customsFee: row.customsFee,
            legalNotes: row.legalNotes,
            isBK: row.isBK,
            isBIT: row.isBIT,
            isActive: true,
            isDerogated: false,
            validFromDate: input.validFromDate,
            validToDate: null,
          },
          update: {
            description: row.description,
            adValorem: row.adValorem,
            baseAdValorem: row.baseAdValorem ?? null,
            tariffExceptionCode: row.tariffExceptionCode ?? null,
            statisticalUnit: row.statisticalUnit ?? null,
            iva: row.iva,
            customsFee: row.customsFee,
            legalNotes: row.legalNotes,
            isBK: row.isBK,
            isBIT: row.isBIT,
            isActive: true,
            isDerogated: false,
            validFromDate: input.validFromDate,
            validToDate: null,
          },
        });
      }
    }
  }

  if (input.datasetVersion?.trim()) {
    await tx.country.update({
      where: { code: input.countryCode },
      data: { datasetVersion: input.datasetVersion.trim() },
    });
  }

  clearPrimedCountries();

  return {
    upsertedCount: input.rows.length,
    derogatedTariffCount,
  };
}
