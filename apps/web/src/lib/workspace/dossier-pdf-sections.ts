import type {
  A2UICalculatorComponent,
  A2UIDossierComponent,
  UserProfileSettings,
} from '@tariffos/shared-types';
import type { PdfDocumentBuilder } from './pdf-writer';

export function drawDossierHeaderMeta(
  doc: PdfDocumentBuilder,
  dossier: A2UIDossierComponent,
  statusText: string,
): void {
  const confidenceText =
    dossier.confidencePct !== undefined
      ? `${dossier.confidenceLevel ?? 'Estimado'} (${dossier.confidencePct}%)`
      : (dossier.confidenceLevel ?? 'No especificado');
  const unitSegment = dossier.statisticalUnit
    ? ` | Unidad Fisica / Estadistica: ${dossier.statisticalUnit}`
    : '';

  doc.drawTextLines(`Confianza: ${confidenceText} | Estado: ${statusText}${unitSegment}`, {
    font: 'F2',
    size: 9.5,
    color: '0.28 0.33 0.41',
  });

  if (dossier.commercialDescription && dossier.commercialDescription !== dossier.officialDescription) {
    doc.addGap(3);
    doc.drawTextLines(`Mercancia declarada (comercial): ${dossier.commercialDescription}`, {
      font: 'F1',
      size: 9.2,
      color: '0.22 0.27 0.35',
    });
  }

  doc.addGap(3);
  doc.drawTextLines(dossier.officialDescription, { font: 'F1', size: 10, lineHeight: 14 });
  if (dossier.confidenceReason) {
    doc.drawTextLines(`Sustento: ${dossier.confidenceReason}`, {
      font: 'F1',
      size: 9,
      color: '0.35 0.40 0.48',
    });
  }
}

export function drawDossierTariffAndExemptionSection(
  doc: PdfDocumentBuilder,
  dossier: A2UIDossierComponent,
  calculator?: A2UICalculatorComponent,
): void {
  const qualifiers: string[] = [];
  if (dossier.tariffExceptionCode) qualifiers.push(`Ex.AEC: ${dossier.tariffExceptionCode}`);
  if (dossier.baseAdValoremPercent !== undefined) {
    qualifiers.push(`AEC Base: ${dossier.baseAdValoremPercent}%`);
  }
  if (dossier.isBK) qualifiers.push('Bien de Capital (BK)');
  if (dossier.isBIT) qualifiers.push('Bien de Informatica y Telecomunicaciones (BIT)');

  if (!calculator && qualifiers.length === 0 && !dossier.activeExemptionSummary) {
    return;
  }

  doc.drawSectionTitle('Liquidación Referencial de Derechos');
  if (calculator) {
    const summary = [
      `Ad Valorem: ${calculator.adValoremPercent}%`,
      `IVA: ${calculator.vatPercent}%`,
      `Tasa Aduanera: ${calculator.customsServiceFeePercent}%`,
      ...(calculator.incoterm ? [`Incoterm: ${calculator.incoterm}`] : []),
      ...(calculator.originCountry ? [`Origen: ${calculator.originCountry}`] : []),
    ].join(' | ');
    doc.drawTextLines(summary, { font: 'F1', size: 9.5 });
  }

  if (qualifiers.length > 0) {
    doc.drawTextLines(`Regimen Arancelario: ${qualifiers.join(' | ')}`, {
      font: 'F1',
      size: 9.2,
      color: '0.22 0.27 0.35',
    });
  }

  if (dossier.activeExemptionSummary) {
    const validSuffix = dossier.activeExemptionValidTo
      ? ` | Vigente hasta: ${dossier.activeExemptionValidTo} (segun fecha de registro DUA)`
      : '';
    doc.drawTextLines(`${dossier.activeExemptionSummary}${validSuffix}`, {
      font: 'F2',
      size: 9,
      color: '0.55 0.32 0.05',
    });
  }
  doc.addGap(6);
}

export function drawDossierAuditAndSignatureFooter(
  doc: PdfDocumentBuilder,
  dossier: A2UIDossierComponent,
  profile: UserProfileSettings,
): void {
  doc.drawRule();
  doc.drawSectionTitle('Firma y Trazabilidad Documental Versionada');
  doc.drawTextLines(`Agente / Clasificador: ${profile.fullName || 'No especificado'}`, {
    size: 9.5,
  });
  doc.drawTextLines(
    `Credencial / Registro: ${profile.brokerLicense || 'Pendiente de registro'}`,
    { size: 9.5 },
  );

  const traceParts = [
    `Expediente: ${dossier.id}`,
    `Version: v${dossier.artifactVersion ?? 1}`,
    ...(dossier.datasetVersion ? [`Base normativa: ${dossier.datasetVersion}`] : []),
  ];
  doc.drawTextLines(traceParts.join(' | '), {
    font: 'F1',
    size: 8.5,
    color: '0.35 0.40 0.48',
  });

  if (dossier.sourceSha256) {
    doc.drawTextLines(`Hash SHA-256 fuente: ${dossier.sourceSha256}`, {
      font: 'F3',
      size: 8,
      color: '0.35 0.40 0.48',
    });
  }
}
