'use client';

import { useEffect, useState } from 'react';
import { FileText, MessageSquare } from 'lucide-react';
import type { CanvasTabType } from '@tariffos/shared-types';
import { readSelectedPlan } from '@/lib/funnel/funnel-storage';
import { buildWorkspaceInlineActions } from '@/lib/workspace/inline-actions';
import { computePlanStatus } from '@/lib/workspace/plan-status';
import { useWorkspaceState } from '@/lib/workspace/use-workspace-state';
import { AnalyticsWorkspaceView } from '../organisms/AnalyticsWorkspaceView';
import { AssistantThreadSurface } from '../organisms/AssistantThreadSurface';
import { SkuCatalogModal } from '../organisms/SkuCatalogModal';
import { WorkspaceCanvasPane } from '../organisms/WorkspaceCanvasPane';
import { WorkspaceHeader48 } from '../organisms/WorkspaceHeader48';
import { WorkspaceSettingsModal } from '../organisms/WorkspaceSettingsModal';
import { WorkspaceSidebarSlot } from '../molecules/WorkspaceSidebarSlot';

const MIN_CHAT_PCT = 32;
const MAX_CHAT_PCT = 68;
const WIDE_VIEWPORT_PX = 1280;

export function WorkspaceSplitShell() {
  const ws = useWorkspaceState();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [canvasDismissed, setCanvasDismissed] = useState(false);
  const [canvasFullscreen, setCanvasFullscreen] = useState(false);
  const [skuModalOpen, setSkuModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [mobilePane, setMobilePane] = useState<'chat' | 'canvas'>('chat');
  const [chatWidthPct, setChatWidthPct] = useState(46);
  const [isDark, setIsDark] = useState(false);
  const [planId, setPlanId] = useState('trial');

  const hasCanvas = ws.canvasComponents.length > 0;
  const showCanvas = hasCanvas && !canvasDismissed;
  const plan = computePlanStatus(ws.threads, planId);

  useEffect(() => {
    setPlanId(readSelectedPlan()?.planId ?? 'trial');
  }, []);

  useEffect(() => {
    setCanvasDismissed(false);
    if (hasCanvas && window.innerWidth < WIDE_VIEWPORT_PX) setSidebarOpen(false);
  }, [ws.activeThreadId, hasCanvas]);

  useEffect(() => {
    if (!showCanvas) return;
    const onResize = () => window.innerWidth < WIDE_VIEWPORT_PX && setSidebarOpen(false);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [showCanvas]);

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
    if (typeof window.print === 'function') window.print();
  };

  const showCanvasFor = (messageId: string | null, tab: CanvasTabType) => {
    ws.setSelectedCanvasMsgId(messageId);
    ws.setActiveTab(tab);
    setCanvasDismissed(false);
    setMobilePane('canvas');
  };

  const inlineActions = buildWorkspaceInlineActions({
    onSelectCanvasMessage: (messageId, tab) => showCanvasFor(messageId, tab),
    onExportPdf: () => {
      ws.setActiveTab('dossier');
      setCanvasDismissed(false);
      setMobilePane('canvas');
      handleExportPdf();
    },
    onSaveSku: (msg) => ws.saveSkuFromMessage(msg),
    onClassify: (prompt) => void ws.sendClassification(prompt),
  });

  const goToChat = () => {
    setAnalyticsOpen(false);
    setMobilePane('chat');
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-[#E4E6EB] text-ink-primary dark:bg-[#0B0F19]">
      <WorkspaceSidebarSlot
        desktopOpen={sidebarOpen}
        mobileOpen={mobileDrawerOpen}
        threads={ws.threads}
        activeThreadId={ws.activeThreadId}
        profile={ws.profile}
        plan={plan}
        skuCount={ws.skuPrecedents.length}
        dashboardActive={analyticsOpen}
        onToggleDesktop={() => setSidebarOpen((p) => !p)}
        onCloseMobile={() => setMobileDrawerOpen(false)}
        onNewThread={() => {
          ws.startNewThread();
          goToChat();
        }}
        onSelectThread={(id) => {
          ws.setActiveThreadId(id);
          ws.setSelectedCanvasMsgId(null);
          goToChat();
        }}
        onDeleteThread={ws.deleteThread}
        onOpenDashboard={() => setAnalyticsOpen((p) => !p)}
        onOpenSkuCatalog={() => setSkuModalOpen(true)}
        onOpenSettings={() => setSettingsModalOpen(true)}
        onChangeApprovalMode={ws.setApprovalWorkflowMode}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <WorkspaceHeader48
          jurisdiction={ws.jurisdiction}
          isDark={isDark}
          canvasAvailable={hasCanvas && !analyticsOpen}
          canvasVisible={showCanvas}
          onOpenMobileSidebar={() => setMobileDrawerOpen(true)}
          onChangeJurisdiction={ws.setJurisdictionId}
          onToggleTheme={handleToggleTheme}
          onToggleCanvas={() => setCanvasDismissed((p) => !p)}
        />

        <div className="relative flex min-h-0 flex-1 overflow-hidden">
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
                style={showCanvas && !canvasFullscreen ? ({ '--chat-w': `${chatWidthPct}%` } as React.CSSProperties) : undefined}
                className={`min-w-0 flex-1 ${showCanvas && !canvasFullscreen ? 'lg:w-[var(--chat-w)] lg:flex-none' : ''} ${
                  canvasFullscreen ? 'hidden' : mobilePane === 'chat' || !showCanvas ? 'block' : 'hidden lg:block'
                }`}
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
                  {!canvasFullscreen ? (
                    <button
                      type="button"
                      aria-label="Redimensionar panel de chat y dictamen"
                      onMouseDown={handleStartResize}
                      className="no-print hidden w-1.5 shrink-0 cursor-col-resize bg-transparent transition hover:bg-accent-brand/40 lg:block"
                    />
                  ) : null}
                  <section
                    className={`min-w-0 flex-1 bg-surface-panel ${
                      canvasFullscreen
                        ? 'lg:m-2.5 lg:overflow-hidden lg:rounded-surface lg:border lg:border-line-frost lg:shadow-elev-2'
                        : 'lg:my-2.5 lg:mr-2.5 lg:overflow-hidden lg:rounded-surface lg:border lg:border-line-frost lg:shadow-elev-2'
                    } ${mobilePane === 'canvas' ? 'block' : 'hidden lg:block'}`}
                  >
                    <WorkspaceCanvasPane
                      components={ws.canvasComponents}
                      activeTab={ws.activeTab}
                      jurisdiction={ws.jurisdiction}
                      profile={ws.profile}
                      onSelectTab={ws.setActiveTab}
                      onApproveDossier={ws.approveActiveDossier}
                      onRequestDossierReview={ws.requestDossierReview}
                      onChangeWorkflowMode={ws.setApprovalWorkflowMode}
                      onReevaluateSpecs={(specs) => {
                        const summary = specs.map((s) => `${s.key}: ${s.value}`).join('; ');
                        void ws.sendClassification(`Reevaluar dictamen con ficha actualizada: ${summary}`);
                      }}
                      onSaveSku={() => ws.saveSkuFromMessage()}
                      onSaveSignature={(p) =>
                        ws.updateProfile({
                          fullName: p.fullName,
                          brokerLicense: p.brokerLicense,
                          brokerSignatureDataUrl: p.signatureDataUrl,
                        })
                      }
                      onExportPdf={handleExportPdf}
                      onConfirmBatchItem={ws.confirmBatchItem}
                      isFullscreen={canvasFullscreen}
                      onToggleFullscreen={() => setCanvasFullscreen((p) => !p)}
                      onCloseCanvas={() => {
                        setCanvasFullscreen(false);
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

        {showCanvas && !analyticsOpen ? (
          <nav aria-label="Cambiar vista móvil" className="no-print grid grid-cols-2 border-t border-line-frost bg-surface-frost lg:hidden">
            {(
              [
                { id: 'chat', label: 'Chat', Icon: MessageSquare },
                { id: 'canvas', label: 'Dictamen', Icon: FileText },
              ] as const
            ).map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setMobilePane(id)}
                className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium ${
                  mobilePane === id ? 'text-accent-ink' : 'text-ink-muted'
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" /> {label}
              </button>
            ))}
          </nav>
        ) : null}
      </div>

      <SkuCatalogModal
        open={skuModalOpen}
        precedents={ws.skuPrecedents}
        jurisdictionId={ws.jurisdiction.id}
        onClose={() => setSkuModalOpen(false)}
        onSave={ws.saveSku}
        onDelete={ws.deleteSku}
        onApplyToChat={(item) => void ws.sendClassification(`Clasificar precedente SKU ${item.sku}: ${item.title}`)}
      />

      <WorkspaceSettingsModal
        key={settingsModalOpen ? 'open' : 'closed'}
        open={settingsModalOpen}
        profile={ws.profile}
        onClose={() => setSettingsModalOpen(false)}
        onSave={(patch) => {
          ws.updateProfile(patch);
          ws.pushToast('Configuración guardada.', 'success');
        }}
      />

      {ws.toast ? (
        <output className="no-print fixed right-4 bottom-14 z-50 rounded-xl border border-border-subtle bg-surface-inverted px-3.5 py-2 text-xs font-medium text-ink-on-inverted shadow-lg lg:bottom-4">
          {ws.toast.title}
        </output>
      ) : null}
    </div>
  );
}
