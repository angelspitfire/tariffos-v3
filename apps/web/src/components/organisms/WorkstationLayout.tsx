'use client';

import { useCallback, useState, useEffect } from 'react';
import { WorkstationSidebar } from './WorkstationSidebar';
import { ArtifactsDrawer } from './ArtifactsDrawer';
import dynamic from 'next/dynamic';
import type { TariffReferenceViewProps } from '@/components/tariff-reference/TariffReferenceView';
import { SelectivityChannelBadge } from '@/components/atoms/SelectivityChannelBadge';

const TariffReferenceView = dynamic<TariffReferenceViewProps>(
  () => import('@/components/tariff-reference/TariffReferenceView').then(m => ({ default: m.TariffReferenceView })),
  { ssr: false, loading: () => null }
);
import { TariffReferenceProvider } from '@/components/tariff-reference/TariffReferenceProvider';
import type { A2UIArtifact } from '@/types/domain';
import type { CustomsChannel } from '@/lib/customs-channel';
import type { AuditLogEntry } from '@/lib/audit-log';
import type { ConversationFile } from '@/types/files';

interface WorkstationLayoutProps {
  chat?: React.ReactNode;
  canvas: React.ReactNode;
  isCanvasOpen: boolean;
  onToggleCanvas: () => void;
  isSidebarExpanded: boolean;
  onToggleSidebar: () => void;
  onNewFiling?: () => void;
  filingCode: string;
  channel?: CustomsChannel;
  reasons?: string[];
  auditEntries?: AuditLogEntry[];
  files?: ConversationFile[];
  isDrawerOpen: boolean;
  onToggleDrawer: (open: boolean) => void;
  artifacts: A2UIArtifact[];
  activeArtifactId: string | null;
  onSelectArtifact: (id: string) => void;
  onSelectFiling?: (id: string) => void;
  onSelectAssistant?: () => void;
  onSelectTariffReference?: () => void;
  onOpenCommandPalette?: () => void;
  onAnalyzeFile?: (fileName: string) => void;
  onOpenUpload?: () => void;
}

export const WorkstationLayout: React.FC<WorkstationLayoutProps> = ({
  chat, canvas, isCanvasOpen, onToggleCanvas, isSidebarExpanded, onToggleSidebar,
  onNewFiling, filingCode, channel, reasons, auditEntries, files,
  isDrawerOpen, onToggleDrawer, artifacts, activeArtifactId,
  onSelectArtifact, onSelectFiling, onSelectAssistant,
  onSelectTariffReference, onOpenCommandPalette, onAnalyzeFile,
  onOpenUpload,
}) => {
  const [isTariffReferenceOpen, setIsTariffReferenceOpen] = useState(false);

  const handleTariffReferenceToggle = useCallback(() => {
    if (onSelectTariffReference) {
      onSelectTariffReference();
    }
    setIsTariffReferenceOpen(!isTariffReferenceOpen);
  }, [onSelectTariffReference]);

  const handleCloseDrawer = useCallback(() => {
    onToggleDrawer(false);
  }, [onToggleDrawer]);

  const handleToggleDrawer = useCallback(() => {
    onToggleDrawer(!isDrawerOpen);
  }, [isDrawerOpen, onToggleDrawer]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenCommandPalette?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenCommandPalette]);

  return (
    <TariffReferenceProvider>
      <div className="flex h-screen w-full bg-[var(--surface)]">
        <WorkstationSidebar
          expanded={isSidebarExpanded}
          onToggleExpand={onToggleSidebar}
          onNewFiling={onNewFiling}
          activeFilingId={filingCode}
          onSelectFiling={onSelectFiling}
          onSelectAssistant={onSelectAssistant}
          onSelectTariffReference={handleTariffReferenceToggle}
          onToggleDrawer={handleToggleDrawer}
          hasActiveConversation={isCanvasOpen}
        />
        {chat && (
          <div className="flex-1 flex flex-col min-w-0 bg-[var(--surface)]">
            {/* Header bar with filing context */}
            <div className="h-11 border-b border-[var(--border)] px-4 shrink-0 flex items-center justify-between bg-[var(--surface)]/50 backdrop-blur z-10">
              <div className="flex items-center gap-3">
                <span className="text-[10px] uppercase font-semibold tracking-wider text-[var(--text-lo)]">
                  Despacho Aduanero
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-medium text-[var(--text-hi)] truncate max-w-xs">
                    {filingCode}
                  </span>
                  {channel && <SelectivityChannelBadge channel={channel} reasons={reasons ?? []} />}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {onOpenUpload && (
                  <button
                    onClick={onOpenUpload}
                    aria-label="Subir documento"
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-zinc-800/50"
                    style={{ color: 'var(--text-mid)' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </button>
                )}
                {onOpenCommandPalette && (
                  <button
                    onClick={onOpenCommandPalette}
                    aria-label="Paleta de comandos"
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-zinc-800/50"
                    style={{ color: 'var(--text-mid)' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15A1.65 1.65 0 0 0 20.5 13H18v-0.5A1.5 1.5 0 0 0 16.5 9H16v-1.5A2.5 2.5 0 0 0 9.5 5H8A2.5 2.5 0 0 0 5.5 7H4v2h1.5A1.5 1.5 0 0 0 7 9.5v1A1.5 1.5 0 0 0 8.5 11H10v0.5A1.5 1.5 0 0 0 11.5 13H13v1.5A1.65 1.65 0 0 0 14.6 15H19.4Z" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={onToggleCanvas}
                  aria-label={isCanvasOpen ? 'Ocultar mesa de aforo' : 'Mostrar mesa de aforo'}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-zinc-800/50"
                  style={{ color: 'var(--text-mid)' }}
                >
                  {isCanvasOpen ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="10 15 15 10 20 15" /><polyline points="18 9 12 3 6 9" /></svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 7 20 12" /><polyline points="18 14 20 12 22 14" /><polyline points="4 17 4 12" /><polyline points="6 10 4 12 2 10" /></svg>
                  )}
                </button>
              </div>
            </div>
            {chat}
          </div>
        )}
        {isCanvasOpen && <div className="flex-1 min-w-0">{canvas}</div>}
        <ArtifactsDrawer
          isOpen={isDrawerOpen}
          onClose={handleCloseDrawer}
          artifacts={artifacts}
          activeArtifactId={activeArtifactId}
          auditEntries={auditEntries}
          files={files}
          onSelectArtifact={onSelectArtifact}
          onAnalyzeFile={onAnalyzeFile}
        />
        {isTariffReferenceOpen && (
          <TariffReferenceView
            isOpen={isTariffReferenceOpen}
            onClose={() => setIsTariffReferenceOpen(false)}
          />
        )}
      </div>
    </TariffReferenceProvider>
  );
};