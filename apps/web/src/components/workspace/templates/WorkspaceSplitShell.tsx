'use client';

import { useEffect, useRef, useState } from 'react';
import type { CanvasTabType } from '@tariffos/shared-types';
import { readSelectedPlan } from '@/lib/funnel/funnel-storage';
import { getAgentRuntimeMode } from '@/lib/runtime-config';
import { extractThreadArtifacts } from '@/lib/workspace/artifact-versions';
import { exportWorkspaceDossierPdf } from '@/lib/workspace/dossier-pdf';
import { buildWorkspaceInlineActions } from '@/lib/workspace/inline-actions';
import { JURISDICTIONS } from '@/lib/workspace/jurisdictions';
import { computePlanStatus, mergeCloudUsageIntoPlanStatus, resolveWorkspaceReadOnlyReason } from '@/lib/workspace/plan-status';
import { useBatchJob } from '@/lib/workspace/use-batch-job';
import { useCloudUsageSnapshot } from '@/lib/workspace/use-cloud-usage';
import { useWorkspaceShellLayout } from '@/lib/workspace/use-split-layout';
import { useWorkspaceState } from '@/lib/workspace/use-workspace-state';
import { AnalyticsWorkspaceView } from '../organisms/AnalyticsWorkspaceView';
import { WorkspaceHeader48 } from '../organisms/WorkspaceHeader48';
import { BatchProgressBanner } from '../molecules/BatchProgressBanner';
import { WorkspaceCanvasSlot } from '../molecules/WorkspaceCanvasSlot';
import { WorkspaceMobilePaneTabs } from '../molecules/WorkspaceMobilePaneTabs';
import { WorkspaceModalsSlot } from '../molecules/WorkspaceModalsSlot';
import { WorkspaceSidebarSlot } from '../molecules/WorkspaceSidebarSlot';
import { WorkspaceThreadSlot } from '../molecules/WorkspaceThreadSlot';

