'use client';

import { Shield, User, Bot, Clock, ArrowRight } from 'lucide-react';
import {
  type AuditLogEntry,
  type AuditActor,
  formatAuditActor,
} from '@/lib/audit-log';

export interface CustomsAuditLogProps {
  entries: AuditLogEntry[];
}

function getActorIcon(actor: AuditActor) {
  switch (actor) {
    case 'broker':
      return User;
    case 'system':
      return Shield;
    case 'ai':
      return Bot;
  }
}

function getActorBadgeStyle(actor: AuditActor) {
  switch (actor) {
    case 'broker':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'system':
      return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    case 'ai':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
  }
}

export function CustomsAuditLog({ entries }: CustomsAuditLogProps) {
  if (entries.length === 0) {
    return (
      <div className="py-12 px-4 text-center">
        <Clock className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
        <p className="text-xs text-zinc-400 font-medium">No hay registros en la bitácora aún.</p>
        <p className="text-[11px] text-zinc-500 mt-1">
          Las modificaciones a partidas, cambios de expediente y transmisiones quedarán registradas aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-1">
      {entries.map((entry) => {
        const Icon = getActorIcon(entry.actor);
        const badgeStyle = getActorBadgeStyle(entry.actor);

        return (
          <div
            key={entry.id}
            className="p-3 rounded-xl border border-zinc-800/80 bg-zinc-900/60 transition-colors hover:border-zinc-700/80"
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${badgeStyle}`}
              >
                <Icon className="w-2.5 h-2.5" />
                {formatAuditActor(entry.actor)}
              </span>
              <span className="text-[10px] font-mono text-zinc-500">{entry.timestamp}</span>
            </div>

            <h4 className="text-xs font-semibold text-zinc-200">{entry.action}</h4>
            <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">{entry.details}</p>

            {entry.diff && (
              <div className="mt-2 pt-2 border-t border-zinc-800/60 flex items-center gap-1.5 text-[11px] font-mono text-zinc-300 bg-zinc-950/40 px-2 py-1 rounded-lg">
                <span className="text-red-400/90">{entry.diff.before}</span>
                <ArrowRight className="w-3 h-3 text-zinc-600 shrink-0" />
                <span className="text-emerald-400/90">{entry.diff.after}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
