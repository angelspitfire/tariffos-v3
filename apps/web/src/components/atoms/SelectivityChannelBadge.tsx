'use client';

import { useState } from 'react';
import type { CustomsChannel } from '@/lib/customs-channel';
import { ShieldAlert, ShieldCheck, AlertTriangle, Info } from 'lucide-react';

export interface SelectivityChannelBadgeProps {
  channel: CustomsChannel;
  reasons: string[];
}

export function SelectivityChannelBadge({ channel, reasons }: SelectivityChannelBadgeProps) {
  const [showPopover, setShowPopover] = useState(false);

  const config = {
    green: {
      label: 'Canal Verde',
      title: 'Levante Automático',
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20',
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
    },
    yellow: {
      label: 'Canal Amarillo',
      title: 'Revisión Documental',
      badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20',
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
    },
    red: {
      label: 'Canal Rojo',
      title: 'Aforo Físico y Documental',
      badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20',
      icon: <ShieldAlert className="w-3.5 h-3.5" />,
    },
  }[channel];

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setShowPopover(!showPopover)}
        aria-label={`${config.label} - ${config.title}`}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${config.badgeClass}`}
      >
        {config.icon}
        <span>{config.label}</span>
      </button>

      {showPopover && (
        <div className="absolute right-0 top-full mt-2 w-72 p-3 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-50 text-xs text-zinc-200">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
            <span className="font-bold text-white flex items-center gap-1.5">
              {config.icon}
              {config.label}
            </span>
            <span className="text-[10px] text-zinc-400 font-medium">{config.title}</span>
          </div>

          {reasons.length > 0 ? (
            <div className="space-y-1.5">
              <p className="text-[10px] uppercase font-semibold text-zinc-400">Factores de Selectividad:</p>
              <ul className="space-y-1">
                {reasons.map((r) => (
                  <li key={r} className="flex items-start gap-1.5 text-zinc-300 text-[11px] leading-tight">
                    <span className="text-rose-400 mt-0.5">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-zinc-400 text-[11px] flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              Cero discrepancias documentales y visto bueno regulatorio completo.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
