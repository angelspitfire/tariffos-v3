'use client';

import { useState, useCallback, useRef, useEffect, type ReactNode } from 'react';
import { type ChatMessage, type A2UIArtifact, type ManifestLineItem, type ManifestGridPayload } from '@/types/domain';
import { INITIAL_CHAT_MESSAGES } from '@/lib/a2ui-artifacts';
import { createUpdateManifestItem } from '@/lib/update-manifest-item';
import { sendChatRequest } from '@/lib/chat-api-client';
import { MOCK_FILINGS } from '@/lib/filings-catalog';
import { createAuditEntry, type AuditLogEntry } from '@/lib/audit-log';
import type { ConversationFile } from '@/types/files';
import { TariffChatContext, useTariffChat } from './tariff-runtime-context';

export { useTariffChat };
export type { TariffChatContextValue } from './tariff-runtime-context';

const DEFAULT_FILING_ID = 'TR-2024-8849-VE';
const STORAGE_KEY_FILING = 'tariffos_active_filing';
const STORAGE_KEY_TABS = 'tariffos_open_tabs';
const now = () => new Date().toLocaleString('en-US', { hour: '2-digit', minute: '2-digit' });

const INITIAL_AUDIT: AuditLogEntry[] = [
  createAuditEntry('system', 'Apertura de trámite', 'Despacho TR-2024-8849-VE inicializado con canal Rojo'),
];

