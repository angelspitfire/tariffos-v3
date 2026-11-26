'use client';

import { useEffect, useState } from 'react';
import type { CanvasTabType } from '@tariffos/shared-types';
import { readSelectedPlan } from '@/lib/funnel/funnel-storage';
import { extractThreadArtifacts } from '@/lib/workspace/artifact-versions';
import { exportWorkspaceDossierPdf } from '@/lib/workspace/dossier-pdf';
import { buildWorkspaceInlineActions } from '@/lib/workspace/inline-actions';
import { JURISDICTIONS } from '@/lib/workspace/jurisdictions';
import { computePlanStatus, mergeCloudUsageIntoPlanStatus, resolveWorkspaceReadOnlyReason } from '@/lib/workspace/plan-status';
import { useCloudUsageSnapshot } from '@/lib/workspace/use-cloud-usage';
import { useWorkspaceState } from '@/lib/workspace/use-workspace-state';
import { AnalyticsWorkspaceView } from '../organisms/AnalyticsWorkspaceView';
import { AssistantThreadSurface } from '../organisms/AssistantThreadSurface';
import { WorkspaceHeader48 } from '../organisms/WorkspaceHeader48';
import { WorkspaceCanvasSlot } from '../molecules/WorkspaceCanvasSlot';
import { WorkspaceMobilePaneTabs } from '../molecules/WorkspaceMobilePaneTabs';
import { WorkspaceModalsSlot } from '../molecules/WorkspaceModalsSlot';
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
  const [filesPanelOpen, setFilesPanelOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [mobilePane, setMobilePane] = useState<'chat' | 'canvas'>('chat');
  const [chatWidthPct, setChatWidthPct] = useState(46);
  const [isDark, setIsDark] = useState(false);
  const [planId, setPlanId] = useState('pilot');
  const cloudUsage = useCloudUsageSnapshot();
  const readOnlyReason = resolveWorkspaceReadOnlyReason(cloudUsage);

  const hasCanvas = ws.canvasComponents.length > 0;
  const threadArtifacts = extractThreadArtifacts(ws.activeThread?.messages ?? []);
  const filesCount =
    ws.pendingAttachments.length +
    (ws.activeThread?.messages.reduce((acc, m) => acc + (m.attachments?.length ?? 0), 0) ?? 0);
  const showCanvas = hasCanvas && !canvasDismissed;
  const plan = mergeCloudUsageIntoPlanStatus(computePlanStatus(ws.threads, planId), cloudUsage);

  useEffect(() => {
    setPlanId(readSelectedPlan()?.planId ?? 'pilot');
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

  const handleExportPdf = () =>
    exportWorkspaceDossierPdf(ws.canvasComponents, ws.profile, ws.pushToast);

  const showCanvasFor = (messageId: string | null, tab: CanvasTabType) => {
    ws.setSelectedCanvasMsgId(messageId);
    ws.setActiveTab(tab);
    setCanvasDismissed(false);
    setMobilePane('canvas');
  };

  const guardedSendClassification = async (
    prompt: string,
    opts?: { attachmentsText?: string; isBatchHint?: boolean },
  ) => {
    if (readOnlyReason) {
      ws.pushToast(readOnlyReason, 'info');
      return;
    }
    await ws.sendClassification(prompt, opts);
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
    onClassify: (prompt) => void guardedSendClassification(prompt),
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
          filesCount={filesCount}
          onOpenMobileSidebar={() => setMobileDrawerOpen(true)}
          onChangeJurisdiction={ws.setJurisdictionId}
          onToggleTheme={handleToggleTheme}
          onToggleCanvas={() => setCanvasDismissed((p) => !p)}
          onOpenFilesPanel={() => setFilesPanelOpen(true)}
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
                  readOnlyReason={readOnlyReason}
                  onSendMessage={(text) => guardedSendClassification(text)}
                  onCancelRun={ws.cancelRun}
                  onAddFiles={(files) => void ws.addFiles(files)}
                  onRemoveAttachment={ws.removeAttachment}
                  onRunSample={(s) => void guardedSendClassification(s.description)}
                  onRunBatchSample={(b) =>
                    void guardedSendClassification(b.promptText, { attachmentsText: b.documentText, isBatchHint: true })
                  }
                  onUpdateProfile={ws.updateProfile}
                  onNotifyUnavailableCamera={() =>
                    ws.pushToast('Usa el botón + o pega una imagen con Ctrl+V para escanear documentos.', 'info')
                  }
                />
              </section>

              {showCanvas ? (
                <WorkspaceCanvasSlot
                  components={ws.canvasComponents}
                  activeTab={ws.activeTab}
                  jurisdiction={ws.jurisdiction}
                  profile={ws.profile}
                  artifacts={threadArtifacts}
                  activeArtifactId={ws.selectedCanvasMsgId}
                  canvasFullscreen={canvasFullscreen}
                  mobileVisible={mobilePane === 'canvas'}
                  onStartResize={handleStartResize}
                  onSelectTab={ws.setActiveTab}
                  onApproveDossier={ws.approveActiveDossier}
                  onRequestDossierReview={ws.requestDossierReview}
                  onChangeWorkflowMode={ws.setApprovalWorkflowMode}
                  onReevaluateSpecs={(specs) => {
                    const summary = specs.map((s) => `${s.key}: ${s.value}`).join('; ');
                    void guardedSendClassification(`Reevaluar dictamen con ficha actualizada: ${summary}`);
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
                  onSelectArtifact={(id) => ws.setSelectedCanvasMsgId(id)}
                  onToggleFullscreen={() => setCanvasFullscreen((p) => !p)}
                  onCloseCanvas={() => {
                    setCanvasFullscreen(false);
                    setCanvasDismissed(true);
                    setMobilePane('chat');
                  }}
                />
              ) : null}
            </main>
          )}
        </div>

        {showCanvas && !analyticsOpen ? (
          <WorkspaceMobilePaneTabs activePane={mobilePane} onSelectPane={setMobilePane} />
        ) : null}
      </div>

      <WorkspaceModalsSlot
        skuModalOpen={skuModalOpen}
        filesPanelOpen={filesPanelOpen}
        settingsModalOpen={settingsModalOpen}
        skuPrecedents={ws.skuPrecedents}
        jurisdictionId={ws.jurisdiction.id}
        jurisdictions={JURISDICTIONS}
        messages={ws.activeThread?.messages ?? []}
        pendingAttachments={ws.pendingAttachments}
        profile={ws.profile}
        plan={plan}
        threads={ws.threads}
        onCloseSku={() => setSkuModalOpen(false)}
        onSaveSku={ws.saveSku}
        onDeleteSku={ws.deleteSku}
        onCloseFiles={() => setFilesPanelOpen(false)}
        onCloseSettings={() => setSettingsModalOpen(false)}
        onSaveSettings={ws.updateProfile}
        onClassify={(prompt) => void guardedSendClassification(prompt)}
        onToast={ws.pushToast}
      />

      {ws.toast ? (
        <output className="no-print fixed right-4 bottom-14 z-50 rounded-xl border border-border-subtle bg-surface-inverted px-3.5 py-2 text-xs font-medium text-ink-on-inverted shadow-lg lg:bottom-4">
          {ws.toast.title}
        </output>
      ) : null}
    </div>
  );
}
