import { describe, expect, it } from 'vitest';
import type { ApprovalWorkflowMode } from './a2ui-canvas.js';
import {
  AGENCY_ROLES,
  canManageAgencyTeam,
  canSealDossier,
  normalizeAgencyRole,
  ProcessActivityEventSchema,
  type AgencyRole,
} from './process-hub.js';

describe('process-hub collaboration roles and permissions', () => {
  it('normalizes legacy and canonical membership roles to OWNER | REVIEWER | ANALYST', () => {
    expect(normalizeAgencyRole('OWNER')).toBe('OWNER');
    expect(normalizeAgencyRole('admin')).toBe('OWNER');
    expect(normalizeAgencyRole('super_admin')).toBe('OWNER');
    expect(normalizeAgencyRole('REVIEWER')).toBe('REVIEWER');
    expect(normalizeAgencyRole('broker')).toBe('REVIEWER');
    expect(normalizeAgencyRole('ANALYST')).toBe('ANALYST');
    expect(normalizeAgencyRole('MEMBER')).toBe('ANALYST');
    expect(normalizeAgencyRole(null)).toBe('ANALYST');
    expect(normalizeAgencyRole(undefined)).toBe('ANALYST');
  });

  it('enforces canSealDossier across the full 3 roles x 3 ApprovalWorkflowMode matrix', () => {
    const modes: readonly ApprovalWorkflowMode[] = ['agent_decides', 'direct_seal', 'always_review'];
    const expected: Record<AgencyRole, Record<ApprovalWorkflowMode, boolean>> = {
      OWNER: { agent_decides: true, direct_seal: true, always_review: true },
      REVIEWER: { agent_decides: true, direct_seal: true, always_review: true },
      ANALYST: { agent_decides: true, direct_seal: true, always_review: false },
    };

    for (const role of AGENCY_ROLES) {
      for (const mode of modes) {
        expect(canSealDossier(role, mode)).toBe(expected[role][mode]);
      }
    }
  });

  it('restricts canManageAgencyTeam exclusively to OWNER', () => {
    expect(canManageAgencyTeam('OWNER')).toBe(true);
    expect(canManageAgencyTeam('REVIEWER')).toBe(false);
    expect(canManageAgencyTeam('ANALYST')).toBe(false);
  });

  it('validates ProcessActivityEventSchema payloads', () => {
    const parsed = ProcessActivityEventSchema.safeParse({
      id: 'evt-1',
      action: 'review_requested',
      actorName: 'Ana Pérez',
      actorUserId: 'u-1',
      targetName: 'Carlos Méndez',
      note: 'Verificar Nota 1a Cap. 29',
      createdAt: '2026-11-28T01:45:00.000Z',
    });
    expect(parsed.success).toBe(true);
  });
});
