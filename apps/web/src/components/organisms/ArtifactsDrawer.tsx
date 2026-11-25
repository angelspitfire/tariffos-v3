'use client';

import { useState } from 'react';
import { type A2UIArtifact } from '@/types/domain';
import type { AuditLogEntry } from '@/lib/audit-log';
import type { ConversationFile } from '@/types/files';
import { CustomsAuditLog } from './CustomsAuditLog';
import { CustomsFilesList } from './CustomsFilesList';
import {
  Layers, FileSearch, Landmark, AlertTriangle, Scale, ShieldCheck,
  Coins, FileText, FolderArchive, History, Files, Search, X, ExternalLink,
} from 'lucide-react';

export interface ArtifactsDrawerProps {
  isOpen: boolean;
  artifacts: A2UIArtifact[];
  activeArtifactId: string | null;
  files?: ConversationFile[];
  auditEntries?: AuditLogEntry[];
  onClose: () => void;
  onSelectArtifact: (id: string) => void;
  onAnalyzeFile?: (fileName: string) => void;
  onOpenUpload?: () => void;
}

function getDrawerIcon(type: A2UIArtifact['type']) {
  switch (type) {
    case 'single-item': return FileSearch;
    case 'batch-manifest': return Layers;
    case 'tax-breakdown': return Landmark;
    case 'discrepancy-audit': return AlertTriangle;
    case 'disambiguation': return Scale;
    case 'permits-matrix': return ShieldCheck;
    case 'exoneration-simulator': return Coins;
    case 'customs-dossier': return FileText;
  }
}

export function ArtifactsDrawer({
  isOpen, artifacts, activeArtifactId, files = [], auditEntries = [],
  onClose, onSelectArtifact, onAnalyzeFile, onOpenUpload,
}: ArtifactsDrawerProps) {
  const [activeTab, setActiveTab] = useState<'artifacts' | 'files' | 'audit'>('artifacts');
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const filtered = artifacts.filter(
    (a) =>
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      a.badge.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <aside
      role="complementary"
      aria-label="Gaveta de Documentos Aduaneros"
      className="w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
      style={{ background: 'var(--surface)', borderLeft: '1px solid var(--border)' }}
    >
      {/* Header with 3 Tabs */}
      <div className="h-12 shrink-0 flex items-center justify-between px-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-1 p-0.5 bg-zinc-900 rounded-lg border border-zinc-800">
          <button
            onClick={() => setActiveTab('artifacts')}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
              activeTab === 'artifacts' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FolderArchive size={12} className="text-indigo-400" />
            <span>Expediente</span>
            <span className="tabular text-[10px] font-mono px-1 rounded bg-[var(--purple-subtle)] text-[var(--purple-text)]">{artifacts.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
              activeTab === 'files' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Files size={12} className="text-blue-400" />
            <span>Archivos</span>
            <span className="tabular text-[10px] font-mono px-1 rounded bg-zinc-800 text-zinc-400">{files.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
              activeTab === 'audit' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <History size={12} className="text-amber-400" />
            <span>Bitácora</span>
            <span className="tabular text-[10px] font-mono px-1 rounded bg-zinc-800 text-zinc-400">{auditEntries.length}</span>
          </button>
        </div>
        <button onClick={onClose} aria-label="Cerrar gaveta" className="w-7 h-7 rounded flex items-center justify-center text-zinc-400 hover:text-zinc-200">
          <X size={14} />
        </button>
      </div>

      {activeTab === 'audit' ? (
        <div className="flex-1 overflow-y-auto p-3"><CustomsAuditLog entries={auditEntries} /></div>
      ) : activeTab === 'files' ? (
        <div className="flex-1 overflow-y-auto p-3">
          <CustomsFilesList
            files={files}
            onAnalyze={(name) => { onAnalyzeFile?.(name); onClose(); }}
            onUpload={() => { onOpenUpload?.(); onClose(); }}
          />
        </div>
      ) : (
        <>
          <div className="p-3 shrink-0 border-b border-[var(--border)]">
            <div className="relative flex items-center">
              <Search size={13} className="absolute left-3 text-zinc-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filtrar por partida, impuesto o reporte..."
                className="w-full text-xs rounded-lg pl-8 pr-3 py-1.5 bg-zinc-900 border border-zinc-700/60 text-zinc-100 placeholder-zinc-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filtered.map((art) => {
              const Icon = getDrawerIcon(art.type);
              const isActive = art.id === activeArtifactId;
              return (
                <div
                  key={art.id}
                  onClick={() => { onSelectArtifact(art.id); onClose(); }}
                  className="p-3 rounded-xl border cursor-pointer transition-all hover:border-indigo-500/40"
                  style={{
                    background: isActive ? 'var(--surface-active)' : 'var(--surface-raised)',
                    borderColor: isActive ? '#818cf8' : 'var(--border)',
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-indigo-500/20 text-indigo-300">
                        <Icon size={14} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold truncate text-zinc-100">{art.title}</h4>
                        <p className="text-[11px] truncate text-zinc-400 mt-0.5">{art.subtitle}</p>
                      </div>
                    </div>
                    <button className="text-[11px] flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium shrink-0" title="Abrir en lienzo">
                      <span>Abrir</span>
                      <ExternalLink size={11} />
                    </button>
                  </div>
                  <div className="mt-2 pt-2 flex items-center justify-between text-[10px] font-mono text-zinc-500 border-t border-zinc-800">
                    <span>v{art.version} · Expediente Oficial</span>
                    <span>{art.timestamp}</span>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="py-8 text-center text-xs text-zinc-400">No se encontraron documentos con ese criterio.</div>
            )}
          </div>
        </>
      )}
    </aside>
  );
}
