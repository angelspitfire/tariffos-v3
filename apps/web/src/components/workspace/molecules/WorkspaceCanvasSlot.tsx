'use client';

import type { MouseEvent } from 'react';
import type {
  A2UICanvasComponent,
  ApprovalWorkflowMode,
  CanvasTabType,
  JurisdictionConfig,
  UserProfileSettings,
} from '@tariffos/shared-types';
import type { ThreadArtifactSummary } from '@/lib/workspace/artifact-versions';
import type { TechnicalSpecItem } from '../molecules/MerceologicalSpecsCard';
import { WorkspaceCanvasPane } from '../organisms/WorkspaceCanvasPane';

export interface WorkspaceCanvasSlotProps {
  components: readonly A2UICanvasComponent[];
  activeTab: CanvasTabType;
  jurisdiction: JurisdictionConfig;
  profile: UserProfileSettings;
  artifacts: readonly ThreadArtifactSummary[];
  activeArtifactId: string | null;
  canvasFullscreen: boolean;
  mobileVisible: boolean;
  onStartResize: (event: MouseEvent<HTMLButtonElement>) => void;
  onSelectTab: (tab: CanvasTabType) => void;
  onApproveDossier: () => void;
  onRequestDossierReview: (note: string) => void;
  onChangeWorkflowMode: (mode: ApprovalWorkflowMode) => void;
  onReevaluateSpecs: (specs: TechnicalSpecItem[]) => void;
  onSaveSku: () => void;
  onSaveSignature: (p: { fullName: string; brokerLicense: string; signatureDataUrl: string }) => void;
  onExportPdf: () => void;
  onConfirmBatchItem: (
    lineNumber: number,
    update: { hsCode: string; adValoremPercent: number; legalRegime: string; answers: Record<string, string> },
  ) => void;
  onSelectArtifact: (id: string | null) => void;
  onToggleFullscreen: () => void;
  onCloseCanvas: () => void;
}

export function WorkspaceCanvasSlot({
  canvasFullscreen,
  mobileVisible,
  onStartResize,
  ...canvasProps
}: WorkspaceCanvasSlotProps) {
  return (
    <>
      {!canvasFullscreen ? (
        <button
          type="button"
          aria-label="Redimensionar panel de chat y dictamen"
          onMouseDown={onStartResize}
          className="no-print hidden w-1.5 shrink-0 cursor-col-resize bg-transparent transition-colors hover:bg-accent-brand/40 focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none lg:block"
        />
      ) : null}
      <section
        className={`min-w-0 flex-1 bg-surface-panel ${
          canvasFullscreen
            ? 'fixed inset-0 z-40 h-full lg:static lg:z-auto lg:m-2.5 lg:h-auto lg:overflow-hidden lg:rounded-surface lg:border lg:border-border-subtle lg:shadow-elev-2'
            : 'fixed inset-0 z-40 h-full lg:static lg:z-auto lg:my-2.5 lg:mr-2.5 lg:h-auto lg:overflow-hidden lg:rounded-surface lg:border lg:border-border-subtle lg:shadow-elev-2'
        } ${mobileVisible ? 'block' : 'hidden lg:block'}`}
      >
        <WorkspaceCanvasPane {...canvasProps} isFullscreen={canvasFullscreen} />
      </section>
    </>
  );
}
