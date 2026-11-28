'use client';

import { useState } from 'react';
import { Scale } from 'lucide-react';
import type {
  A2UICanvasComponent,
  AgencyMemberSummary,
  AgencyRole,
  ApprovalWorkflowMode,
  CanvasTabType,
  JurisdictionConfig,
  ProcessActivityEvent,
  UserProfileSettings,
} from '@tariffos/shared-types';
import type { ThreadArtifactSummary } from '@/lib/workspace/artifact-versions';
import { resolveEffectiveCalculatorComponent } from '@/lib/workspace/calculator-fallback';
import { resolveEffectiveCanvasTab } from '@/lib/workspace/canvas-tabs';
import type { WorkspaceMessage } from '@/lib/workspace/types';
import { ArtifactDirectoryDrawer } from '../molecules/ArtifactDirectoryDrawer';
import { ConsolidatedTabStrip } from '../molecules/ConsolidatedTabStrip';
import type { TechnicalSpecItem } from '../molecules/MerceologicalSpecsCard';
import { OpenArtifactTabsStrip } from '../molecules/OpenArtifactTabsStrip';
import type { BatchItemConfirmation } from './BatchItemInspector';
import { BatchManifestTriageView } from './BatchManifestTriageView';
import { ChangeTimelineModal } from './ChangeTimelineModal';
import { DossierView } from './DossierView';
import { DutyCalculatorView } from './DutyCalculatorView';
import { HierarchyTreeView } from './HierarchyTreeView';
import { RegulatoryDiffView } from './RegulatoryDiffView';
import { RgiPathAndComparatorView } from './RgiPathAndComparatorView';

export interface WorkspaceCanvasPaneProps {
  components: readonly A2UICanvasComponent[];
  messages?: readonly WorkspaceMessage[];
  activeTab: CanvasTabType;
  jurisdiction: JurisdictionConfig;
  profile: UserProfileSettings;
  agencyRole?: AgencyRole;
  teamMembers?: readonly AgencyMemberSummary[];
  assignedToUserId?: string | null;
  processEvents?: readonly ProcessActivityEvent[];
  onSelectTab: (tab: CanvasTabType) => void;
  onApproveDossier: () => void;
  onRequestDossierReview: (note: string, assignedToUserId?: string | null, targetName?: string) => void;
  onSaveSku: () => void;
  onSaveSignature: (payload: { fullName: string; brokerLicense: string; signatureDataUrl: string }) => void;
  onExportPdf: () => void;
  onConfirmBatchItem: (lineNumber: number, update: BatchItemConfirmation) => void;
  onChangeWorkflowMode?: (mode: ApprovalWorkflowMode) => void;
  onReevaluateSpecs?: (updatedSpecs: TechnicalSpecItem[]) => void;
  artifacts?: readonly ThreadArtifactSummary[];
  activeArtifactId?: string | null;
  onSelectArtifact?: (artifactId: string) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onCloseCanvas?: () => void;
}

export function WorkspaceCanvasPane({
  components,
  messages,
  activeTab,
  jurisdiction,
  profile,
  agencyRole,
  teamMembers,
  assignedToUserId,
  processEvents,
  onSelectTab,
  onApproveDossier,
  onRequestDossierReview,
  onSaveSku,
  onSaveSignature,
  onExportPdf,
  onConfirmBatchItem,
  onChangeWorkflowMode,
  onReevaluateSpecs,
  artifacts = [],
  activeArtifactId = null,
  onSelectArtifact,
  isFullscreen,
  onToggleFullscreen,
  onCloseCanvas,
}: WorkspaceCanvasPaneProps) {
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const dossier = components.find((c) => c.type === 'dossier');
  const hierarchy = components.find((c) => c.type === 'hierarchy');
  const comparison = components.find((c) => c.type === 'comparison');
  const batch = components.find((c) => c.type === 'batch_manifest');
  const effectiveCalculator = resolveEffectiveCalculatorComponent({
    components,
    jurisdiction,
    profile,
    messages,
    activeArtifactId,
  });

  if (components.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent-ink">
          <Scale className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2 className="mt-3 text-sm font-semibold text-ink-primary">Canvas de Dictamen y Liquidación CIF</h2>
        <p className="mt-1 max-w-sm text-xs leading-relaxed text-ink-muted">
          Describe una mercancía o carga una factura comercial en el chat para generar automáticamente el dictamen RGI, el cálculo CIF y el triage de lote.
        </p>
      </div>
    );
  }

  const workflowMode: ApprovalWorkflowMode = profile.approvalWorkflowMode;
  const effectiveTab = resolveEffectiveCanvasTab(components, activeTab);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-surface-panel">
      <ConsolidatedTabStrip
        components={components}
        activeTab={effectiveTab}
        unreadAlertsCount={0}
        versionsCount={artifacts.length}
        isFullscreen={isFullscreen}
        onSelectTab={onSelectTab}
        onOpenTimeline={() => setTimelineOpen(true)}
        onToggleFullscreen={onToggleFullscreen}
        onCloseCanvas={onCloseCanvas}
      />

      {onSelectArtifact ? (
        <>
          <OpenArtifactTabsStrip
            artifacts={artifacts}
            activeArtifactId={activeArtifactId}
            directoryOpen={directoryOpen}
            onSelectArtifact={onSelectArtifact}
            onToggleDirectory={() => setDirectoryOpen((prev) => !prev)}
          />
          <ArtifactDirectoryDrawer
            open={directoryOpen}
            artifacts={artifacts}
            activeArtifactId={activeArtifactId}
            onSelectArtifact={onSelectArtifact}
            onClose={() => setDirectoryOpen(false)}
          />
        </>
      ) : null}

      <div className="flex-1 overflow-y-auto">
        {effectiveTab === 'batch_manifest' && batch && (
          <BatchManifestTriageView key={batch.id} manifest={batch} jurisdiction={jurisdiction} onConfirmItem={onConfirmBatchItem} />
        )}

        {effectiveTab === 'dossier' && dossier && (
          <DossierView
            dossier={dossier}
            profile={profile}
            workflowMode={workflowMode}
            agencyRole={agencyRole}
            teamMembers={teamMembers}
            assignedToUserId={assignedToUserId}
            processEvents={processEvents}
            onApprove={onApproveDossier}
            onRequestReview={onRequestDossierReview}
            onChangeWorkflowMode={onChangeWorkflowMode}
            onReevaluateSpecs={onReevaluateSpecs}
            onSaveSku={onSaveSku}
            onSaveSignature={onSaveSignature}
            onExportPdf={onExportPdf}
            onOpenRgi={() => onSelectTab('rgi_comparator')}
          />
        )}

        {effectiveTab === 'calculator' && effectiveCalculator && (
          <DutyCalculatorView key={effectiveCalculator.id} calculator={effectiveCalculator} jurisdiction={jurisdiction} dossier={dossier} />
        )}

        {(effectiveTab === 'rgi_comparator' || effectiveTab === 'comparison') && (
          <RgiPathAndComparatorView dossier={dossier} comparison={comparison} hierarchy={hierarchy} />
        )}

        {effectiveTab === 'hierarchy' && hierarchy && (
          <div className="p-4">
            <HierarchyTreeView hierarchy={hierarchy} />
          </div>
        )}

        {effectiveTab === 'regulatory_diff' && <RegulatoryDiffView jurisdiction={jurisdiction} dossier={dossier} />}
      </div>

      {onSelectArtifact ? (
        <ChangeTimelineModal open={timelineOpen} artifacts={artifacts} onClose={() => setTimelineOpen(false)} onSelectArtifact={onSelectArtifact} />
      ) : null}
    </div>
  );
}
