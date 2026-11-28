import { REGIMEN_REQUIREMENTS } from './ve-regimen-requirements.js';
import {
  resolveEffectiveTariffDuty,
  sanitizeStatisticalUnit,
} from '../ingestion/effective-duty.js';

const KNOWN_REGIMEN_TYPOS: Record<string, number[]> = {
  '0901120000': [5, 6, 12],
};

export interface ArancelArtifactRow {
  code: string;
  digits: string;
  digitCount: number;
  guiones: number;
  description: string;
  path: Array<{ code: string; description: string }>;
  aec: string | null;
  exAec: string | null;
  importacionRaw: string | null;
  exportacionRaw: string | null;
  regimenImportacion: number[];
  regimenExportacion: number[];
  unidad: string | null;
  page: number;
}

export interface ArancelArtifact {
  schemaVersion: string;
  instrument: string;
  gazette: string;
  instrumentDate: string;
  publishedDate: string;
  sourceFile?: string;
  rows: ArancelArtifactRow[];
}

function buildLegalNotes(
  row: ArancelArtifactRow,
  exceptionCode: string | null,
  unit: string | null,
): string | null {
  const parts: string[] = [];
  if (exceptionCode) parts.push(`Ex.AEC: ${exceptionCode}`);
  if (row.regimenImportacion.length > 0) {
    parts.push(`Régimen Legal Importación: ${row.regimenImportacion.join(',')}`);
  }
  if (row.regimenExportacion.length > 0) {
    parts.push(`Régimen Legal Exportación: ${row.regimenExportacion.join(',')}`);
  }
  if (unit) parts.push(`Unidad: ${unit}`);
  return parts.length > 0 ? parts.join('. ') : null;
}

export function buildVeSeedPayloads(
  artifact: ArancelArtifact,
  regimenText: Map<number, string>,
  sourceFile: string,
) {
  const best = new Map<string, ArancelArtifactRow>();
  for (const row of artifact.rows) {
    const existing = best.get(row.digits);
    const score = (r: ArancelArtifactRow) =>
      r.description.length + (r.aec ? 100 : 0) + (r.regimenImportacion.length > 0 ? 100 : 0);
    if (!existing || score(row) > score(existing)) best.set(row.digits, row);
  }
  const rows = [...best.values()];
  const validFrom = new Date(`${artifact.publishedDate}T00:00:00.000Z`);
  const decree5197Expiry = new Date('2026-12-31T23:59:59.000Z');

  const tariffs: Array<Record<string, unknown>> = [];
  const exemptionRules: Array<{
    countryCode: string;
    hsCode: string;
    programCode: string;
    title: string;
    decreeRef: string;
    gazetteRef: string;
    exemptAdValoremPct: number;
    exemptVatPct: number | null;
    requiredPermitCode: string;
    conditionsSummary: string;
    validFromDate: Date;
    validToDate: Date;
    isActive: boolean;
  }> = [];
  const exemptions: Array<{
    countryCode: string;
    legalType: 'EXEMPTION';
    hierarchyPath: string;
    content: string;
    sourceFile: string;
    officialDocumentNumber: string;
    decreeNumber: string;
    validFromDate: Date;
    validToDate: null;
    isDerogated: boolean;
    status: 'PUBLISHED';
  }> = [];
  const unknownRegimens = new Set<number>();

  for (const row of rows) {
    const duty = resolveEffectiveTariffDuty({ aec: row.aec, exAec: row.exAec });
    const statisticalUnit = sanitizeStatisticalUnit(row.unidad);
    const regimenCodes = KNOWN_REGIMEN_TYPOS[row.digits] ?? row.regimenImportacion;
    const requirements: Array<Record<string, unknown>> = [];

    for (const code of [...new Set(regimenCodes)].sort((a, b) => a - b)) {
      const projection = REGIMEN_REQUIREMENTS[code];
      if (!projection) {
        unknownRegimens.add(code);
        continue;
      }
      requirements.push({
        regulatoryEntity: projection.regulatoryEntity,
        permitType: projection.permitType,
        mandatoryForClearance: true,
        friendlyExplanation: `Régimen Legal ${code}: ${regimenText.get(code) ?? projection.permitType}`.trim(),
      });
    }

    tariffs.push({
      countryCode: 'VE',
      hsCode: row.digits,
      description: String(row.description ?? '').replace(/\s+/g, ' ').trim(),
      adValorem: duty.effectiveRate,
      baseAdValorem: duty.baseRate,
      tariffExceptionCode: duty.exceptionCode,
      statisticalUnit,
      iva: 16.0,
      customsFee: 1.0,
      legalNotes: buildLegalNotes(row, duty.exceptionCode, statisticalUnit),
      isBK: duty.isBK,
      isBIT: duty.isBIT,
      isActive: true,
      isDerogated: false,
      validFromDate: validFrom,
      validToDate: null,
      ...(requirements.length > 0 ? { requirements } : {}),
    });

    if (regimenCodes.includes(9) && row.digitCount === 10) {
      exemptionRules.push({
        countryCode: 'VE',
        hsCode: row.digits,
        programCode: 'DEC-5197-COMEX',
        title: 'Exoneración condicionada a Certificado COMEX (Apéndice I)',
        decreeRef: 'Decreto N° 5.197',
        gazetteRef: 'Gaceta Oficial Extraordinaria N° 6.952',
        exemptAdValoremPct: 90,
        exemptVatPct: 90,
        requiredPermitCode: 'RL-9',
        conditionsSummary:
          'Requiere Certificado de Exoneración emitido por COMEX (Régimen Legal 9). Régimen aplicable según fecha de registro de la declaración de aduanas (DUA).',
        validFromDate: validFrom,
        validToDate: decree5197Expiry,
        isActive: true,
      });
    }

    if (duty.isBK || duty.isBIT) {
      exemptions.push({
        countryCode: 'VE',
        legalType: 'EXEMPTION',
        hierarchyPath: row.code,
        content: `De conformidad con el Artículo 8 del ${artifact.instrument}, las mercancías clasificadas bajo este código arancelario identificadas como ${duty.isBK ? 'BK (Bien de Capital)' : 'BIT (Bien de Informática y Telecomunicaciones)'} gozarán de una alícuota Ad Valorem de 0% sujeta al Certificado de Exoneración correspondiente (COMEX).`,
        sourceFile,
        officialDocumentNumber: artifact.gazette,
        decreeNumber: artifact.instrument,
        validFromDate: validFrom,
        validToDate: null,
        isDerogated: false,
        status: 'PUBLISHED',
      });
    }
  }

  return { rows, tariffs, exemptionRules, exemptions, unknownRegimens };
}
