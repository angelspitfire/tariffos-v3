'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, FolderOpen, Globe, LayoutGrid, Moon, PanelLeft, Plus, Sun } from 'lucide-react';
import type { JurisdictionConfig } from '@tariffos/shared-types';
import { JURISDICTIONS } from '@/lib/workspace/jurisdictions';
import { useCloudUsageSnapshot } from '@/lib/workspace/use-cloud-usage';
import { WorkspaceAccountStatusBanner } from '../molecules/WorkspaceAccountStatusBanner';

export interface WorkspaceHeader48Props {
  jurisdiction: JurisdictionConfig;
  isDark: boolean;
  canvasAvailable: boolean;
  canvasVisible: boolean;
  filesCount?: number;
  onOpenMobileSidebar: () => void;
  onChangeJurisdiction: (jurisdictionId: string) => void;
  onToggleTheme: () => void;
  onToggleCanvas: () => void;
  onOpenFilesPanel?: () => void;
  onNewThread?: () => void;
}

const ICON_BTN =
  'relative inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink-primary focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none';

/** 52px chat-column header matching mockup toolbar: jurisdiction pill popover, theme, files, and canvas toggle. */
export function WorkspaceHeader48({
  jurisdiction,
  isDark,
  canvasAvailable,
  canvasVisible,
  filesCount = 0,
  onOpenMobileSidebar,
  onChangeJurisdiction,
  onToggleTheme,
  onToggleCanvas,
  onOpenFilesPanel,
  onNewThread,
}: WorkspaceHeader48Props) {
  const cloudUsage = useCloudUsageSnapshot();
  const [jurOpen, setJurOpen] = useState(false);
  const jurRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!jurOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setJurOpen(false);
    };
    const onDown = (e: MouseEvent) => {
      if (jurRef.current && !jurRef.current.contains(e.target as Node)) setJurOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onDown);
    };
  }, [jurOpen]);

  return (
    <>
      <header className="no-print relative z-20 flex h-[52px] shrink-0 items-center justify-between gap-3 border-b border-border-subtle bg-surface-panel px-4">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            aria-label="Alternar historial de chats"
            className={`${ICON_BTN} lg:hidden`}
          >
            <PanelLeft className="h-4 w-4" aria-hidden="true" />
          </button>

          <div ref={jurRef} className="relative min-w-0">
            <button
              type="button"
              onClick={() => setJurOpen((p) => !p)}
              aria-expanded={jurOpen}
              aria-haspopup="listbox"
              aria-label={`Jurisdicción aduanera: ${jurisdiction.country} (${jurisdiction.authority})`}
              className="inline-flex min-w-0 cursor-pointer items-center gap-1.5 rounded-full border border-border-subtle bg-surface-panel px-3 py-1.5 text-xs text-ink-secondary transition-colors hover:border-accent-brand hover:text-ink-primary focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
            >
              <Globe className="h-3.5 w-3.5 shrink-0 text-accent-ink" aria-hidden="true" />
              <span className="truncate font-semibold text-ink-primary">{jurisdiction.country}</span>
              <span className="hidden truncate text-ink-muted md:inline">{jurisdiction.authority}</span>
              <ChevronDown className="h-3 w-3 shrink-0 opacity-60" aria-hidden="true" />
            </button>

            {jurOpen ? (
              <div
                role="listbox"
                aria-label="Seleccionar jurisdicción aduanera"
                className="absolute top-full left-0 z-40 mt-1.5 w-72 rounded-card border border-border-subtle bg-surface-panel p-1.5 shadow-elev-2"
              >
                {JURISDICTIONS.map((item) => {
                  const active = item.id === jurisdiction.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => {
                        onChangeJurisdiction(item.id);
                        setJurOpen(false);
                      }}
                      className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none ${
                        active
                          ? 'bg-accent-soft font-semibold text-accent-ink'
                          : 'text-ink-secondary hover:bg-surface-hover hover:text-ink-primary'
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-ink-primary">{item.country}</span>
                        <span className="block truncate text-[11px] text-ink-muted">{item.authority}</span>
                      </span>
                      {active ? <Check className="h-3.5 w-3.5 shrink-0 text-accent-ink" aria-hidden="true" /> : null}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            className={ICON_BTN}
          >
            {isDark ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
          </button>

          {onOpenFilesPanel ? (
            <button
              type="button"
              onClick={onOpenFilesPanel}
              aria-label={`Archivos del chat (${filesCount})`}
              className={ICON_BTN}
            >
              <FolderOpen className="h-4 w-4" aria-hidden="true" />
              {filesCount > 0 ? (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-brand px-1 font-mono text-[9px] font-semibold text-white tabular-nums">
                  {filesCount}
                </span>
              ) : null}
            </button>
          ) : null}

          {canvasAvailable ? (
            <button
              type="button"
              onClick={onToggleCanvas}
              aria-label={canvasVisible ? 'Ocultar panel Canvas' : 'Mostrar panel Canvas'}
              aria-pressed={canvasVisible}
              className={`${ICON_BTN} border ${
                canvasVisible
                  ? 'border-accent-border bg-accent-soft text-accent-ink'
                  : 'border-border-subtle bg-surface-panel text-ink-secondary'
              }`}
            >
              <LayoutGrid className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}

          {onNewThread ? (
            <button
              type="button"
              onClick={onNewThread}
              className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-full bg-surface-inverted px-3 text-xs font-semibold text-ink-on-inverted transition-colors hover:bg-surface-inverted-hover focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none lg:hidden"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Nuevo
            </button>
          ) : null}
        </div>
      </header>
      <WorkspaceAccountStatusBanner usage={cloudUsage} />
    </>
  );
}
