'use client';

import { useState } from 'react';
import { ManifestGrid } from './ManifestGrid';
import { TaxBreakdownCard } from './TaxBreakdownCard';
import { DiscrepancyInspector } from './DiscrepancyInspector';
import { FichaInspector } from './FichaInspector';
import { DisambiguationResolver } from './DisambiguationResolver';
import { PermitsComplianceMatrix } from './PermitsComplianceMatrix';
import { ExonerationSimulator } from './ExonerationSimulator';
import { CustomsDossierInspector } from './CustomsDossierInspector';
import { CanvasTabBar } from './CanvasTabBar';
import {
  type A2UIArtifact,
  type A2UIArtifactType,
  type ManifestLineItem,
  type ManifestGridPayload,
  type TaxSummary,
  type DiscrepancyReport,
  type DisambiguationPayload,
} from '@/types/domain';
import { type PermitsMatrixPayload } from '@/types/permits';
import { type ExonerationSimulatorPayload } from '@/types/exoneration';
import { type CustomsDossierPayload } from '@/types/dossier';
import { Sparkles, Layers, FileSearch } from 'lucide-react';

export interface DynamicCanvasProps {
  activeArtifact: A2UIArtifact | null;
  artifacts: A2UIArtifact[];
  openTabIds: string[];
  onSelectArtifact: (id: string) => void;
  onCloseTab: (id: string) => void;
  onCloseCanvas?: () => void;
  onSelectItem?: (item: ManifestLineItem) => void;
  onUpdateManifestItem?: (artifactId: string, itemId: string, patch: Partial<ManifestLineItem>) => void;
  onQuickStartBatch?: () => void;
  onQuickStartSingle?: () => void;
}

const artifactConfig: Record<A2UIArtifactType, { emptyPadding: number }> = {
  'single-item': { emptyPadding: 16 },
  'batch-manifest': { emptyPadding: 0 },
  'tax-breakdown': { emptyPadding: 16 },
  'discrepancy-audit': { emptyPadding: 16 },
  'disambiguation': { emptyPadding: 16 },
  'permits-matrix': { emptyPadding: 16 },
  'exoneration-simulator': { emptyPadding: 16 },
  'customs-dossier': { emptyPadding: 16 },
};

function renderArtifact(
  artifact: A2UIArtifact,
  onSelectItem: DynamicCanvasProps['onSelectItem'],
  onUpdateManifestItem?: DynamicCanvasProps['onUpdateManifestItem']
): React.ReactElement | null {
  const { type, data } = artifact;

  switch (type) {
    case 'single-item':
      return <FichaInspector key={artifact.id} item={data as ManifestLineItem} isLoading={false} />;
    case 'batch-manifest':
      return (
        <ManifestGrid
          key={artifact.id}
          payload={data as ManifestGridPayload}
          isLoading={false}
          onSelectItem={onSelectItem}
          onUpdateItem={(itemId, patch) => onUpdateManifestItem?.(artifact.id, itemId, patch)}
        />
      );
    case 'tax-breakdown':
      return <TaxBreakdownCard key={artifact.id} payload={data as TaxSummary} isLoading={false} />;
    case 'discrepancy-audit':
      return <DiscrepancyInspector key={artifact.id} payload={data as DiscrepancyReport} isLoading={false} />;
    case 'disambiguation':
      return <DisambiguationResolver key={artifact.id} payload={data as DisambiguationPayload} isLoading={false} />;
    case 'permits-matrix':
      return <PermitsComplianceMatrix key={artifact.id} payload={data as PermitsMatrixPayload} isLoading={false} />;
    case 'exoneration-simulator':
      return <ExonerationSimulator key={artifact.id} payload={data as ExonerationSimulatorPayload} isLoading={false} />;
    case 'customs-dossier':
      return <CustomsDossierInspector key={artifact.id} payload={data as CustomsDossierPayload} isLoading={false} />;
    default:
      return null;
  }
}

export function DynamicCanvas({
  activeArtifact,
  artifacts,
  openTabIds,
  onSelectArtifact,
  onCloseTab,
  onCloseCanvas,
  onSelectItem,
  onUpdateManifestItem,
  onQuickStartBatch,
  onQuickStartSingle,
}: DynamicCanvasProps) {
  const [fullscreen, setFullscreen] = useState(false);

  const openArtifacts = openTabIds
    .map((id) => artifacts.find((a) => a.id === id))
    .filter((a): a is A2UIArtifact => Boolean(a));

  const config = activeArtifact ? artifactConfig[activeArtifact.type] : null;
  const emptyPadding = config?.emptyPadding ?? 16;

  return (
    <div
      role="region"
      aria-label="Mesa de Aforo Aduanero"
      className="h-full flex flex-col relative"
      style={{
        background: 'var(--surface)',
        ...(fullscreen ? { position: 'fixed', inset: 0, zIndex: 50, background: 'var(--canvas)' } : {}),
      }}
    >
      {/* Professional Workspace Tab Bar */}
      <CanvasTabBar
        openArtifacts={openArtifacts}
        activeArtifactId={activeArtifact?.id ?? null}
        fullscreen={fullscreen}
        onSelectTab={onSelectArtifact}
        onCloseTab={onCloseTab}
        onToggleFullscreen={() => setFullscreen(!fullscreen)}
        onCloseCanvas={onCloseCanvas}
      />

      {/* Artifact Viewport */}
      <div
        role="tabpanel"
        className="flex-1 overflow-auto"
        style={{ padding: emptyPadding }}
      >
        {activeArtifact ? renderArtifact(activeArtifact, onSelectItem, onUpdateManifestItem) : (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg"
              style={{ background: 'var(--brand)', boxShadow: '0 0 24px var(--brand-glow)' }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Mesa de Aforo Lista para Clasificación</h3>
              <p className="text-xs max-w-sm mt-1 leading-relaxed" style={{ color: 'var(--text-mid)' }}>
                Selecciona una consulta o abre un documento guardado en la gaveta.
              </p>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={onQuickStartBatch}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border text-white transition-all hover:border-indigo-400"
                style={{ background: 'var(--surface-raised)', borderColor: 'var(--border)' }}
              >
                <Layers size={13} className="text-[var(--purple-text)]" />
                <span>Ver Lote (Manifiesto)</span>
              </button>
              <button
                onClick={onQuickStartSingle}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border text-white transition-all hover:border-emerald-400"
                style={{ background: 'var(--surface-raised)', borderColor: 'var(--border)' }}
              >
                <FileSearch size={13} className="text-emerald-400" />
                <span>Clasificar Ítem Individual</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
