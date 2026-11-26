import { clearPrimedCountries } from '../country';
import type { PrismaClient } from '../generated/client';
import type { NormalizedTariffRow } from './tariff-parser';

export type PrismaTx = Parameters<Parameters<PrismaClient['$transaction']>[0]>[0];

export interface PublishTariffScheduleInput {
  countryCode: string;
  rows: NormalizedTariffRow[];
  validFromDate: Date;
  datasetVersion?: string | null;
}

/**
 * Applies a staged TARIFF_SCHEDULE into `NationalTariff` atomically:
 * upserts incoming rows, marks omitted active codes as derogated, updates
 * `Country.datasetVersion`, and clears the in-memory country cache.
 */
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

  for (const row of input.rows) {
    await tx.nationalTariff.upsert({
      where: {
        countryCode_hsCode: {
          countryCode: input.countryCode,
          hsCode: row.hsCode,
        },
      },
      create: {
        countryCode: input.countryCode,
        hsCode: row.hsCode,
        description: row.description,
        adValorem: row.adValorem,
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
