import { JURISDICTIONS } from './jurisdictions';
import { classifyOffline } from './offline-classifier';
import type { WorkspaceThread } from './types';

export const READONLY_DEMO_THREAD_ID = 'demo-readonly-dossier';

const DEMO_PROMPT =
  'Inversor solar híbrido 5 kW 48V DC a 110/220V AC con controlador MPPT integrado de 100A';

/**
 * Deterministic, zero-AI sample dossier shown inside `/app` when a newly registered
 * account is still locked in read-only mode awaiting payment verification.
 */
export function createReadOnlyDemoThread(): WorkspaceThread {
  const jurisdiction = JURISDICTIONS[0];
  const timestamp = '2026-11-26T12:00:00.000Z';
  const envelope = classifyOffline({
    query: DEMO_PROMPT,
    jurisdiction,
  });

  return {
    id: READONLY_DEMO_THREAD_ID,
    title: 'Expediente Demostrativo · Inversor solar 5 kW',
    jurisdictionId: jurisdiction.id,
    status: 'regular',
    createdAt: timestamp,
    updatedAt: timestamp,
    messages: [
      {
        id: 'demo-msg-user',
        role: 'user',
        text: DEMO_PROMPT,
        createdAt: timestamp,
        jurisdictionId: jurisdiction.id,
      },
      {
        id: 'demo-msg-assistant',
        role: 'assistant',
        text: envelope.assistantMessage,
        createdAt: timestamp,
        jurisdictionId: jurisdiction.id,
        envelope,
        latencyMs: 620,
      },
    ],
  };
}