export function WorkspaceSplitShell() {
  const ws = useWorkspaceState();
  const [planId, setPlanId] = useState('pilot');
  const [eveSessionKey, setEveSessionKey] = useState(0);
  const eveSendRef = useRef<((text: string) => void) | null>(null);
  const batchInputRef = useRef<HTMLInputElement | null>(null);
  const runtimeMode = getAgentRuntimeMode();
  const cloudUsage = useCloudUsageSnapshot();
  const readOnlyReason = resolveWorkspaceReadOnlyReason(cloudUsage);
  const batchJob = useBatchJob({
    jurisdiction: ws.jurisdiction,
    deepMode: ws.profile.detailLevel === 'exhaustive',
    onBatchCompleted: ws.ingestExternalMessage,
    pushToast: ws.pushToast,
  });

  const hasCanvas = ws.canvasComponents.length > 0;
  const threadArtifacts = extractThreadArtifacts(ws.activeThread?.messages ?? []);
  const filesCount =
    ws.pendingAttachments.length +
    (ws.activeThread?.messages.reduce((acc, m) => acc + (m.attachments?.length ?? 0), 0) ?? 0);
  const layout = useWorkspaceShellLayout({
    activeThreadId: ws.activeThreadId,
    hasCanvas,
    themePreference: ws.profile.themePreference,
    onSaveTheme: (themePreference) => ws.updateProfile({ themePreference }),
  });
  const plan = mergeCloudUsageIntoPlanStatus(computePlanStatus(ws.threads, planId), cloudUsage);

  useEffect(() => {
    setPlanId(readSelectedPlan()?.planId ?? 'pilot');
  }, []);

  const handleExportPdf = () =>
    exportWorkspaceDossierPdf(ws.canvasComponents, ws.profile, ws.pushToast);

  const showCanvasFor = (messageId: string | null, tab: CanvasTabType) => {
    ws.setSelectedCanvasMsgId(messageId);
    ws.setActiveTab(tab);
    layout.setCanvasDismissed(false);
    layout.setMobilePane('canvas');
  };

  const guardedSendClassification = async (
    prompt: string,
    opts?: { attachmentsText?: string; isBatchHint?: boolean },
  ) => {
    if (readOnlyReason) {
      ws.pushToast(readOnlyReason, 'info');
      return;
    }
    if (runtimeMode === 'eve' && eveSendRef.current) {
      const fullPrompt = opts?.attachmentsText ? `${prompt}\n\n${opts.attachmentsText}` : prompt;
      eveSendRef.current(fullPrompt);
      return;
    }
    await ws.sendClassification(prompt, opts);
  };

  const inlineActions = buildWorkspaceInlineActions({
    onSelectCanvasMessage: (messageId, tab) => showCanvasFor(messageId, tab),
    onExportPdf: () => {
      ws.setActiveTab('dossier');
      layout.setCanvasDismissed(false);
      layout.setMobilePane('canvas');
      handleExportPdf();
    },
    onSaveSku: (msg) => ws.saveSkuFromMessage(msg),
    onClassify: (prompt) => void guardedSendClassification(prompt),
  });

  const goToChat = () => {
    layout.setAnalyticsOpen(false);
    layout.setMobilePane('chat');
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-surface-app text-ink-primary">
      <input
        ref={batchInputRef}
        type="file"
        accept=".xlsx,.csv,.txt,.pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void batchJob.startBatchUpload(file);
          e.target.value = '';
        }}
      />
      <WorkspaceSidebarSlot
        desktopOpen={layout.sidebarOpen}
        mobileOpen={layout.mobileDrawerOpen}
        threads={ws.threads}
        activeThreadId={ws.activeThreadId}
        profile={ws.profile}
        plan={plan}
        skuCount={ws.skuPrecedents.length}
        dashboardActive={layout.analyticsOpen}
        onToggleDesktop={() => layout.setSidebarOpen((p) => !p)}
        onCloseMobile={() => layout.setMobileDrawerOpen(false)}
        onNewThread={() => {
          ws.startNewThread();
          setEveSessionKey((k) => k + 1);
          goToChat();
        }}
        onSelectThread={(id) => {
          ws.setActiveThreadId(id);
          ws.setSelectedCanvasMsgId(null);
          goToChat();
        }}
        onDeleteThread={ws.deleteThread}
        onOpenDashboard={() => layout.setAnalyticsOpen((p) => !p)}
        onOpenSkuCatalog={() => layout.setSkuModalOpen(true)}
        onOpenSettings={() => layout.setSettingsModalOpen(true)}
        onChangeApprovalMode={ws.setApprovalWorkflowMode}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <WorkspaceHeader48
          jurisdiction={ws.jurisdiction}
          isDark={layout.isDark}
          canvasAvailable={hasCanvas && !layout.analyticsOpen}
          canvasVisible={layout.showCanvas}
          filesCount={filesCount}
          onOpenMobileSidebar={() => layout.setMobileDrawerOpen(true)}
          onChangeJurisdiction={ws.setJurisdictionId}
          onToggleTheme={layout.handleToggleTheme}
          onToggleCanvas={() => layout.setCanvasDismissed((p) => !p)}
          onOpenFilesPanel={() => layout.setFilesPanelOpen(true)}
        />

        <div className="relative flex min-h-0 flex-1 overflow-hidden">
          {layout.analyticsOpen ? (
            <main className="min-w-0 flex-1">
              <AnalyticsWorkspaceView
                threads={ws.threads}
                skuPrecedents={ws.skuPrecedents}
                onClose={() => layout.setAnalyticsOpen(false)}
              />
            </main>
          ) : (
            <main className="flex min-w-0 flex-1 overflow-hidden">
              <section
                style={layout.showCanvas && !layout.canvasFullscreen ? ({ '--chat-w': `${layout.chatWidthPct}%` } as React.CSSProperties) : undefined}
                className={`min-w-0 flex-1 ${layout.showCanvas && !layout.canvasFullscreen ? 'lg:w-[var(--chat-w)] lg:flex-none' : ''} ${
                  layout.canvasFullscreen ? 'hidden' : layout.mobilePane === 'chat' || !layout.showCanvas ? 'block' : 'hidden lg:block'
                }`}
              >
                <WorkspaceThreadSlot
                  runtimeMode={runtimeMode}
                  eveSessionKey={eveSessionKey}
                  jurisdictionId={ws.jurisdiction.id}
                  messages={ws.activeThread?.messages ?? []}
                  isRunning={ws.isRunning}
                  liveProgress={ws.liveProgress}
                  skuPrecedents={ws.skuPrecedents}
                  pendingAttachments={ws.pendingAttachments}
                  profile={ws.profile}
                  inlineActions={inlineActions}
                  readOnlyReason={readOnlyReason}
                  batchBanner={
                    batchJob.bannerState ? (
                      <BatchProgressBanner
                        fileName={batchJob.bannerState.fileName}
                        totalItems={batchJob.bannerState.totalItems}
                        connectionStatus={batchJob.bannerState.connectionStatus}
                        progress={batchJob.bannerState.progress}
                        onDismiss={batchJob.dismissJob}
                      />
                    ) : null
                  }
                  onTriggerBatchUpload={() => {
                    if (readOnlyReason) {
                      ws.pushToast(readOnlyReason, 'info');
                      return;
                    }
                    batchInputRef.current?.click();
                  }}
                  onSendMessage={guardedSendClassification}
                  onCancelRun={ws.cancelRun}
                  onAddFiles={(files) => void ws.addFiles(files)}
                  onRemoveAttachment={ws.removeAttachment}
                  onConsumeAttachments={ws.consumePendingAttachments}
                  onRunSample={(s) => void guardedSendClassification(s.description)}
                  onRunBatchSample={(b) =>
                    void guardedSendClassification(b.promptText, { attachmentsText: b.documentText, isBatchHint: true })
                  }
                  onUpdateProfile={ws.updateProfile}
                  onEnvelopeDiscovered={ws.ingestExternalMessage}
                  onRegisterEveSend={(fn) => {
                    eveSendRef.current = fn;
                  }}
                  onNotifyInfo={(msg) => ws.pushToast(msg, 'info')}
                  onNotifyWarning={(msg) => ws.pushToast(msg, 'warning')}
                />
              </section>

              {layout.showCanvas ? (
                <WorkspaceCanvasSlot
                  components={ws.canvasComponents}
                  activeTab={ws.activeTab}
                  jurisdiction={ws.jurisdiction}
                  profile={ws.profile}
                  artifacts={threadArtifacts}
                  activeArtifactId={ws.selectedCanvasMsgId}
                  canvasFullscreen={layout.canvasFullscreen}
                  mobileVisible={layout.mobilePane === 'canvas'}
                  onStartResize={layout.handleStartResize}
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
                  onToggleFullscreen={() => layout.setCanvasFullscreen((p) => !p)}
                  onCloseCanvas={() => {
                    layout.setCanvasFullscreen(false);
                    layout.setCanvasDismissed(true);
                    layout.setMobilePane('chat');
                  }}
                />
              ) : null}
            </main>
          )}
        </div>

        {layout.showCanvas && !layout.analyticsOpen ? (
          <WorkspaceMobilePaneTabs activePane={layout.mobilePane} onSelectPane={layout.setMobilePane} />
        ) : null}
      </div>

      <WorkspaceModalsSlot
        skuModalOpen={layout.skuModalOpen}
        filesPanelOpen={layout.filesPanelOpen}
        settingsModalOpen={layout.settingsModalOpen}
        skuPrecedents={ws.skuPrecedents}
        jurisdictionId={ws.jurisdiction.id}
        jurisdictions={JURISDICTIONS}
        messages={ws.activeThread?.messages ?? []}
        pendingAttachments={ws.pendingAttachments}
        profile={ws.profile}
        plan={plan}
        threads={ws.threads}
        onCloseSku={() => layout.setSkuModalOpen(false)}
        onSaveSku={ws.saveSku}
        onDeleteSku={ws.deleteSku}
        onCloseFiles={() => layout.setFilesPanelOpen(false)}
        onCloseSettings={() => layout.setSettingsModalOpen(false)}
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
