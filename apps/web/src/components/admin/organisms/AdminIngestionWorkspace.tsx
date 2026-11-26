'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { BookOpen, Clock } from 'lucide-react';
import type {
  CountryConfigInput,
  CountryIngestionSummary,
  LegalDocumentStatus,
  LegalDraftDiff,
  LegalDraftSummary,
} from '@tariffos/shared-types';
import { FunnelCard } from '@/components/funnel/atoms/FunnelCard';
import {
  createHttpIngestionAdminPort,
  type IIngestionAdminPort,
  type UploadDocumentClientInput,
} from '@/lib/admin/ingestion-port';
import { AdminKpiTile } from '../atoms/AdminKpiTile';
import { CountrySelectorBar } from '../molecules/CountrySelectorBar';
import { DraftDiffPreviewModal } from '../molecules/DraftDiffPreviewModal';
import { LegalDocumentRowCard } from '../molecules/LegalDocumentRowCard';
import { LegalDocumentUploadCard } from '../molecules/LegalDocumentUploadCard';

export interface AdminIngestionWorkspaceProps {
  ingestionPort?: IIngestionAdminPort;
}

export function AdminIngestionWorkspace({ ingestionPort }: AdminIngestionWorkspaceProps) {
  const port = useMemo(() => ingestionPort ?? createHttpIngestionAdminPort(), [ingestionPort]);
  const [countries, setCountries] = useState<CountryIngestionSummary[]>([]);
  const [countryCode, setCountryCode] = useState('VE');
  const [documents, setDocuments] = useState<LegalDraftSummary[]>([]);
  const [statusTab, setStatusTab] = useState<LegalDocumentStatus>('DRAFT');
  const [diffModal, setDiffModal] = useState<LegalDraftDiff | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const loadAll = useCallback(async (targetCountry: string) => {
    const [countryList, docList] = await Promise.all([port.listCountries(), port.listDocuments(targetCountry)]);
    setCountries(countryList);
    setDocuments(docList);
  }, [port]);

  useEffect(() => {
    void loadAll(countryCode);
  }, [countryCode, loadAll]);

  const activeCountry = countries.find((c) => c.code === countryCode);
  const counts = useMemo(() => ({
    draft: documents.filter((d) => d.status === 'DRAFT').length,
    published: documents.filter((d) => d.status === 'PUBLISHED').length,
    derogated: documents.filter((d) => d.status === 'DEROGATED').length,
  }), [documents]);
  const filteredDocs = useMemo(() => documents.filter((d) => d.status === statusTab), [documents, statusTab]);

  const handleCreateCountry = async (input: CountryConfigInput) => {
    await port.createCountry(input);
    setCountryCode(input.code);
    await loadAll(input.code);
  };

  const handleUpload = async (input: UploadDocumentClientInput) => {
    const res = await port.uploadDocument(input);
    setNotice(res.queued ? 'Archivo grande encolado en Inngest para extracción y staging en DRAFT.' : 'Borrador cargado correctamente.');
    setStatusTab('DRAFT');
    await loadAll(countryCode);
  };

  const handleInspectDiff = async (docId: string) => {
    setBusyId(docId);
    try {
      setDiffModal(await port.getDraftDiff(docId));
    } finally {
      setBusyId(null);
    }
  };

  const handleConfirmPublish = async (draftId: string) => {
    setPublishing(true);
    try {
      await port.publishDraft(draftId);
      setDiffModal(null);
      setStatusTab('PUBLISHED');
      setNotice('Documento publicado e indexación encolada.');
      await loadAll(countryCode);
    } finally {
      setPublishing(false);
    }
  };

  const handleDiscard = async (docId: string) => {
    setBusyId(docId);
    try {
      await port.discardDraft(docId);
      await loadAll(countryCode);
    } finally {
      setBusyId(null);
    }
  };

  const tabs: ReadonlyArray<{ id: LegalDocumentStatus; label: string }> = [
    { id: 'DRAFT', label: `Borradores (${counts.draft})` },
    { id: 'PUBLISHED', label: `Publicados (${counts.published})` },
    { id: 'DEROGATED', label: `Derogados (${counts.derogated})` },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-surface-inverted text-ink-on-inverted flex items-center justify-center">
          <BookOpen className="w-4 h-4" />
        </div>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-ink-primary">Normativa Legal y Aranceles Multi-País</h1>
          <p className="text-xs text-ink-muted">Carga en borrador, revisión de impacto (Diff) y derogación atómica por jurisdicción.</p>
        </div>
      </div>

      <CountrySelectorBar countries={countries} selectedCode={countryCode} onSelect={setCountryCode} onCreateCountry={handleCreateCountry} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <AdminKpiTile label="Borradores" value={counts.draft} tone="amber" />
        <AdminKpiTile label="Publicados" value={counts.published} tone="emerald" />
        <AdminKpiTile label="Partidas activas" value={activeCountry?.activeTariffs ?? 0} tone="brand" />
        <AdminKpiTile label="Vectores arancel" value={activeCountry?.embeddedTariffs ?? 0} />
      </div>

      <LegalDocumentUploadCard countryCode={countryCode} onUpload={handleUpload} />

      {notice && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300">
          {notice}
        </div>
      )}

      <div role="tablist" aria-label="Estados documentales" className="inline-flex gap-1 p-1 bg-surface-subtle rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={statusTab === tab.id}
            onClick={() => setStatusTab(tab.id)}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              statusTab === tab.id ? 'bg-surface-panel text-ink-primary shadow-xs' : 'text-ink-muted hover:text-ink-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredDocs.length === 0 ? (
        <FunnelCard padding="p-8" className="text-center space-y-1.5">
          <Clock className="w-6 h-6 text-ink-subtle mx-auto" />
          <div className="text-sm font-semibold text-ink-primary">Sin documentos en esta vista</div>
        </FunnelCard>
      ) : (
        <div className="space-y-2.5">
          {filteredDocs.map((doc) => (
            <LegalDocumentRowCard key={doc.id} doc={doc} busy={busyId === doc.id} onInspectDiff={handleInspectDiff} onDiscard={handleDiscard} />
          ))}
        </div>
      )}

      {diffModal && (
        <DraftDiffPreviewModal diff={diffModal} publishing={publishing} onClose={() => setDiffModal(null)} onConfirmPublish={handleConfirmPublish} />
      )}
    </div>
  );
}
