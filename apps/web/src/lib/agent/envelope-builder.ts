import { mapPayloadToA2UIEnvelope } from '@tariffos/agent';
import type { A2UIEnvelope, ClassificationLinePayload } from '@tariffos/shared-types';
import type { ClassifyStreamRequest } from './classify-stream-schema';

export { buildHitlEnvelope } from './hitl-envelope-builder';

/**
 * Adapts a pipeline line payload into a validated A2UIEnvelope using
 * the canonical `@tariffos/agent` mapper and tenant approval workflow policy.
 */
export function buildA2UIEnvelopeFromLine(
  line: ClassificationLinePayload,
  input: ClassifyStreamRequest,
): A2UIEnvelope {
  return mapPayloadToA2UIEnvelope(line, {
    jurisdictionName:
      input.countryCode === 'VE' ? 'Venezuela (SENIAT — Decreto 4.944)' : input.countryCode,
    approvalWorkflowMode: input.approvalWorkflowMode,
    includeCalculator: input.cifValue > 0,
    incoterm: input.incoterm,
    reasoningDepth: input.deepMode ? 'deep' : 'standard',
  });
}
