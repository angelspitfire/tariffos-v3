'use client';

import { Users } from 'lucide-react';
import type { ProcessPresencePeer } from '@/lib/workspace/use-process-presence';

export interface ProcessPresenceBadgeProps {
  peers: readonly ProcessPresencePeer[];
}

export function ProcessPresenceBadge({ peers }: ProcessPresenceBadgeProps) {
  if (peers.length === 0) return null;
  const first = peers[0]!;
  const label =
    peers.length === 1
      ? `${first.fullName} está viendo este proceso`
      : `${first.fullName} y ${peers.length - 1} más están viendo este proceso`;

  return (
    <span
      role="status"
      aria-live="polite"
      className="hidden items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-700 md:inline-flex dark:text-emerald-300"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
      <Users className="h-3 w-3 shrink-0" aria-hidden="true" />
      <span className="max-w-48 truncate">{label}</span>
    </span>
  );
}
