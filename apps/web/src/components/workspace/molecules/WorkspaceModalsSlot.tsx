'use client';

import type { SkuPrecedent, UserProfileSettings } from '@tariffos/shared-types';
import type { JurisdictionConfig } from '@tariffos/shared-types';
import type { WorkspacePlanStatus } from '@/lib/workspace/plan-status';
import type {
  WorkspaceAttachment,
  WorkspaceMessage,
  WorkspaceThread,
  WorkspaceToast,
} from '@/lib/workspace/types';
import { ChatFilesPanel } from '../organisms/ChatFilesPanel';
import { SkuCatalogModal } from '../organisms/SkuCatalogModal';
import { WorkspaceSettingsModal } from '../organisms/WorkspaceSettingsModal';

export interface WorkspaceModalsSlotProps {
  skuModalOpen: boolean;
  filesPanelOpen: boolean;
  settingsModalOpen: boolean;
  skuPrecedents: readonly SkuPrecedent[];
  jurisdictionId: string;
  jurisdictions: readonly JurisdictionConfig[];
  messages: readonly WorkspaceMessage[];
  pendingAttachments: readonly WorkspaceAttachment[];
  profile: UserProfileSettings;
  plan: WorkspacePlanStatus;
  threads: readonly WorkspaceThread[];
  onCloseSku: () => void;
  onSaveSku: (precedent: SkuPrecedent) => void;
  onDeleteSku: (id: string) => void;
  onCloseFiles: () => void;
  onCloseSettings: () => void;
  onSaveSettings: (patch: Partial<UserProfileSettings>) => void;
  onClassify: (prompt: string) => void;
  onToast: (title: string, variant?: WorkspaceToast['variant']) => void;
}

/** Groups workspace modal overlays to keep WorkspaceSplitShell concise. */
export function WorkspaceModalsSlot({
  skuModalOpen,
  filesPanelOpen,
  settingsModalOpen,
  skuPrecedents,
  jurisdictionId,
  jurisdictions,
  messages,
  pendingAttachments,
  profile,
  plan,
  threads,
  onCloseSku,
  onSaveSku,
  onDeleteSku,
  onCloseFiles,
  onCloseSettings,
  onSaveSettings,
  onClassify,
  onToast,
}: WorkspaceModalsSlotProps) {
  return (
    <>
      <SkuCatalogModal
        open={skuModalOpen}
        precedents={skuPrecedents}
        jurisdictionId={jurisdictionId}
        onClose={onCloseSku}
        onSave={onSaveSku}
        onDelete={onDeleteSku}
        onApplyToChat={(item) => onClassify(`Clasificar precedente SKU ${item.sku}: ${item.title}`)}
      />

      <ChatFilesPanel
        open={filesPanelOpen}
        messages={messages}
        pendingAttachments={pendingAttachments}
        onClose={onCloseFiles}
        onReclassifyFile={(att) =>
          onClassify(
            att.extractedText
              ? `Clasificar documento adjunto (${att.name}):\n${att.extractedText}`
              : `Clasificar archivo ${att.name}`,
          )
        }
      />

      <WorkspaceSettingsModal
        key={settingsModalOpen ? 'open' : 'closed'}
        open={settingsModalOpen}
        profile={profile}
        jurisdictions={jurisdictions}
        plan={plan}
        threadsCount={threads.length}
        skuCount={skuPrecedents.length}
        onClose={onCloseSettings}
        onSave={(patch) => {
          onSaveSettings(patch);
          onToast('Configuración guardada.', 'success');
        }}
        onApplyNotice={(summary) =>
          onClassify(`Evaluar impacto normativo en la clasificación actual: ${summary}`)
        }
        onExportBackup={() => {
          const payload = JSON.stringify({ profile, threads, skuPrecedents }, null, 2);
          const url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
          const a = document.createElement('a');
          a.href = url;
          a.download = `tariffos-backup-${new Date().toISOString().slice(0, 10)}.json`;
          a.click();
          URL.revokeObjectURL(url);
          onToast('Respaldo JSON descargado.', 'success');
        }}
        onClearLocalData={() => {
          window.localStorage.clear();
          onToast('Caché local limpiada. Recarga para reiniciar sesión.', 'info');
        }}
      />
    </>
  );
}