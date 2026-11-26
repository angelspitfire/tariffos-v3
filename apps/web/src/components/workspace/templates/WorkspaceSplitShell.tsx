'use client';

import { useEffect, useState } from 'react';
import { FileText, MessageSquare } from 'lucide-react';
import type {
  A2UIDisambiguationOption,
  A2UIMerceologicalSheet,
  CanvasTabType,
} from '@tariffos/shared-types';
import type { WorkspaceMessage } from '@/lib/workspace/types';
import { useWorkspaceState } from '@/lib/workspace/use-workspace-state';
import { AnalyticsWorkspaceView } from '../organisms/AnalyticsWorkspaceView';
import { AssistantThreadSurface } from '../organisms/AssistantThreadSurface';
import { SkuCatalogModal } from '../organisms/SkuCatalogModal';
import { WorkspaceSidebarSlot } from '../molecules/WorkspaceSidebarSlot';
import type { InlineCardActions } from '../organisms/ThreadInlineCards';
import { WorkspaceCanvasPane } from '../organisms/WorkspaceCanvasPane';
import { WorkspaceHeader48 } from '../organisms/WorkspaceHeader48';

const MIN_CHAT_PCT = 32;
const MAX_CHAT_PCT = 68;

export function WorkspaceSplitShell() {
  const ws = useWorkspaceState();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [canvasDismissed, setCanvasDismissed] = useState(false);
  const [skuModalOpen, setSkuModalOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [mobilePane, setMobilePane] = useState<'chat' | 'canvas'>('chat');
  const [chatWidthPct, setChatWidthPct] = useState(46);
  const [isDark, setIsDark] = useState(false);

  const showCanvas = ws.canvasComponents.length > 0 && !canvasDismissed;

  useEffect(() => {
    setCanvasDismissed(false);
    if (ws.canvasComponents.length > 0 && typeof window !== 'undefined' && window.innerWidth < 1280) {
      setSidebarOpen(false);
    }
  }, [ws.activeThreadId, ws.canvasComponents.length]);

  useEffect(() => {
    if (!showCanvas || typeof window === 'undefined') return;
    const onResize = () => {
      if (window.innerWidth < 1280) setSidebarOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [showCanvas]);

  const handleToggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMobileDrawerOpen((p) => !p);
      return;
    }
    setSidebarOpen((p) => !p);
  };

  useEffect(() => {
    const dark = ws.profile.themePreference === 'dark';
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
  }, [ws.profile.themePreference]);

  const handleToggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    document.documentElement.classList.toggle('dark', nextDark);
    ws.updateProfile({ themePreference: nextDark ? 'dark' : 'light' });
  };

  const handleStartResize = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const container = event.currentTarget.parentElement;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const onMove = (e: MouseEvent) => {
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setChatWidthPct(Math.max(MIN_CHAT_PCT, Math.min(MAX_CHAT_PCT, pct)));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const handleExportPdf = () => {
    ws.pushToast('Abriendo vista de impresión / exportación PDF...', 'info');
    if (typeof window !== 'undefined' && typeof window.print === 'function') window.print();
  };

  const inlineActions: InlineCardActions = {
    onOpenCanvasTab: (msg: WorkspaceMessage, tab: CanvasTabType) => {
      ws.setSelectedCanvasMsgId(msg.id);
      ws.setActiveTab(tab);
      setCanvasDismissed(false);
      setMobilePane('canvas');
    },
    onExportPdf: () => {
      setMobilePane('canvas');
      ws.setActiveTab('dossier');
      handleExportPdf();
    },
    onSaveSku: (msg) => ws.saveSkuFromMessage(msg),
    onSubmitSheet: (sheet: A2UIMerceologicalSheet) => {
      const summary = sheet.attributes.filter((a) => a.value.trim()).map((a) => `${a.label}: ${a.value}`).join('; ');
      void ws.sendClassification(`Ficha merceológica confirmada para ${sheet.productName}: ${summary}`);
    },
    onAcceptTentative: (hsCode) =>
      void ws.sendClassification(`Confirmo adoptar la hipótesis preliminar ${hsCode} y emitir dictamen completo.`),
    onSubmitQuestionnaire: (answers) => {
      const text = Object.entries(answers).filter(([, v]) => v.trim()).map(([k, v]) => `${k}: ${v}`).join(', ');
      void ws.sendClassification(`Especificaciones complementarias: ${text}`);
    },
    onSelectDisambiguation: (opt: A2UIDisambiguationOption) =>
      void ws.sendClassification(`Opción seleccionada: ${opt.label}${opt.suggestedHsHint ? ` (${opt.suggestedHsHint})` : ''}`),
  };

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#E4E6EB] dark:bg-[#0B0F19] text-ink-primary">
      <WorkspaceHeader48
        jurisdiction={ws.jurisdiction}
        profile={ws.profile}
        skuCount={ws.skuPrecedents.length}
        analyticsOpen={analyticsOpen}
        isDark={isDark}
        onToggleSidebar={handleToggleSidebar}
        onChangeJurisdiction={ws.setJurisdictionId}
        onOpenSkuCatalog={() => setSkuModalOpen(true)}
        onToggleAnalytics={() => setAnalyticsOpen((p) => !p)}
        onToggleTheme={handleToggleTheme}
        onChangeApprovalMode={ws.setApprovalWorkflowMode}
      />

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        <WorkspaceSidebarSlot
          desktopOpen={sidebarOpen}
          mobileOpen={mobileDrawerOpen}
          threads={ws.threads}
          activeThreadId={ws.activeThreadId}
          onCloseMobile={() => setMobileDrawerOpen(false)}
          onNewThread={ws.startNewThread}
          onSelectThread={(id) => {
            ws.setActiveThreadId(id);
            ws.setSelectedCanvasMsgId(null);
          }}
          onDeleteThread={ws.deleteThread}
          onRunSample={(s) => void ws.sendClassification(s.description)}
          onRunBatchSample={(b) =>
            void ws.sendClassification(b.promptText, { attachmentsText: b.documentText, isBatchHint: true })
          }
        />

        {analyticsOpen ? (
          <main className="min-w-0 flex-1">
            <AnalyticsWorkspaceView
              threads={ws.threads}
              skuPrecedents={ws.skuPrecedents}
              onClose={() => setAnalyticsOpen(false)}
            />
          </main>
        ) : (
          <main className="flex min-w-0 flex-1 overflow-hidden">
            <section
              style={
                showCanvas
                  ? ({ '--chat-w': `${chatWidthPct}%` } as React.CSSProperties)
                  : undefined
              }
              className={`min-w-0 flex-1 ${
                showCanvas ? 'lg:w-[var(--chat-w)] lg:flex-none' : ''
              } ${mobilePane === 'chat' || !showCanvas ? 'block' : 'hidden lg:block'}`}
            >
              <AssistantThreadSurface
                messages={ws.activeThread?.messages ?? []}
                isRunning={ws.isRunning}
                liveProgress={ws.liveProgress}
                skuPrecedents={ws.skuPrecedents}
                pendingAttachments={ws.pendingAttachments}
                profile={ws.profile}
                inlineActions={inlineActions}
                onSendMessage={(text) => ws.sendClassification(text)}
                onCancelRun={ws.cancelRun}
                onAddFiles={(files) => void ws.addFiles(files)}
                onRemoveAttachment={ws.removeAttachment}
                onRunSample={(s) => void ws.sendClassification(s.description)}
                onRunBatchSample={(b) =>
                  void ws.sendClassification(b.promptText, { attachmentsText: b.documentText, isBatchHint: true })
                }
                onUpdateProfile={ws.updateProfile}
                onNotifyUnavailableCamera={() =>
                  ws.pushToast('Usa el botón + o pega una imagen con Ctrl+V para escanear documentos.', 'info')
                }
              />
            </section>

            {showCanvas ? (
              <>
                <button
                  type="button"
                  aria-label="Redimensionar panel de chat y dictamen"
                  onMouseDown={handleStartResize}
                  className="no-print hidden w-1.5 shrink-0 cursor-col-resize bg-transparent transition hover:bg-accent-brand/40 lg:block"
                />

                <section
                  className={`min-w-0 flex-1 lg:my-2.5 lg:mr-2.5 lg:rounded-[22px] lg:border lg:border-border-subtle lg:overflow-hidden lg:shadow-[0_14px_36px_-18px_rgba(15,23,42,0.16)] bg-surface-panel ${
                    mobilePane === 'canvas' ? 'block' : 'hidden lg:block'
                  }`}
                >
                  <WorkspaceCanvasPane
                    components={ws.canvasComponents}
                    activeTab={ws.activeTab}
                    jurisdiction={ws.jurisdiction}
                    profile={ws.profile}
                    onSelectTab={ws.setActiveTab}
                    onApproveDossier={ws.approveActiveDossier}
                    onRequestDossierReview={ws.requestDossierReview}
                    onSaveSku={() => ws.saveSkuFromMessage()}
                    onSaveSignature={(p) =>
                      ws.updateProfile({ fullName: p.fullName, brokerLicense: p.brokerLicense, brokerSignatureDataUrl: p.signatureDataUrl })
                    }
                    onExportPdf={handleExportPdf}
                    onConfirmBatchItem={ws.confirmBatchItem}
                    onCloseCanvas={() => {
                      setCanvasDismissed(true);
                      setMobilePane('chat');
                    }}
                  />
                </section>
              </>
            ) : null}
          </main>
        )}
      </div>

      <nav aria-label="Cambiar vista móvil" className="no-print grid grid-cols-2 border-t border-border-subtle bg-surface-panel lg:hidden">
        <button type="button" onClick={() => setMobilePane('chat')} className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium ${mobilePane === 'chat' ? 'text-accent-ink' : 'text-ink-muted'}`}>
          <MessageSquare className="h-4 w-4" aria-hidden="true" /> Chat
        </button>
        <button type="button" onClick={() => setMobilePane('canvas')} className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium ${mobilePane === 'canvas' ? 'text-accent-ink' : 'text-ink-muted'}`}>
          <FileText className="h-4 w-4" aria-hidden="true" /> Dictamen
        </button>
      </nav>

      <SkuCatalogModal
        open={skuModalOpen}
        precedents={ws.skuPrecedents}
        jurisdictionId={ws.jurisdiction.id}
        onClose={() => setSkuModalOpen(false)}
        onSave={ws.saveSku}
        onDelete={ws.deleteSku}
        onApplyToChat={(item) => void ws.sendClassification(`Clasificar precedente SKU ${item.sku}: ${item.title}`)}
      />

      {ws.toast ? (
        <output className="no-print fixed right-4 bottom-14 z-50 rounded-xl border border-border-subtle bg-surface-inverted px-3.5 py-2 text-xs font-medium text-ink-on-inverted shadow-lg lg:bottom-4">
          {ws.toast.title}
        </output>
      ) : null}
    </div>
  );
}
