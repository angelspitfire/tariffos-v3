'use client';

import {
  MessageSquare,
  BookOpen,
  PanelLeft,
  PanelLeftClose,
  Plus,
  Clock,
  CheckCircle2,
  Settings,
  Shield,
  FileText,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export interface WorkstationSidebarProps {
  expanded: boolean;
  onToggleExpand: () => void;
  onNewFiling?: () => void;
  activeFilingId?: string;
  onSelectFiling?: (id: string) => void;
  onSelectAssistant?: () => void;
  onSelectTariffReference?: () => void;
  onToggleDrawer?: () => void;
  hasActiveConversation?: boolean;
}

const RECENT_FILINGS = [
  { id: 'TR-2024-8849-VE', desc: 'Electrónica Shanghai', items: 3, status: 'active', time: 'Hoy' },
  { id: 'TR-2024-8712-CO', desc: 'Repuestos Automotrices', items: 14, status: 'cleared', time: 'Ayer' },
  { id: 'TR-2024-8501-US', desc: 'Insumos Médicos', items: 1, status: 'cleared', time: '12 Nov' },
] as const;

export function WorkstationSidebar({
  expanded,
  onToggleExpand,
  onNewFiling,
  activeFilingId = 'TR-2024-8849-VE',
  onSelectFiling,
  onSelectAssistant,
  onSelectTariffReference,
  onToggleDrawer,
  hasActiveConversation = false,
}: WorkstationSidebarProps) {
  const { t } = useI18n();
  return (
    <aside
      aria-label={t("Navegación principal")}
      className="shrink-0 flex flex-col transition-all duration-200 z-30 select-none"
      style={{
        width: expanded ? '260px' : '56px',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Brand header */}
      <div className="h-11 flex items-center justify-between px-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0"
            style={{ background: 'var(--brand)', boxShadow: '0 0 16px var(--brand-glow)' }}
          >
            T
          </div>
          <span className="font-semibold text-sm tracking-tight truncate">
            TariffOS <span className="text-[10px] text-[var(--purple-text)] font-mono ml-0.5" style={{ opacity: expanded ? 1 : 0, transition: 'opacity 150ms' }}>v2</span>
          </span>
        </div>
        {hasActiveConversation && (
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" title={t("Conversación activa")} />
        )}
        <button
          onClick={onToggleExpand}
          aria-label={expanded ? 'Colapsar barra lateral' : 'Desplegar barra lateral'}
          className="w-7 h-7 rounded flex items-center justify-center transition-colors hover:bg-zinc-800/50"
          style={{ color: 'var(--text-lo)' }}
        >
          {expanded ? <PanelLeftClose size={15} /> : <PanelLeft size={15} />}
        </button>
      </div>

      {/* New chat / filing button */}
      <div className="p-2 shrink-0">
        <button
          onClick={onNewFiling}
          aria-label={t("Nueva Consulta")}
          title={t("Nuevo Trámite")}
          className="w-full flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold text-white transition-all shadow-sm hover:opacity-95"
          style={{ background: 'var(--brand)' }}
        >
          <Plus size={15} />
          {expanded && <span>{t("Nueva Consulta")}</span>}
        </button>
      </div>

      {/* Navigation & Recent Filings */}
      <nav className="px-2 space-y-1 flex-1 overflow-y-auto">
        {/* Active conversation link */}
        <button
          onClick={onSelectAssistant}
          aria-label={t("Asistente Aduanero")}
          title={t("Asistente Arancelario")}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          style={{
            color: 'var(--purple-text)',
            background: 'var(--purple-subtle)',
          }}
        >
          <MessageSquare size={16} className="shrink-0" />
          {expanded && <span className="truncate">{t("Asistente Aduanero")}</span>}
        </button>

        {/* Customs Tariff Reference link */}
        <button
          onClick={onSelectTariffReference}
          aria-label={t("Arancel Oficial SENIAT")}
          title={t("Arancel Nacional SENIAT")}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors hover:bg-zinc-800/40 cursor-pointer"
          style={{ color: 'var(--text-mid)' }}
        >
          <BookOpen size={16} className="shrink-0" />
          {expanded && <span className="truncate">{t("Arancel Oficial SENIAT")}</span>}
        </button>

        {/* Expediente drawer toggle */}
        {onToggleDrawer && (
          <button
            onClick={() => onToggleDrawer()}
            aria-label="Ver Expediente"
            title={t("Ver Expediente")}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors hover:bg-zinc-800/40 cursor-pointer"
            style={{ color: 'var(--text-mid)' }}
          >
            <FileText size={16} className="shrink-0" />
            {expanded && <span className="truncate">{t("Ver Expediente")}</span>}
          </button>
        )}

        {/* Recent filings / history */}
        {expanded && (
          <div className="pt-4 mt-2" style={{ borderTop: '1px solid var(--border)' }}>
            <span className="text-[10px] uppercase font-semibold px-2 tracking-wider" style={{ color: 'var(--text-lo)' }}>
              {t("Trámites Recientes")}
            </span>
            <div className="mt-1 space-y-0.5">
              {RECENT_FILINGS.map((filing) => {
                const isActive = filing.id === activeFilingId;
                return (
                  <div
                    key={filing.id}
                    onClick={() => onSelectFiling?.(filing.id)}
                    className="flex items-center justify-between px-2 py-2 rounded-lg text-xs transition-colors cursor-pointer group"
                    style={{
                      background: isActive ? 'var(--surface-active)' : 'transparent',
                      color: isActive ? 'var(--text-hi)' : 'var(--text-mid)',
                    }}
                  >
                    <div className="flex flex-col min-w-0 pr-1">
                      <span className="font-mono text-[11px] font-medium truncate">{filing.id}</span>
                      <span className="text-[10px] truncate" style={{ color: 'var(--text-lo)' }}>
                        {filing.desc}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[9px] text-[var(--text-muted)] font-mono">{filing.time}</span>
                      {filing.status === 'active' ? (
                        <Clock size={11} className="text-amber-400" />
                      ) : (
                        <CheckCircle2 size={11} className="text-emerald-400" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Bottom Profile / Settings */}
      <div className="p-2 shrink-0 border-t border-zinc-800/60">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs" style={{ color: 'var(--text-lo)' }}>
          <Shield size={14} className="text-[var(--purple-text)] shrink-0" />
          {expanded && (
            <div className="flex flex-col min-w-0">
              <span className="font-medium text-[11px] text-zinc-300 truncate">{t("Agente Aduanero")}</span>
              <span className="text-[9px] text-[var(--text-muted)]">SENIAT Lic. #0492</span>
            </div>
          )}
          {expanded && (
            <button
              aria-label={t("Ajustes")}
              className="ml-auto text-[var(--text-muted)] hover:text-zinc-300 cursor-pointer p-1 rounded hover:bg-zinc-800/30"
              onClick={() => {}}
            >
              <Settings size={13} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
