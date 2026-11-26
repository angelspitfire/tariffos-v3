import type {
  A2UIDossierComponent,
  A2UIEnvelope,
  AgentReviewTrigger,
  ApprovalWorkflowMode,
} from '@tariffos/shared-types';

const LOW_CONFIDENCE_REVIEW_THRESHOLD = 75;

export function resolveInitialDossierReview(
  dossier: A2UIDossierComponent,
  policy: ApprovalWorkflowMode = 'agent_decides'
): A2UIDossierComponent {
  if (dossier.reviewStatus === 'approved') {
    return dossier;
  }

  if (policy === 'direct_seal') {
    return { ...dossier, reviewStatus: 'draft_ai' };
  }

  if (policy === 'always_review') {
    const trigger: AgentReviewTrigger = dossier.agentReviewTrigger ?? {
      invokedBySkill: 'Política de Compliance',
      reason: 'La configuración del espacio exige revisión técnica antes de sellar cada dictamen.',
    };
    return {
      ...dossier,
      reviewStatus: 'in_review',
      agentReviewTrigger: trigger,
    };
  }

  if (dossier.reviewStatus === 'in_review' || dossier.agentReviewTrigger) {
    return {
      ...dossier,
      reviewStatus: 'in_review',
      agentReviewTrigger: dossier.agentReviewTrigger ?? {
        invokedBySkill: 'Agente Clasificador',
        reason: 'El agente solicitó revisión técnica antes del sellado por criterios del skill activo.',
      },
    };
  }

  const missingFields = (dossier.unresolved ?? []).filter((item) => item.trim().length > 0);
  const warnFlags = (dossier.flags ?? []).filter((f) => f.type === 'warn');
  const lowConfidence =
    typeof dossier.confidencePct === 'number' &&
    dossier.confidencePct < LOW_CONFIDENCE_REVIEW_THRESHOLD;

  if (missingFields.length > 0 || warnFlags.length > 0 || lowConfidence) {
    const reasons: string[] = [];
    if (missingFields.length > 0) {
      reasons.push(
        `Información incompleta detectada (${missingFields.length} punto${missingFields.length > 1 ? 's' : ''} por confirmar)`
      );
    }
    if (warnFlags.length > 0) {
      reasons.push(warnFlags[0].text || warnFlags[0].title);
    }
    if (lowConfidence) {
      reasons.push(
        `Confianza preliminar ${dossier.confidencePct}% por debajo del umbral de sellado directo (${LOW_CONFIDENCE_REVIEW_THRESHOLD}%)`
      );
    }
    return {
      ...dossier,
      reviewStatus: 'in_review',
      agentReviewTrigger: {
        invokedBySkill: 'Agente Clasificador (RGI)',
        reason: `${reasons.join('. ')}.`,
        ...(missingFields.length > 0 ? { missingFields } : {}),
      },
    };
  }

  return {
    ...dossier,
    reviewStatus: dossier.reviewStatus ?? 'draft_ai',
  };
}

export function applyApprovalPolicyToEnvelope(
  envelope: A2UIEnvelope,
  policy: ApprovalWorkflowMode = 'agent_decides'
): A2UIEnvelope {
  if (!envelope.canvasComponents || envelope.canvasComponents.length === 0) {
    return envelope;
  }
  let changed = false;
  const nextCanvas = envelope.canvasComponents.map((comp) => {
    if (comp.type !== 'dossier') return comp;
    const resolved = resolveInitialDossierReview(comp, policy);
    if (resolved !== comp) changed = true;
    return resolved;
  });
  return changed ? { ...envelope, canvasComponents: nextCanvas } : envelope;
}
