import type { A2UIDossierComponent } from '@tariffos/shared-types';
import type { WorkspaceMessage } from './types';

export interface ThreadArtifactSummary {
  id: string;
  versionNumber: number;
  code: string;
  title: string;
  createdAt: string;
  dossier?: A2UIDossierComponent;
}

export type DiffStatus = 'same' | 'changed' | 'added' | 'removed';

export interface DossierDiffRow {
  label: string;
  leftValue: string;
  rightValue: string;
  status: DiffStatus;
}

export function extractThreadArtifacts(
  messages: readonly WorkspaceMessage[],
): ThreadArtifactSummary[] {
  const result: ThreadArtifactSummary[] = [];
  for (const msg of messages) {
    const canvas = msg.envelope?.canvasComponents;
    if (!canvas || canvas.length === 0) continue;
    const dossier = canvas.find((c): c is A2UIDossierComponent => c.type === 'dossier');
    const calc = canvas.find((c) => c.type === 'calculator');
    const batch = canvas.find((c) => c.type === 'batch_manifest');
    const code =
      dossier?.hsCode ??
      (calc?.type === 'calculator' ? calc.hsCode : undefined) ??
      (batch?.type === 'batch_manifest' ? `Lote (${batch.items.length})` : 'Expediente');
    const title =
      dossier?.title ??
      (batch?.type === 'batch_manifest' ? 'Manifiesto de lote' : 'Clasificación arancelaria');
    result.push({
      id: msg.id,
      versionNumber: result.length + 1,
      code,
      title,
      createdAt: msg.createdAt,
      dossier,
    });
  }
  return result;
}

export function computeDossierDiff(
  left: A2UIDossierComponent,
  right: A2UIDossierComponent,
): DossierDiffRow[] {
  const leftLegal = left.legalNotes.join('; ');
  const rightLegal = right.legalNotes.join('; ');
  const leftReview = left.reviewStatus ?? 'draft_ai';
  const rightReview = right.reviewStatus ?? 'draft_ai';

  const rows: DossierDiffRow[] = [
    {
      label: 'Código SA / NCM',
      leftValue: left.hsCode,
      rightValue: right.hsCode,
      status: left.hsCode === right.hsCode ? 'same' : 'changed',
    },
    {
      label: 'Notas legales',
      leftValue: leftLegal || '—',
      rightValue: rightLegal || '—',
      status: leftLegal === rightLegal ? 'same' : 'changed',
    },
    {
      label: 'Estado de revisión',
      leftValue: leftReview,
      rightValue: rightReview,
      status: leftReview === rightReview ? 'same' : 'changed',
    },
    {
      label: 'Descripción oficial',
      leftValue: left.officialDescription || '—',
      rightValue: right.officialDescription || '—',
      status: (left.officialDescription || '') === (right.officialDescription || '') ? 'same' : 'changed',
    },
  ];

  const leftSpecs = new Map((left.technicalSpecs ?? []).map((s) => [s.key, s.value]));
  const rightSpecs = new Map((right.technicalSpecs ?? []).map((s) => [s.key, s.value]));
  const allKeys = new Set([...leftSpecs.keys(), ...rightSpecs.keys()]);

  for (const key of allKeys) {
    const lVal = leftSpecs.get(key);
    const rVal = rightSpecs.get(key);
    const status: DiffStatus =
      lVal === undefined ? 'added' : rVal === undefined ? 'removed' : lVal === rVal ? 'same' : 'changed';
    rows.push({
      label: `Spec: ${key}`,
      leftValue: lVal ?? '—',
      rightValue: rVal ?? '—',
      status,
    });
  }

  return rows;
}
