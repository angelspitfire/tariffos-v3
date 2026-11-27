'use client';

import { useEffect, useState } from 'react';
import { Camera, FilePlus2, FileSpreadsheet, Globe, PanelRightOpen, Search } from 'lucide-react';
import type { UserProfileSettings } from '@tariffos/shared-types';

export type ComposerMenuKind = 'attach' | 'tools' | null;

const FOCUS_RING =
  'focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none';

export interface ComposerMenusProps {
  menu: ComposerMenuKind;
  profile: UserProfileSettings;
  onClose: () => void;
  onTriggerUpload: () => void;
  onTriggerBatchUpload?: () => void;
  onUpdateProfile: (patch: Partial<UserProfileSettings>) => void;
  onOpenCamera: () => void;
}

export function ComposerMenus({
  menu,
  profile,
  onClose,
  onTriggerUpload,
  onTriggerBatchUpload,
  onUpdateProfile,
  onOpenCamera,
}: ComposerMenusProps) {
  const [pasteShortcut, setPasteShortcut] = useState('Ctrl\u00A0V');

  useEffect(() => {
    const isApple = /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent);
    setPasteShortcut(isApple ? '⌘\u00A0V' : 'Ctrl\u00A0V');
  }, []);

  if (menu === 'attach') {
    return (
      <div
        role="menu"
        aria-label="Adjuntar o capturar"
        className="absolute bottom-full left-0 z-30 mb-2 w-[min(18rem,calc(100%-0.5rem))] rounded-xl border border-border-subtle bg-surface-panel p-1.5 shadow-xl"
      >
        <button
          type="button"
          role="menuitem"
          onClick={() => {
            onClose();
            onTriggerUpload();
          }}
          className={`flex w-full cursor-pointer items-start gap-2.5 rounded-lg p-2.5 text-left transition-colors hover:bg-surface-hover ${FOCUS_RING}`}
        >
          <FilePlus2 className="mt-0.5 h-4 w-4 shrink-0 text-accent-ink" aria-hidden="true" />
          <div className="min-w-0">
            <div className="text-xs font-semibold text-ink-primary">Subir archivos o fotos</div>
            <div className="text-[11px] text-ink-muted">Adjuntar ficha técnica al chat actual</div>
          </div>
        </button>

        {onTriggerBatchUpload ? (
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onClose();
              onTriggerBatchUpload();
            }}
            className={`flex w-full cursor-pointer items-start gap-2.5 rounded-lg p-2.5 text-left transition-colors hover:bg-surface-hover ${FOCUS_RING}`}
          >
            <FileSpreadsheet className="mt-0.5 h-4 w-4 shrink-0 text-accent-ink" aria-hidden="true" />
            <div className="min-w-0">
              <div className="text-xs font-semibold text-ink-primary">Procesar lote masivo</div>
              <div className="text-[11px] text-ink-muted">Factura Excel, CSV, PDF o foto (VL)</div>
            </div>
          </button>
        ) : null}

        <button
          type="button"
          role="menuitem"
          onClick={() => {
            onClose();
            onOpenCamera();
          }}
          className={`flex w-full cursor-pointer items-start gap-2.5 rounded-lg p-2.5 text-left transition-colors hover:bg-surface-hover ${FOCUS_RING}`}
        >
          <Camera className="mt-0.5 h-4 w-4 shrink-0 text-ink-secondary" aria-hidden="true" />
          <div className="min-w-0">
            <div className="text-xs font-semibold text-ink-primary">Cámara integrada</div>
            <div className="text-[11px] text-ink-muted">Capturar etiqueta o factura física</div>
          </div>
        </button>

        <div className="mt-1 border-t border-border-hairline px-2.5 pt-1.5 pb-1 text-[10px] text-ink-subtle">
          También puedes arrastrar archivos o pegar (<span className="font-mono">{pasteShortcut}</span>) directo en el chat.
        </div>
      </div>
    );
  }

  if (menu !== 'tools') return null;

  const predictiveOn = profile.predictiveSearchEnabled !== false;
  const webOn = profile.webEnrichmentEnabled !== false;
  const toggles = [
    { key: 'predictive', icon: Search, title: 'Búsqueda predictiva', sub: 'Sugerencias NANDINA al escribir', active: predictiveOn, statusLabel: predictiveOn ? 'Activa' : 'Inactiva', onClick: () => onUpdateProfile({ predictiveSearchEnabled: !predictiveOn }) },
    { key: 'web', icon: Globe, title: 'Ficha técnica web', sub: 'Verifica specs reales por marca/modelo', active: webOn, statusLabel: webOn ? 'Activa' : 'Inactiva', onClick: () => onUpdateProfile({ webEnrichmentEnabled: !webOn }) },
    { key: 'canvas', icon: PanelRightOpen, title: 'Abrir Canvas automático', sub: 'Al generar árboles, lotes o dictámenes', active: profile.autoOpenCanvas, statusLabel: profile.autoOpenCanvas ? 'Sí' : 'No', onClick: () => onUpdateProfile({ autoOpenCanvas: !profile.autoOpenCanvas }) },
  ] as const;

  return (
    <div
      role="menu"
      aria-label="Opciones del chat"
      className="absolute bottom-full left-0 z-30 mb-2 max-h-[65vh] w-[min(19.5rem,calc(100%-0.25rem))] space-y-3 overflow-y-auto rounded-xl border border-border-subtle bg-surface-panel p-3 shadow-xl"
    >
      <div className="text-xs font-semibold text-ink-primary">Opciones de análisis en chat</div>

      {toggles.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.key}
            type="button"
            role="menuitemcheckbox"
            aria-checked={item.active}
            onClick={item.onClick}
            className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg p-2 text-left transition-colors hover:bg-surface-hover ${FOCUS_RING}`}
          >
            <div className="flex min-w-0 items-center gap-2">
              <Icon className="h-3.5 w-3.5 shrink-0 text-accent-ink" aria-hidden="true" />
              <div>
                <div className="text-xs font-medium text-ink-primary">{item.title}</div>
                <div className="text-[10px] text-ink-muted">{item.sub}</div>
              </div>
            </div>
            <span className={`shrink-0 text-[11px] font-semibold ${item.active ? 'text-accent-ink' : 'text-ink-subtle'}`}>
              {item.statusLabel}
            </span>
          </button>
        );
      })}

      <div className="space-y-1.5 border-t border-border-hairline pt-2">
        <div className="text-[11px] font-medium text-ink-secondary">Profundidad de dictamen</div>
        <div role="group" aria-label="Profundidad de dictamen" className="grid grid-cols-3 gap-1 rounded-lg bg-surface-subtle p-1">
          {(['concise', 'standard', 'exhaustive'] as const).map((lvl) => (
            <button
              key={lvl}
              type="button"
              role="menuitemradio"
              aria-checked={profile.detailLevel === lvl}
              onClick={() => onUpdateProfile({ detailLevel: lvl })}
              className={`cursor-pointer rounded-md py-1 text-[11px] font-medium transition-colors ${FOCUS_RING} ${
                profile.detailLevel === lvl ? 'bg-surface-panel text-ink-primary shadow-xs' : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              {lvl === 'concise' ? 'Conciso' : lvl === 'standard' ? 'Estándar' : 'Exhaustivo'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="text-[11px] font-medium text-ink-secondary">Incoterm base</div>
        <div role="group" aria-label="Incoterm base" className="grid grid-cols-4 gap-1 rounded-lg bg-surface-subtle p-1">
          {(['FOB', 'CIF', 'EXW', 'DDP'] as const).map((inc) => (
            <button
              key={inc}
              type="button"
              role="menuitemradio"
              aria-checked={profile.defaultIncoterm === inc}
              onClick={() => onUpdateProfile({ defaultIncoterm: inc })}
              className={`cursor-pointer rounded-md py-1 font-mono text-[11px] font-medium transition-colors ${FOCUS_RING} ${
                profile.defaultIncoterm === inc ? 'bg-surface-panel text-ink-primary shadow-xs' : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              {inc}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
