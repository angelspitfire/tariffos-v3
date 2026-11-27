'use client';

import { Camera, FilePlus2, FileSpreadsheet, Globe, PanelRightOpen, Search } from 'lucide-react';
import type { UserProfileSettings } from '@tariffos/shared-types';

export type ComposerMenuKind = 'attach' | 'tools' | null;

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
  if (menu === 'attach') {
    return (
      <div
        role="menu"
        aria-label="Adjuntar o capturar"
        className="absolute left-0 bottom-full mb-2 w-[min(18rem,calc(100%-0.5rem))] bg-surface-panel border border-border-subtle rounded-xl shadow-xl p-1.5 z-30"
      >
        <button
          type="button"
          role="menuitem"
          onClick={() => {
            onClose();
            onTriggerUpload();
          }}
          className="w-full flex items-start gap-2.5 p-2.5 text-left rounded-lg hover:bg-surface-hover transition-colors cursor-pointer"
        >
          <FilePlus2 className="w-4 h-4 text-accent-ink shrink-0 mt-0.5" />
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
            className="w-full flex items-start gap-2.5 p-2.5 text-left rounded-lg hover:bg-surface-hover transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-accent-ink shrink-0 mt-0.5" />
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
          className="w-full flex items-start gap-2.5 p-2.5 text-left rounded-lg hover:bg-surface-hover transition-colors cursor-pointer"
        >
          <Camera className="w-4 h-4 text-ink-secondary shrink-0 mt-0.5" />
          <div className="min-w-0">
            <div className="text-xs font-semibold text-ink-primary">Cámara integrada</div>
            <div className="text-[11px] text-ink-muted">Capturar etiqueta o factura física</div>
          </div>
        </button>

        <div className="mt-1 pt-1.5 px-2.5 pb-1 border-t border-border-hairline text-[10px] text-ink-subtle">
          También puedes arrastrar archivos o pegar (<span className="font-mono">Ctrl+V</span>) directo en el chat.
        </div>
      </div>
    );
  }

  if (menu !== 'tools') return null;

  const predictiveOn = profile.predictiveSearchEnabled !== false;
  const webOn = profile.webEnrichmentEnabled !== false;
  const toggles = [
    {
      key: 'predictive',
      icon: Search,
      title: 'Búsqueda predictiva',
      sub: 'Sugerencias NANDINA al escribir',
      active: predictiveOn,
      statusLabel: predictiveOn ? 'Activa' : 'Inactiva',
      onClick: () => onUpdateProfile({ predictiveSearchEnabled: !predictiveOn }),
    },
    {
      key: 'web',
      icon: Globe,
      title: 'Ficha técnica web',
      sub: 'Verifica specs reales por marca/modelo',
      active: webOn,
      statusLabel: webOn ? 'Activa' : 'Inactiva',
      onClick: () => onUpdateProfile({ webEnrichmentEnabled: !webOn }),
    },
    {
      key: 'canvas',
      icon: PanelRightOpen,
      title: 'Abrir Canvas automático',
      sub: 'Al generar árboles, lotes o dictámenes',
      active: profile.autoOpenCanvas,
      statusLabel: profile.autoOpenCanvas ? 'Sí' : 'No',
      onClick: () => onUpdateProfile({ autoOpenCanvas: !profile.autoOpenCanvas }),
    },
  ] as const;

  return (
    <div
      role="menu"
      aria-label="Opciones del chat"
      className="absolute left-0 bottom-full mb-2 w-[min(19.5rem,calc(100%-0.25rem))] max-h-[65vh] overflow-y-auto bg-surface-panel border border-border-subtle rounded-xl shadow-xl p-3 z-30 space-y-3"
    >
      <div className="text-xs font-semibold text-ink-primary">Opciones de análisis en chat</div>

      {toggles.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.key}
            type="button"
            onClick={item.onClick}
            className="w-full flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-surface-hover transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Icon className="w-3.5 h-3.5 text-accent-ink shrink-0" />
              <div>
                <div className="text-xs font-medium text-ink-primary">{item.title}</div>
                <div className="text-[10px] text-ink-muted">{item.sub}</div>
              </div>
            </div>
            <span className={`text-[11px] font-semibold shrink-0 ${item.active ? 'text-accent-ink' : 'text-ink-subtle'}`}>
              {item.statusLabel}
            </span>
          </button>
        );
      })}

      <div className="pt-2 border-t border-border-hairline space-y-1.5">
        <div className="text-[11px] font-medium text-ink-secondary">Profundidad de dictamen</div>
        <div className="grid grid-cols-3 gap-1 p-1 bg-surface-subtle rounded-lg">
          {(['concise', 'standard', 'exhaustive'] as const).map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => onUpdateProfile({ detailLevel: lvl })}
              className={`py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${
                profile.detailLevel === lvl
                  ? 'bg-surface-panel text-ink-primary shadow-xs'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              {lvl === 'concise' ? 'Conciso' : lvl === 'standard' ? 'Estándar' : 'Exhaustivo'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="text-[11px] font-medium text-ink-secondary">Incoterm base</div>
        <div className="grid grid-cols-4 gap-1 p-1 bg-surface-subtle rounded-lg">
          {(['FOB', 'CIF', 'EXW', 'DDP'] as const).map((inc) => (
            <button
              key={inc}
              type="button"
              onClick={() => onUpdateProfile({ defaultIncoterm: inc })}
              className={`py-1 text-[11px] font-mono font-medium rounded-md transition-colors cursor-pointer ${
                profile.defaultIncoterm === inc
                  ? 'bg-surface-panel text-ink-primary shadow-xs'
                  : 'text-ink-secondary hover:text-ink-primary'
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
