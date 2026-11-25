'use client';

import { useCallback, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { WorkstationLayout } from '@/components/organisms/WorkstationLayout';
import { TariffChatStream } from '@/components/organisms/TariffChatStream';
import { DynamicCanvas } from '@/components/organisms/DynamicCanvas';
import { TariffRuntimeProvider, useTariffChat } from '@/components/TariffRuntimeProvider';
import { TariffReferenceProvider } from '@/components/tariff-reference/TariffReferenceProvider';
import { ToastProvider, Toaster } from '@/components/organisms/Toast';
import { MOCK_FILINGS } from '@/lib/filings-catalog';
import { useI18n } from '@/lib/i18n';
import { KeyboardShortcutsModal } from '@/components/KeyboardShortcutsModal';
import { type CustomsDossierPayload } from '@/types/dossier';
import { type CommandPaletteAction } from '@/components/organisms/CustomsCommandPalette';

// Code-split heavy modals
const DocumentDropzoneModal = dynamic<
  import('@/components/organisms/DocumentDropzoneModal').DocumentDropzoneModalProps
>(() => import('@/components/organisms/DocumentDropzoneModal').then(m => ({ default: m.DocumentDropzoneModal })), {
  ssr: false,
  loading: () => null,
});

const CustomsCommandPalette = dynamic<
  import('@/components/organisms/CustomsCommandPalette').CustomsCommandPaletteProps
>(() => import('@/components/organisms/CustomsCommandPalette').then(m => ({ default: m.CustomsCommandPalette })), {
  ssr: false,
  loading: () => null,
});

const CustomsDossierDocument = dynamic<
  import('@/components/organisms/CustomsDossierDocument').CustomsDossierDocumentProps
>(() => import('@/components/organisms/CustomsDossierDocument').then(m => ({ default: m.CustomsDossierDocument })), {
  ssr: false,
  loading: () => null,
});

function WorkstationContent() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [dossierPayload, setDossierPayload] = useState<CustomsDossierPayload | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const {
    artifacts,
    activeArtifact,
    openTabIds,
    isCanvasOpen,
    isDrawerOpen,
    activeFiling,
    conversationFiles,
    addConversationFile,
    setIsCanvasOpen,
    setIsDrawerOpen,
    activateArtifact,
    closeTab,
    updateManifestItem,
    switchFiling,
    sendMessage,
  } = useTariffChat();
  const { t } = useI18n();

  const handleOpenUpload = useCallback(() => setIsUploadOpen(true), []);
  const handleOpenPalette = useCallback(() => setIsPaletteOpen(true), []);
  const handleClosePalette = useCallback(() => setIsPaletteOpen(false), []);
  const handleCloseShortcuts = useCallback(() => setIsShortcutsOpen(false), []);
  const handleToggleShortcuts = useCallback(
    () => setIsShortcutsOpen((prev) => !prev),
    []
  );
  const handleCloseDossier = useCallback(() => setIsDossierOpen(false), []);
  const handleToggleCanvas = useCallback(
    () => setIsCanvasOpen(!isCanvasOpen),
    [isCanvasOpen]
  );
  const handleNewFiling = useCallback(
    () => void sendMessage(t('Nuevo despacho aduanero')),
    [sendMessage, t]
  );
  const handleSelectFiling = useCallback(
    (id: string) => switchFiling(id),
    [switchFiling]
  );
  const handleAnalyzeFile = useCallback(
    (name: string) => void sendMessage(`Analizar factura comercial cargada: ${name}`),
    [sendMessage]
  );
  const handleCloseUpload = useCallback(() => setIsUploadOpen(false), []);
  const handleImportCompleted = useCallback(
    (name: string) => {
      const isXls = name.endsWith('.xlsx');
      addConversationFile({
        id: `doc-${Date.now()}`, name,
        type: isXls ? 'packing_list' : 'invoice',
        typeLabel: isXls ? 'Lista de Empaque' : 'Factura Comercial',
        size: '250 KB', uploadedAt: 'Ahora',
      });
      void sendMessage(`Analizar factura comercial cargada: ${name}`);
    },
    [addConversationFile, sendMessage]
  );
  const handleQuickStartBatch = useCallback(
    () => void sendMessage('Ver manifiesto de carga'),
    [sendMessage]
  );
  const handleCloseCanvas = useCallback(() => setIsCanvasOpen(false), []);
  const handleToggleSidebar = useCallback(
    () => setIsSidebarExpanded(!isSidebarExpanded),
    [isSidebarExpanded]
  );
  const handleQuickStartSingle = useCallback(
    () => void sendMessage('Clasificar fuente conmutada 220V'),
    [sendMessage]
  );

  const paletteActions: CommandPaletteAction[] = useMemo(() => {
    const filingActions: CommandPaletteAction[] = Object.values(MOCK_FILINGS).map((f) => ({
      id: `filing-${f.id}`,
      category: 'Trámites',
      title: f.title,
      subtitle: `${f.code} · ${f.route}`,
      perform: () => switchFiling(f.id),
    }));

    const viewActions: CommandPaletteAction[] = [
      {
        id: 'view-canvas', category: 'Vistas',
        title: isCanvasOpen ? 'Ocultar Mesa de Aforo' : 'Mostrar Mesa de Aforo',
        subtitle: 'Panel dinámico de manifiestos y expedientes',
        perform: () => setIsCanvasOpen(!isCanvasOpen),
      },
      {
        id: 'view-drawer', category: 'Vistas',
        title: 'Abrir Expediente Documental',
        subtitle: 'Bandeja lateral de documentos analizados',
        perform: () => setIsDrawerOpen(true),
      },
    ];

    const customsActions: CommandPaletteAction[] = [
      {
        id: 'act-manifest',
        category: 'Acciones',
        title: 'Ver manifiesto de carga',
        subtitle: 'Visualizar partidas arancelarias en la mesa',
        perform: handleQuickStartBatch,
      },
      {
        id: 'act-upload',
        category: 'Acciones',
        title: 'Cargar factura comercial (PDF/XML)',
        subtitle: 'Importar documentos aduaneros para análisis',
        perform: handleOpenUpload,
      },
      {
        id: 'act-new-filing',
        category: 'Acciones',
        title: 'Nuevo despacho aduanero',
        subtitle: 'Iniciar una nueva declaración de importación',
        perform: handleNewFiling,
      },
      {
        id: 'act-dossier',
        category: 'Acciones',
        title: 'Generar Expediente Oficial',
        subtitle: 'Crear dictamen técnico de clasificación arancelaria',
        perform: () => {
          const customsDossierArtifact = artifacts.find(a => a.type === 'customs-dossier');
          if (customsDossierArtifact) {
            setDossierPayload(customsDossierArtifact.data as CustomsDossierPayload);
            setIsDossierOpen(true);
          } else {
            void sendMessage('Generar expediente oficial');
          }
        },
      },
    ];

    return [...filingActions, ...viewActions, ...customsActions];
  }, [isCanvasOpen, setIsCanvasOpen, setIsDrawerOpen, switchFiling, sendMessage, t, artifacts, handleQuickStartBatch, handleOpenUpload, handleNewFiling]);

  const handleSelectItem = useCallback(
    (item: { id: string; itemNumber: number; hsCode: string; description: string; quantity: number; unit: string; fobValue: number; cifValue: number; dutyRate: number; vatRate: number; confidence: number; permits: string[]; candidates?: { hsCode: string; description: string; dutyRate: number; confidence: number; rationale: string }[]; justification?: string }) => {
      void sendMessage(`Seleccionada partida: ${item.hsCode} - ${item.description}`);
    },
    [sendMessage]
  );

  return (
    <TariffReferenceProvider>
      <ToastProvider>
        <WorkstationLayout
          chat={<TariffChatStream onOpenUploadModal={handleOpenUpload} />}
          isCanvasOpen={isCanvasOpen}
          onToggleCanvas={handleToggleCanvas}
          isSidebarExpanded={isSidebarExpanded}
          onToggleSidebar={handleToggleSidebar}
          onNewFiling={handleNewFiling}
          isDrawerOpen={isDrawerOpen}
          onToggleDrawer={setIsDrawerOpen}
          artifacts={artifacts}
          activeArtifactId={activeArtifact?.id ?? null}
          onSelectArtifact={activateArtifact}
          onSelectFiling={handleSelectFiling}
          onSelectAssistant={() => {
            // Focus the chat assistant
          }}
          onSelectTariffReference={() => {
            // The TariffReferenceView handles its own open state
          }}
          filingCode={activeFiling.code}
          channel={activeFiling.channel}
          reasons={activeFiling.reasons}
          files={conversationFiles}
          onAnalyzeFile={handleAnalyzeFile}
          onOpenUpload={handleOpenUpload}
          onOpenCommandPalette={handleOpenPalette}
          canvas={
            <DynamicCanvas
              activeArtifact={activeArtifact}
              artifacts={artifacts}
              openTabIds={openTabIds}
              onSelectArtifact={activateArtifact}
              onCloseTab={closeTab}
              onCloseCanvas={handleCloseCanvas}
              onSelectItem={handleSelectItem}
              onUpdateManifestItem={updateManifestItem}
              onQuickStartBatch={handleQuickStartBatch}
              onQuickStartSingle={handleQuickStartSingle}
            />
          }
        />
          <DocumentDropzoneModal
            isOpen={isUploadOpen}
            onClose={handleCloseUpload}
            onImportCompleted={handleImportCompleted}
          />
          <CustomsCommandPalette
            isOpen={isPaletteOpen}
            onClose={handleClosePalette}
            actions={paletteActions}
          />
          <KeyboardShortcutsModal
            isOpen={isShortcutsOpen}
            onClose={handleCloseShortcuts}
            onToggle={handleToggleShortcuts}
          />
          {dossierPayload && (
            <CustomsDossierDocument
              isOpen={isDossierOpen}
              onClose={handleCloseDossier}
              payload={dossierPayload}
            />
          )}
          <Toaster />
      </ToastProvider>
    </TariffReferenceProvider>
  );
}

export default function Page() {
  return (
    <TariffRuntimeProvider>
      <WorkstationContent />
    </TariffRuntimeProvider>
  );
}