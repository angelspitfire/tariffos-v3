'use client';

import { useEffect, useState } from 'react';
import type { AgencyMemberSummary } from '@tariffos/shared-types';
import { isCloudModeEnabled } from '@/lib/runtime-config';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { getInitials } from './thread-meta';

export interface ProcessPresencePeer {
  userId: string;
  fullName: string;
  initials: string;
}

export interface UseProcessPresenceParams {
  threadId: string | null;
  currentUser: AgencyMemberSummary | null;
}

/**
 * Joins a lightweight Supabase Realtime Presence channel (`process:<id>`)
 * to show non-blocking awareness badges when another agency member views the same process.
 */
export function useProcessPresence({
  threadId,
  currentUser,
}: UseProcessPresenceParams): ProcessPresencePeer[] {
  const [peers, setPeers] = useState<ProcessPresencePeer[]>([]);
  const cloud = isCloudModeEnabled();

  useEffect(() => {
    if (!cloud || !threadId || !currentUser?.userId) {
      setPeers([]);
      return;
    }

    let channel: ReturnType<ReturnType<typeof createSupabaseBrowserClient>['channel']> | null = null;
    try {
      const supabase = createSupabaseBrowserClient();
      const ch = supabase.channel(`process:${threadId}`, {
        config: { presence: { key: currentUser.userId } },
      });
      channel = ch;

      ch.on('presence', { event: 'sync' }, () => {
        const state = ch.presenceState<ProcessPresencePeer>();
        const list: ProcessPresencePeer[] = [];
        for (const [key, entries] of Object.entries(state)) {
          if (key === currentUser.userId || !Array.isArray(entries) || entries.length === 0) continue;
          const first = entries[0];
          if (first?.fullName) {
            list.push({
              userId: key,
              fullName: first.fullName,
              initials: first.initials || getInitials(first.fullName),
            });
          }
        }
        setPeers(list);
      });

      ch.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          void ch.track({
            userId: currentUser.userId,
            fullName: currentUser.fullName,
            initials: getInitials(currentUser.fullName),
          });
        }
      });

      return () => {
        setPeers([]);
        void supabase.removeChannel(ch);
      };
    } catch {
      setPeers([]);
      if (channel) {
        try {
          void channel.unsubscribe();
        } catch {
          // Ignore teardown errors when env/realtime is unconfigured.
        }
      }
      return undefined;
    }
  }, [cloud, currentUser?.fullName, currentUser?.userId, threadId]);

  return peers;
}
