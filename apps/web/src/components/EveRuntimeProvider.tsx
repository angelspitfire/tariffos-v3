'use client';

import type { ReactNode } from 'react';
import { AssistantRuntimeProvider } from '@assistant-ui/react';
import { useEveAgentRuntime } from '@assistant-ui/eve';

/**
 * Provides the Vercel Eve + assistant-ui runtime connected to the same-origin
 * Eve channel mounted via withEve() in next.config.ts.
 */
export function EveRuntimeProvider({ children }: { children: ReactNode }) {
  const runtime = useEveAgentRuntime();
  return <AssistantRuntimeProvider runtime={runtime}>{children}</AssistantRuntimeProvider>;
}
