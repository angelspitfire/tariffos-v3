import { createContext, useContext } from 'react';
import type {
  ChatMessage,
  A2UIArtifact,
  ManifestLineItem,
} from '@/types/domain';
import type { FilingRecord } from '@/lib/filings-catalog';
import type { AuditLogEntry } from '@/lib/audit-log';
import type { ConversationFile } from '@/types/files';

export interface TariffChatContextValue {
  messages: ChatMessage[];
  isRunning: boolean;
  artifacts: A2UIArtifact[];
  activeArtifact: A2UIArtifact | null;
  openTabIds: string[];
  isCanvasOpen: boolean;
  isDrawerOpen: boolean;
  activeFilingId: string;
  activeFiling: FilingRecord;
  conversationFiles: ConversationFile[];
  addConversationFile: (file: ConversationFile) => void;
  auditEntries: AuditLogEntry[];
  addAuditEntry: (entry: AuditLogEntry) => void;
  setIsCanvasOpen: (open: boolean) => void;
  setIsDrawerOpen: (open: boolean) => void;
  activateArtifact: (id: string) => void;
  closeTab: (id: string) => void;
  pushCustomArtifact: (artifact: A2UIArtifact) => void;
  updateManifestItem: (artifactId: string, itemId: string, patch: Partial<ManifestLineItem>) => void;
  switchFiling: (filingId: string) => void;
  sendMessage: (text: string) => Promise<void>;
}

export const TariffChatContext = createContext<TariffChatContextValue | null>(null);

export function useTariffChat(): TariffChatContextValue {
  const ctx = useContext(TariffChatContext);
  if (!ctx) throw new Error('useTariffChat must be used within TariffRuntimeProvider');
  return ctx;
}
