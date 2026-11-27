'use client';

import type { KeyboardEvent, PointerEvent } from 'react';
import type {
  A2UICanvasComponent,
  ApprovalWorkflowMode,
  CanvasTabType,
  JurisdictionConfig,
  UserProfileSettings,
} from '@tariffos/shared-types';
import type { ThreadArtifactSummary } from '@/lib/workspace/artifact-versions';
import type { WorkspaceMessage } from '@/lib/workspace/types';
import type { TechnicalSpecItem } from '../molecules/MerceologicalSpecsCard';
import { WorkspaceCanvasPane } from '../organisms/WorkspaceCanvasPane';

export interface WorkspaceCanvasSlotProps {
  components: readonly A2UICanvasComponent[];
  messages?: readonly WorkspaceMessage[];
  activeTab: CanvasTabType;
  jurisdiction: JurisdictionConfig;
  profile: UserProfileSettings;
  artifacts: readonly ThreadArtifactSummary[];
  activeArtifactId: string | null;
  canvasFullscreen: boolean;
  mobileVisible: boolean;
  chatWidthPct?: number;
  onStartResize: (event: PointerEvent<HTMLElement>) => void;
  onResizeKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
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
  chatWidthPct = 46,
  onStartResize,
  onResizeKeyDown,
  ...canvasProps
}: WorkspaceCanvasSlotProps) {
  return (
    <>
      {!canvasFullscreen ? (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Redimensionar panel de chat y dictamen"
          aria-valuemin={32}
          aria-valuemax={68}
          aria-valuenow={Math.round(chatWidthPct)}
          tabIndex={0}
          onPointerDown={onStartResize}
          onKeyDown={onResizeKeyDown}
          className="no-print hidden w-1.5 shrink-0 cursor-col-resize bg-transparent transition-colors hover:bg-accent-brand/40 focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none lg:block"
        />
      ) : null}
      <section
        className={`min-h-0 min-w-0 flex-1 bg-surface-panel ${
          canvasFullscreen
            ? 'fixed inset-0 z-40 h-full lg:static lg:z-auto lg:h-auto lg:overflow-hidden lg:border-l lg:border-border-subtle'
            : 'h-full overflow-hidden lg:h-auto lg:border-l lg:border-border-subtle'
        } ${mobileVisible ? 'block' : 'hidden lg:block'}`}
      >
        <WorkspaceCanvasPane {...canvasProps} isFullscreen={canvasFullscreen} />
      </section>
    </>
  );
}
