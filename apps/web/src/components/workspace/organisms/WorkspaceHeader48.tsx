'use client';

import { FolderOpen, Globe, LayoutGrid, Moon, PanelLeft, Sun } from 'lucide-react';
import type { JurisdictionConfig } from '@tariffos/shared-types';
import { BrandMark } from '@/components/funnel/atoms/BrandMark';
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
}

const ICON_BTN =
  'inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink-primary focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none';

/** 48px contextual header: jurisdiction, theme and canvas toggle. App-level nav lives in the sidebar. */
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
}: WorkspaceHeader48Props) {
  const cloudUsage = useCloudUsageSnapshot();

  return (
    <>
      <header className="no-print flex h-12 shrink-0 items-center justify-between gap-2 border-b border-line-frost bg-surface-frost px-3 backdrop-blur-xl sm:px-4">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          aria-label="Alternar historial de clasificaciones"
          className={`${ICON_BTN} lg:hidden`}
        >
          <PanelLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <div className="lg:hidden">
          <BrandMark size="sm" showBadge={false} />
        </div>

        <label className="relative inline-flex min-w-0 items-center">
          <span className="sr-only">Jurisdicción aduanera</span>
          <Globe className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-accent-ink" aria-hidden="true" />
          <select
            value={jurisdiction.id}
            onChange={(e) => onChangeJurisdiction(e.target.value)}
            className="h-8 max-w-52 cursor-pointer appearance-none truncate rounded-full border border-border-subtle bg-surface-panel pr-4 pl-8 text-xs font-semibold text-ink-primary transition-colors hover:border-accent-brand focus:border-accent-brand focus:outline-none"
          >
            {JURISDICTIONS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.country} · {item.authority}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {onOpenFilesPanel ? (
          <button
            type="button"
            onClick={onOpenFilesPanel}
            aria-label={`Archivos del expediente (${filesCount})`}
            title="Archivos del expediente"
            className="relative inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink-primary"
          >
            <FolderOpen className="h-4 w-4" aria-hidden="true" />
            {filesCount > 0 ? (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-brand px-1 font-mono text-[9px] font-bold text-white">
                {filesCount}
              </span>
            ) : null}
          </button>
        ) : null}
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
          className={ICON_BTN}
        >
          {isDark ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
        </button>

        {canvasAvailable ? (
          <button
            type="button"
            onClick={onToggleCanvas}
            aria-label={canvasVisible ? 'Ocultar panel de dictamen' : 'Mostrar panel de dictamen'}
            aria-pressed={canvasVisible}
            className={`${ICON_BTN} border ${
              canvasVisible
                ? 'border-accent-border bg-accent-soft text-accent-ink'
                : 'border-border-subtle bg-surface-panel'
            }`}
          >
            <LayoutGrid className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </header>
    <WorkspaceAccountStatusBanner usage={cloudUsage} />
    </>
  );
}
