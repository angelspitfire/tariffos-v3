'use client';

import { Scale } from 'lucide-react';
import type {
  A2UICanvasComponent,
  ApprovalWorkflowMode,
  CanvasTabType,
  JurisdictionConfig,
  UserProfileSettings,
} from '@tariffos/shared-types';
import { ConsolidatedTabStrip } from '../molecules/ConsolidatedTabStrip';
import type { BatchItemConfirmation } from './BatchItemInspector';
import { BatchManifestTriageView } from './BatchManifestTriageView';
import { DossierView } from './DossierView';
import { DutyCalculatorView } from './DutyCalculatorView';
import { HierarchyTreeView } from './HierarchyTreeView';
import { RegulatoryDiffView } from './RegulatoryDiffView';
import { RgiPathAndComparatorView } from './RgiPathAndComparatorView';

export interface WorkspaceCanvasPaneProps {
  components: readonly A2UICanvasComponent[];
  activeTab: CanvasTabType;
  jurisdiction: JurisdictionConfig;
  profile: UserProfileSettings;
  onSelectTab: (tab: CanvasTabType) => void;
  onApproveDossier: () => void;
  onRequestDossierReview: (note: string) => void;
  onSaveSku: () => void;
  onSaveSignature: (payload: {
    fullName: string;
    brokerLicense: string;
    signatureDataUrl: string;
  }) => void;
  onExportPdf: () => void;
  onConfirmBatchItem: (lineNumber: number, update: BatchItemConfirmation) => void;
}

export function WorkspaceCanvasPane({
  components,
  activeTab,
  jurisdiction,
  profile,
  onSelectTab,
  onApproveDossier,
  onRequestDossierReview,
  onSaveSku,
  onSaveSignature,
  onExportPdf,
  onConfirmBatchItem,
}: WorkspaceCanvasPaneProps) {
  const dossier = components.find((c) => c.type === 'dossier');
  const calculator = components.find((c) => c.type === 'calculator');
  const hierarchy = components.find((c) => c.type === 'hierarchy');
  const comparison = components.find((c) => c.type === 'comparison');
  const batch = components.find((c) => c.type === 'batch_manifest');

  if (components.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent-ink">
          <Scale className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2 className="mt-3 text-sm font-semibold text-ink-primary">
          Canvas de Dictamen y Liquidación CIF
        </h2>
        <p className="mt-1 max-w-sm text-xs leading-relaxed text-ink-muted">
          Describe una mercancía o carga una factura comercial en el chat para generar automáticamente el dictamen RGI, el cálculo CIF y el triage de lote.
        </p>
      </div>
    );
  }

  const workflowMode: ApprovalWorkflowMode = profile.approvalWorkflowMode;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-surface-app">
      <ConsolidatedTabStrip
        components={components}
        activeTab={activeTab}
        unreadAlertsCount={0}
        onSelectTab={onSelectTab}
      />

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'batch_manifest' && batch && (
          <BatchManifestTriageView
            key={batch.id}
            manifest={batch}
            jurisdiction={jurisdiction}
            onConfirmItem={onConfirmBatchItem}
          />
        )}

        {activeTab === 'dossier' && dossier && (
          <DossierView
            dossier={dossier}
            profile={profile}
            workflowMode={workflowMode}
            onApprove={onApproveDossier}
            onRequestReview={onRequestDossierReview}
            onSaveSku={onSaveSku}
            onSaveSignature={onSaveSignature}
            onExportPdf={onExportPdf}
          />
        )}

        {activeTab === 'calculator' && calculator && (
          <DutyCalculatorView
            key={calculator.id}
            calculator={calculator}
            jurisdiction={jurisdiction}
            dossier={dossier}
          />
        )}

        {(activeTab === 'rgi_comparator' || activeTab === 'comparison') && (
          <RgiPathAndComparatorView
            dossier={dossier}
            comparison={comparison}
            hierarchy={hierarchy}
          />
        )}

        {activeTab === 'hierarchy' && hierarchy && (
          <div className="p-4">
            <HierarchyTreeView hierarchy={hierarchy} />
          </div>
        )}

        {activeTab === 'regulatory_diff' && (
          <RegulatoryDiffView jurisdiction={jurisdiction} dossier={dossier} />
        )}
      </div>
    </div>
  );
}