export function TariffRuntimeProvider({ children }: { children: ReactNode }) {
  const [activeFilingId, setActiveFilingId] = useState<string>(DEFAULT_FILING_ID);
  const activeFiling = MOCK_FILINGS[activeFilingId] ?? MOCK_FILINGS[DEFAULT_FILING_ID];

  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [isRunning, setIsRunning] = useState(false);
  const [isCanvasOpen, setIsCanvasOpen] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [artifacts, setArtifacts] = useState<A2UIArtifact[]>([activeFiling.manifestArtifact]);
  const [openTabIds, setOpenTabIds] = useState<string[]>([activeFiling.manifestArtifact.id]);
  const [activeArtifactId, setActiveArtifactId] = useState<string | null>(activeFiling.manifestArtifact.id);
  const [conversationFiles, setConversationFiles] = useState<ConversationFile[]>(activeFiling.documents ?? []);
  const [auditEntries, setAuditEntries] = useState<AuditLogEntry[]>(INITIAL_AUDIT);
  const abortControllerRef = useRef<AbortController | null>(null);

  const addAuditEntry = useCallback((entry: AuditLogEntry) => {
    setAuditEntries((prev) => [entry, ...prev]);
  }, []);

  const addConversationFile = useCallback((file: ConversationFile) => {
    setConversationFiles((prev) => [file, ...prev]);
    addAuditEntry(createAuditEntry('broker', 'Archivo adjuntado', `${file.name} (${file.typeLabel})`));
  }, [addAuditEntry]);

  useEffect(() => {
    try {
      const savedFiling = localStorage.getItem(STORAGE_KEY_FILING);
      if (savedFiling && MOCK_FILINGS[savedFiling]) setActiveFilingId(savedFiling);
      const savedTabs = localStorage.getItem(STORAGE_KEY_TABS);
      if (savedTabs) {
        const parsed = JSON.parse(savedTabs) as string[];
        if (Array.isArray(parsed) && parsed.length > 0) setOpenTabIds(parsed);
      }
    } catch {}
  }, []);

  const switchFiling = useCallback((filingId: string) => {
    const record = MOCK_FILINGS[filingId];
    if (!record) return;

    setActiveFilingId(filingId);
    setArtifacts([record.manifestArtifact]);
    setOpenTabIds([record.manifestArtifact.id]);
    setActiveArtifactId(record.manifestArtifact.id);
    setConversationFiles(record.documents ?? []);
    setIsCanvasOpen(true);

    const switchMsg: ChatMessage = {
      id: `switch-${Date.now()}`,
      role: 'assistant',
      content: `Trámite ${record.code} (${record.route}) cargado en la mesa de aforo.`,
      timestamp: now(),
      organism: { kind: 'manifest-grid', data: record.manifestArtifact.data as ManifestGridPayload },
      artifactId: record.manifestArtifact.id,
    };
    setMessages([switchMsg]);
    addAuditEntry(createAuditEntry('broker', 'Cambio de despacho', `Trámite ${record.code} cargado`));

    try {
      localStorage.setItem(STORAGE_KEY_FILING, filingId);
      localStorage.setItem(STORAGE_KEY_TABS, JSON.stringify([record.manifestArtifact.id]));
    } catch {}
  }, [addAuditEntry]);

  const activateArtifact = useCallback((id: string) => {
    setOpenTabIds((prev) => {
      const next = prev.includes(id) ? prev : [...prev, id];
      try { localStorage.setItem(STORAGE_KEY_TABS, JSON.stringify(next)); } catch {}
      return next;
    });
    setActiveArtifactId(id);
    setIsCanvasOpen(true);
  }, []);

  const closeTab = useCallback((id: string) => {
    setOpenTabIds((prev) => {
      const next = prev.filter((tabId) => tabId !== id);
      if (activeArtifactId === id) setActiveArtifactId(next[0] ?? null);
      try { localStorage.setItem(STORAGE_KEY_TABS, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [activeArtifactId]);

  const pushCustomArtifact = useCallback((art: A2UIArtifact) => {
    setArtifacts((prev) => {
      const exists = prev.find((a) => a.id === art.id);
      return exists ? prev.map((a) => (a.id === art.id ? art : a)) : [...prev, art];
    });
    setOpenTabIds((prev) => (prev.includes(art.id) ? prev : [...prev, art.id]));
    setActiveArtifactId(art.id);
    setIsCanvasOpen(true);
    addAuditEntry(createAuditEntry('system', 'Documento agregado', art.title));
  }, [addAuditEntry]);

  const rawUpdateManifest = createUpdateManifestItem(setArtifacts);
  const updateManifestItem = useCallback(
    (artifactId: string, itemId: string, patch: Partial<ManifestLineItem>) => {
      rawUpdateManifest(artifactId, itemId, patch);
      const diffDesc = Object.entries(patch).map(([k, v]) => `${k}: ${String(v)}`).join(', ');
      addAuditEntry(createAuditEntry('broker', 'Ajuste de partida', `Ítem ${itemId}: ${diffDesc}`));
    },
    [rawUpdateManifest, addAuditEntry]
  );

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isRunning) return;

      const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: trimmed, timestamp: now() };
      setMessages((prev) => [...prev, userMsg]);
      setIsRunning(true);
      addAuditEntry(createAuditEntry('broker', 'Consulta técnica', trimmed));

      abortControllerRef.current?.abort();
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        // Use Promise.race with timeout to prevent page wedges
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Stream timeout')), 10000)
        );
        
        const responsePromise = sendChatRequest(
          [...messages, userMsg],
          abortController.signal
        );

        const { responseText, artifact, organism, display } = await Promise.race([responsePromise, timeoutPromise]);

        if (artifact) {
          setArtifacts((prev) => [...prev, artifact]);
          setOpenTabIds((prev) => (prev.includes(artifact.id) ? prev : [...prev, artifact.id]));
          setActiveArtifactId(artifact.id);
          setIsCanvasOpen(true);
        }

        const finalText = responseText || 'Contexto de despacho aduanero actualizado.';
        setMessages((prev) => [
          ...prev,
          { id: `a-${Date.now()}`, role: 'assistant', content: finalText, timestamp: now(), organism, artifactId: artifact?.id, display },
        ]);
        addAuditEntry(createAuditEntry('ai', 'Respuesta técnica', finalText.slice(0, 100)));
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setMessages((prev) => [
          ...prev,
          { id: `err-${Date.now()}`, role: 'assistant', content: 'Error en servicio aduanero. Reintente.', timestamp: 'Ahora' },
        ]);
      } finally {
        setIsRunning(false);
      }
    },
    [messages, isRunning, addAuditEntry]
  );

  const activeArtifact = artifacts.find((a) => a.id === activeArtifactId) ?? null;

  return (
    <TariffChatContext.Provider
      value={{
        messages, isRunning, artifacts, activeArtifact, openTabIds,
        isCanvasOpen, isDrawerOpen, activeFilingId, activeFiling,
        conversationFiles, addConversationFile,
        auditEntries, addAuditEntry, setIsCanvasOpen, setIsDrawerOpen,
        activateArtifact, closeTab, pushCustomArtifact, updateManifestItem,
        switchFiling, sendMessage,
      }}
    >
      {children}
    </TariffChatContext.Provider>
  );
}
