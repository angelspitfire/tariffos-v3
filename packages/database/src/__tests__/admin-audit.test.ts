import { describe, expect, it, vi } from 'vitest';
import { recordAdminAudit } from '../admin-audit';

describe('recordAdminAudit', () => {
  it('writes an append-only audit log entry via the provided prisma/tx client', async () => {
    const createMock = vi.fn().mockResolvedValue({ id: 'aud-1' });
    const tx = {
      adminAuditLog: {
        create: createMock,
      },
    };

    await recordAdminAudit(tx, {
      actorUserId: 'admin-1',
      actorEmail: 'owner@tariffos.app',
      actorRole: 'super_admin',
      action: 'tenant.deactivated',
      targetType: 'tenant',
      targetId: 'ten-1',
      tenantId: 'ten-1',
      beforeState: { billingStatus: 'ACTIVE' },
      afterState: { billingStatus: 'CANCELED' },
      reason: 'Solicitud de baja voluntaria',
    });

    expect(createMock).toHaveBeenCalledWith({
      data: {
        actorUserId: 'admin-1',
        actorEmail: 'owner@tariffos.app',
        actorRole: 'super_admin',
        action: 'tenant.deactivated',
        targetType: 'tenant',
        targetId: 'ten-1',
        tenantId: 'ten-1',
        beforeState: { billingStatus: 'ACTIVE' },
        afterState: { billingStatus: 'CANCELED' },
        reason: 'Solicitud de baja voluntaria',
      },
    });
  });

  it('normalizes optional fields to null when omitted', async () => {
    const createMock = vi.fn().mockResolvedValue({ id: 'aud-2' });
    await recordAdminAudit(
      { adminAuditLog: { create: createMock } },
      {
        actorUserId: 'admin-2',
        actorRole: 'ops_billing',
        action: 'plan.created',
        targetType: 'plan',
        targetId: 'plan-custom',
      },
    );

    expect(createMock).toHaveBeenCalledWith({
      data: {
        actorUserId: 'admin-2',
        actorEmail: null,
        actorRole: 'ops_billing',
        action: 'plan.created',
        targetType: 'plan',
        targetId: 'plan-custom',
        tenantId: null,
        beforeState: undefined,
        afterState: undefined,
        reason: null,
      },
    });
  });
});
