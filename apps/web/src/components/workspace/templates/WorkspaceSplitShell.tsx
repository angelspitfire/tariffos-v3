'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CanvasTabType } from '@tariffos/shared-types';
import { readSelectedPlan } from '@/lib/funnel/funnel-storage';
import { isCloudModeEnabled } from '@/lib/runtime-config';
import { extractThreadArtifacts } from '@/lib/workspace/artifact-versions';
import { createReadOnlyDemoThread } from '@/lib/workspace/demo-readonly-thread';
import { exportWorkspaceDossierPdf } from '@/lib/workspace/dossier-pdf';
import { buildWorkspaceInlineActions } from '@/lib/workspace/inline-actions';
import { JURISDICTIONS } from '@/lib/workspace/jurisdictions';
import { computePlanStatus, mergeCloudUsageIntoPlanStatus, resolveWorkspaceReadOnlyReason } from '@/lib/workspace/plan-status';
import { useBatchJob } from '@/lib/workspace/use-batch-job';
import { useCloudUsageState } from '@/lib/workspace/use-cloud-usage';
import { usePendingQueryAutorun } from '@/lib/workspace/use-pending-query-autorun';
import { useWorkspaceShortcuts } from '@/lib/workspace/use-workspace-shortcuts';
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
  const [surfaceKey, setSurfaceKey] = useState('eve-new-0');
  const ownedThreadIdRef = useRef<string | null>(null);
  const agentSendRef = useRef<((text: string) => void) | null>(null);
  const batchInputRef = useRef<HTMLInputElement | null>(null);
  const { usage: cloudUsage, loaded: cloudUsageLoaded } = useCloudUsageState();
  const readOnlyReason = resolveWorkspaceReadOnlyReason(cloudUsage);
  const demoThread = createReadOnlyDemoThread();
  const showDemoFallback = Boolean(readOnlyReason) && ws.threads.length === 0;
  const visibleThreads = showDemoFallback ? [demoThread] : ws.threads;
  const visibleActiveThread = showDemoFallback ? demoThread : ws.activeThread;
  const visibleCanvasComponents = showDemoFallback ? (demoThread.messages[1]?.envelope?.canvasComponents ?? []) : ws.canvasComponents;

  // Remount EveThreadSurface when switching to an externally loaded or selected thread,
  // but NEVER remount mid-stream when a fresh surface binds its own newly created thread.
  useEffect(() => {
    const targetId = visibleActiveThread?.id ?? null;
    if (targetId === ownedThreadIdRef.current) return;
    ownedThreadIdRef.current = targetId;
    setSurfaceKey(targetId ? `eve-thread-${targetId}` : `eve-new-${Date.now()}`);
  }, [visibleActiveThread?.id]);

  const batchJob = useBatchJob({
    jurisdiction: ws.jurisdiction,
    deepMode: ws.profile.detailLevel === 'exhaustive',
    approvalWorkflowMode: ws.profile.approvalWorkflowMode,
    onBatchCompleted: (msg) => {
      const boundId = ws.ingestExternalMessage(msg);
      if (!ownedThreadIdRef.current) ownedThreadIdRef.current = boundId;
    },
    pushToast: ws.pushToast,
  });

  const hasCanvas = visibleCanvasComponents.length > 0;
  const threadArtifacts = extractThreadArtifacts(visibleActiveThread?.messages ?? []);
  const filesCount = ws.pendingAttachments.length + (visibleActiveThread?.messages.reduce((acc, m) => acc + (m.attachments?.length ?? 0), 0) ?? 0);
  const layout = useWorkspaceShellLayout({ activeThreadId: visibleActiveThread?.id ?? ws.activeThreadId, hasCanvas, themePreference: ws.profile.themePreference, onSaveTheme: (themePreference) => ws.updateProfile({ themePreference }) });
  const plan = mergeCloudUsageIntoPlanStatus(computePlanStatus(ws.threads, planId), cloudUsage);

  useEffect(() => { setPlanId(readSelectedPlan()?.planId ?? 'pilot'); }, []);

  const handleExportPdf = (targetComponents = visibleCanvasComponents) => exportWorkspaceDossierPdf(targetComponents, ws.profile, ws.pushToast);
  const showCanvasFor = (messageId: string | null, tab: CanvasTabType) => {
    ws.setSelectedCanvasMsgId(messageId); ws.setActiveTab(tab); layout.setCanvasDismissed(false); layout.setMobilePane('canvas');
  };

  const sendToAgent = async (prompt: string, opts?: { attachmentsText?: string; isBatchHint?: boolean }) => {
    if (readOnlyReason) { ws.pushToast(readOnlyReason, 'info'); return; }
    if (agentSendRef.current) {
      agentSendRef.current(opts?.attachmentsText ? `${prompt}\n\n${opts.attachmentsText}` : prompt);
      return;
    }
    await ws.sendClassification(prompt, opts);
  };

  usePendingQueryAutorun({ cloudMode: isCloudModeEnabled(), usageLoaded: cloudUsageLoaded, readOnlyReason, onRunQuery: (q) => void sendToAgent(q) });

  const inlineActions = buildWorkspaceInlineActions({
    onSelectCanvasMessage: showCanvasFor,
    onExportPdf: (msg) => { showCanvasFor(msg.id, 'dossier'); handleExportPdf(msg.envelope?.canvasComponents ?? visibleCanvasComponents); },
    onSaveSku: (msg) => ws.saveSkuFromMessage(msg),
    onClassify: (prompt) => void sendToAgent(prompt),
  });

  const goToChat = () => { layout.setAnalyticsOpen(false); layout.setMobilePane('chat'); };
  const focusComposer = () => {
    goToChat();
    requestAnimationFrame(() => {
      document.querySelector<HTMLTextAreaElement>('textarea[aria-label="Consulta arancelaria o descripción de mercancía"]')?.focus();
    });
  };
  const onNewThread = () => { ownedThreadIdRef.current = null; ws.startNewThread(); setSurfaceKey(`eve-new-${Date.now()}`); focusComposer(); };

  useWorkspaceShortcuts({
    canvasOpen: layout.showCanvas,
    hasOpenModal: layout.skuModalOpen || layout.settingsModalOpen || layout.filesPanelOpen,
    onFocusComposer: focusComposer,
    onNewThread,
    onCloseCanvas: () => { layout.setCanvasFullscreen(false); layout.setCanvasDismissed(true); layout.setMobilePane('chat'); },
  });
  const onSelectThread = (id: string) => { ownedThreadIdRef.current = id; ws.setActiveThreadId(id); ws.setSelectedCanvasMsgId(null); setSurfaceKey(`eve-thread-${id}`); goToChat(); };
  const onTriggerBatch = () => (readOnlyReason ? ws.pushToast(readOnlyReason, 'info') : batchInputRef.current?.click());
  const handleRegisterAgentSend = useCallback((fn: ((text: string) => void) | null) => {
    agentSendRef.current = fn;
  }, []);
  const { bindEveSessionId, syncChatMessages } = ws;
  const handleSessionIdDiscovered = useCallback((sid: string) => { ownedThreadIdRef.current = bindEveSessionId(sid); }, [bindEveSessionId]);
  const handleSyncChatMessages = useCallback((msgs: Parameters<typeof syncChatMessages>[0], latestId: string | null) => { ownedThreadIdRef.current = syncChatMessages(msgs, latestId); }, [syncChatMessages]);

  return (
    <div className="flex h-dvh overflow-hidden bg-surface-app text-ink-primary">
      <input ref={batchInputRef} type="file" accept=".xlsx,.csv,.txt,.pdf,.png,.jpg,.jpeg,.webp" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) void batchJob.startBatchUpload(file); e.target.value = ''; }} />

      {!layout.canvasFullscreen ? (
        <WorkspaceSidebarSlot
          desktopOpen={layout.sidebarOpen} mobileOpen={layout.mobileDrawerOpen} threads={visibleThreads} threadsLoading={ws.threadsLoading} activeThreadId={visibleActiveThread?.id ?? ws.activeThreadId}
          profile={ws.profile} plan={plan} skuCount={ws.skuPrecedents.length} dashboardActive={layout.analyticsOpen}
          onToggleDesktop={() => layout.setSidebarOpen((p) => !p)} onCloseMobile={() => layout.setMobileDrawerOpen(false)}
          onNewThread={onNewThread} onSelectThread={onSelectThread} onDeleteThread={ws.deleteThread}
          onOpenDashboard={() => layout.setAnalyticsOpen((p) => !p)} onOpenSkuCatalog={() => layout.setSkuModalOpen(true)}
          onOpenSettings={() => layout.setSettingsModalOpen(true)} onChangeApprovalMode={ws.setApprovalWorkflowMode}
        />
      ) : null}

      {layout.analyticsOpen ? (
        <div className="flex min-w-0 flex-1 flex-col">
          <WorkspaceHeader48
            jurisdiction={ws.jurisdiction} isDark={layout.isDark} canvasAvailable={false} canvasVisible={false} filesCount={filesCount}
            onOpenMobileSidebar={() => layout.setMobileDrawerOpen(true)} onChangeJurisdiction={ws.setJurisdictionId}
            onToggleTheme={layout.handleToggleTheme} onToggleCanvas={() => undefined} onOpenFilesPanel={() => layout.setFilesPanelOpen(true)} onNewThread={onNewThread}
          />
          <main className="min-h-0 min-w-0 flex-1">
            <AnalyticsWorkspaceView threads={ws.threads} skuPrecedents={ws.skuPrecedents} onClose={() => layout.setAnalyticsOpen(false)} />
          </main>
        </div>
      ) : (
        <main className="flex min-w-0 flex-1 overflow-hidden">
          <div
            style={layout.showCanvas && !layout.canvasFullscreen ? ({ '--chat-w': `${layout.chatWidthPct}%` } as React.CSSProperties) : undefined}
            className={`min-h-0 min-w-0 flex-1 flex-col ${layout.showCanvas && !layout.canvasFullscreen ? 'lg:w-[var(--chat-w)] lg:flex-none' : ''} ${layout.canvasFullscreen ? 'hidden' : layout.mobilePane === 'chat' || !layout.showCanvas ? 'flex' : 'hidden lg:flex'}`}
          >
            <WorkspaceHeader48
              jurisdiction={ws.jurisdiction} isDark={layout.isDark} canvasAvailable={hasCanvas} canvasVisible={layout.showCanvas} filesCount={filesCount}
              onOpenMobileSidebar={() => layout.setMobileDrawerOpen(true)} onChangeJurisdiction={ws.setJurisdictionId}
              onToggleTheme={layout.handleToggleTheme} onToggleCanvas={() => layout.setCanvasDismissed((p) => !p)}
              onOpenFilesPanel={() => layout.setFilesPanelOpen(true)} onNewThread={onNewThread}
            />
            <WorkspaceThreadSlot
              surfaceKey={surfaceKey} eveSessionId={showDemoFallback ? null : (visibleActiveThread?.eveSessionId ?? null)}
              jurisdictionId={ws.jurisdiction.id} countryCode={ws.jurisdiction.countryCode} messages={visibleActiveThread?.messages ?? []}
              skuPrecedents={ws.skuPrecedents} pendingAttachments={ws.pendingAttachments} profile={ws.profile} inlineActions={inlineActions} readOnlyReason={readOnlyReason}
              batchBanner={batchJob.bannerState ? <BatchProgressBanner fileName={batchJob.bannerState.fileName} totalItems={batchJob.bannerState.totalItems} connectionStatus={batchJob.bannerState.connectionStatus} progress={batchJob.bannerState.progress} onDismiss={batchJob.dismissJob} /> : null}
              onTriggerBatchUpload={onTriggerBatch} onAddFiles={(files) => void ws.addFiles(files)} onRemoveAttachment={ws.removeAttachment}
              onConsumeAttachments={ws.consumePendingAttachments} onRunSample={(s) => void sendToAgent(s.description)}
              onRunBatchSample={(b) => void sendToAgent(b.promptText, { attachmentsText: b.documentText, isBatchHint: true })}
              onUpdateProfile={ws.updateProfile}
              onSessionIdDiscovered={handleSessionIdDiscovered}
              onSyncChatMessages={handleSyncChatMessages}
              onRegisterAgentSend={handleRegisterAgentSend} onNotifyWarning={(msg) => ws.pushToast(msg, 'warning')}
            />
            {layout.showCanvas ? <WorkspaceMobilePaneTabs activePane={layout.mobilePane} onSelectPane={layout.setMobilePane} /> : null}
          </div>

          {layout.showCanvas ? (
            <WorkspaceCanvasSlot
              components={visibleCanvasComponents} activeTab={ws.activeTab} jurisdiction={ws.jurisdiction} profile={ws.profile}
              artifacts={threadArtifacts} activeArtifactId={ws.selectedCanvasMsgId} canvasFullscreen={layout.canvasFullscreen} mobileVisible={layout.mobilePane === 'canvas'}
              onStartResize={layout.handleStartResize} onSelectTab={ws.setActiveTab} onApproveDossier={ws.approveActiveDossier}
              onRequestDossierReview={ws.requestDossierReview} onChangeWorkflowMode={ws.setApprovalWorkflowMode}
              onReevaluateSpecs={(specs) => void sendToAgent(`Reevaluar dictamen con ficha actualizada: ${specs.map((s) => `${s.key}: ${s.value}`).join('; ')}`)}
              onSaveSku={() => ws.saveSkuFromMessage()}
              onSaveSignature={(p) => ws.updateProfile({ fullName: p.fullName, brokerLicense: p.brokerLicense, brokerSignatureDataUrl: p.signatureDataUrl })}
              onExportPdf={() => handleExportPdf()} onConfirmBatchItem={ws.confirmBatchItem} onSelectArtifact={ws.setSelectedCanvasMsgId}
              onToggleFullscreen={() => layout.setCanvasFullscreen((p) => !p)}
              onCloseCanvas={() => { layout.setCanvasFullscreen(false); layout.setCanvasDismissed(true); layout.setMobilePane('chat'); }}
            />
          ) : null}
        </main>
      )}

      <WorkspaceModalsSlot
        skuModalOpen={layout.skuModalOpen} filesPanelOpen={layout.filesPanelOpen} settingsModalOpen={layout.settingsModalOpen}
        skuPrecedents={ws.skuPrecedents} jurisdictionId={ws.jurisdiction.id} jurisdictions={JURISDICTIONS}
        messages={visibleActiveThread?.messages ?? []} pendingAttachments={ws.pendingAttachments} profile={ws.profile} plan={plan} threads={ws.threads}
        onCloseSku={() => layout.setSkuModalOpen(false)} onSaveSku={ws.saveSku} onDeleteSku={ws.deleteSku}
        onCloseFiles={() => layout.setFilesPanelOpen(false)} onCloseSettings={() => layout.setSettingsModalOpen(false)}
        onSaveSettings={ws.updateProfile} onClassify={(prompt) => void sendToAgent(prompt)} onClearLocalData={() => void ws.clearLocalData()} onToast={ws.pushToast}
      />

      {ws.toast ? (
        <output className="no-print fixed right-4 bottom-14 z-50 rounded-xl border border-border-subtle bg-surface-inverted px-3.5 py-2 text-xs font-medium text-ink-on-inverted shadow-lg lg:bottom-4">
          {ws.toast.title}
        </output>
      ) : null}
    </div>
  );
}
