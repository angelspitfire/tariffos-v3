import type {
  A2UICalculatorComponent,
  A2UICanvasComponent,
  A2UIDossierComponent,
  UserProfileSettings,
} from '@tariffos/shared-types';
import { PdfDocumentBuilder } from './pdf-writer';
import type { WorkspaceToast } from './types';

const REVIEW_STATUS_LABELS: Record<NonNullable<A2UIDossierComponent['reviewStatus']>, string> = {
  auto_approved: 'Aprobado automáticamente',
  approved: 'Aprobado por agente aduanal',
  in_review: 'En revisión técnica',
  pending_review: 'Pendiente de revisión',
  changes_requested: 'Cambios solicitados',
};

export function buildDossierPdfFilename(dossier: A2UIDossierComponent): string {
  const safeCode = dossier.hsCode.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'dictamen';
  return `Dictamen-TariffOS-${safeCode}.pdf`;
}

export function buildDossierPdfBytes(
  dossier: A2UIDossierComponent,
  profile: UserProfileSettings,
  calculator?: A2UICalculatorComponent,
): Uint8Array {
  const doc = new PdfDocumentBuilder();
  const generatedAt = new Date().toISOString().slice(0, 10);

  doc.drawBanner(
    'TARIFFOS - DICTAMEN TECNICO ARANCELARIO',
    `${dossier.jurisdictionName} | Emitido: ${generatedAt}`,
  );

  doc.drawTextLines(`Código Arancelario: ${dossier.hsCode}`, {
    font: 'F3',
    size: 13,
    color: '0.059 0.090 0.165',
    lineHeight: 18,
  });

  const confidenceText = dossier.confidencePct !== undefined
    ? `${dossier.confidenceLevel ?? 'Estimado'} (${dossier.confidencePct}%)`
    : (dossier.confidenceLevel ?? 'No especificado');
  const statusText = dossier.reviewStatus ? REVIEW_STATUS_LABELS[dossier.reviewStatus] : 'Borrador';
  doc.drawTextLines(`Confianza: ${confidenceText} | Estado: ${statusText}`, {
    font: 'F2',
    size: 9.5,
    color: '0.28 0.33 0.41',
  });

  doc.addGap(4);
  doc.drawTextLines(dossier.officialDescription, { font: 'F1', size: 10, lineHeight: 14 });
  if (dossier.confidenceReason) {
    doc.drawTextLines(`Sustento: ${dossier.confidenceReason}`, {
      font: 'F1',
      size: 9,
      color: '0.35 0.40 0.48',
    });
  }

  doc.addGap(6);
  doc.drawRule();

  if (calculator) {
    doc.drawSectionTitle('Liquidación Referencial de Derechos');
    const summary = [
      `Ad Valorem: ${calculator.adValoremPercent}%`,
      `IVA: ${calculator.vatPercent}%`,
      `Tasa Aduanera: ${calculator.customsServiceFeePercent}%`,
      `Incoterm: ${calculator.incoterm}`,
      `Origen: ${calculator.originCountry}`,
    ].join(' | ');
    doc.drawTextLines(summary, { font: 'F1', size: 9.5 });
    doc.addGap(6);
  }

  if (dossier.rgiSteps.length > 0) {
    doc.drawSectionTitle('Recorrido RGI (Reglas Generales de Interpretación)');
    for (const step of dossier.rgiSteps) {
      doc.drawTextLines(`${step.rule}: ${step.application}`, { indent: 8, size: 9.2 });
    }
    doc.addGap(6);
  }

  if (dossier.technicalSpecs.length > 0) {
    doc.drawSectionTitle('Especificaciones Merceológicas');
    for (const spec of dossier.technicalSpecs) {
      doc.drawTextLines(`- ${spec.key}: ${spec.value}`, { indent: 8, size: 9.2 });
    }
    doc.addGap(6);
  }

  if (dossier.permits.length > 0) {
    doc.drawSectionTitle(`Permisos y Controles OGA (${dossier.permits.length})`);
    for (const permit of dossier.permits) {
      doc.drawTextLines(`- [${permit.code}] ${permit.name} (${permit.organism})`, {
        indent: 8,
        size: 9.2,
      });
    }
    doc.addGap(6);
  }

  if (dossier.legalNotes.length > 0) {
    doc.drawSectionTitle('Notas Legales y Sustento Normativo');
    for (const note of dossier.legalNotes) {
      doc.drawTextLines(`• ${note}`, { indent: 8, size: 9.2 });
    }
    doc.addGap(6);
  }

  if (dossier.rejectedAlternatives && dossier.rejectedAlternatives.length > 0) {
    doc.drawSectionTitle('Alternativas Evaluadas y Descartadas');
    for (const alt of dossier.rejectedAlternatives) {
      doc.drawTextLines(`- ${alt.hsCode}: ${alt.reason}`, { indent: 8, size: 9.2 });
    }
    doc.addGap(6);
  }

  doc.drawRule();
  doc.drawSectionTitle('Firma y Validación Profesional');
  doc.drawTextLines(`Agente / Clasificador: ${profile.fullName || 'No especificado'}`, { size: 9.5 });
  doc.drawTextLines(`Credencial / Registro: ${profile.brokerLicense || 'Pendiente de registro'}`, {
    size: 9.5,
  });

  return doc.toBytes();
}

export function buildDossierPdfBlob(
  dossier: A2UIDossierComponent,
  profile: UserProfileSettings,
  calculator?: A2UICalculatorComponent,
): Blob {
  const bytes = buildDossierPdfBytes(dossier, profile, calculator);
  return new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
}

export function downloadDossierPdf(
  dossier: A2UIDossierComponent,
  profile: UserProfileSettings,
  calculator?: A2UICalculatorComponent,
): string {
  const filename = buildDossierPdfFilename(dossier);
  const blob = buildDossierPdfBlob(dossier, profile, calculator);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  return filename;
}

export function exportWorkspaceDossierPdf(
  components: readonly A2UICanvasComponent[],
  profile: UserProfileSettings,
  pushToast: (title: string, variant?: WorkspaceToast['variant']) => void,
): void {
  const dossier = components.find((c): c is A2UIDossierComponent => c.type === 'dossier');
  if (!dossier) {
    pushToast('No hay un dictamen activo para descargar en PDF.', 'info');
    return;
  }
  const calculator = components.find((c): c is A2UICalculatorComponent => c.type === 'calculator');
  downloadDossierPdf(dossier, profile, calculator);
  pushToast('Dictamen PDF descargado correctamente.', 'success');
}
