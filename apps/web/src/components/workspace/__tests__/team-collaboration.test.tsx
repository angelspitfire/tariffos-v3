// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type {
  A2UIDossierComponent,
  AgencyInvitationSummary,
  AgencyMemberSummary,
  ProcessActivityEvent,
} from '@tariffos/shared-types';
import type { WorkspaceThread } from '@/lib/workspace/types';
import { ProcessPresenceBadge } from '../atoms/ProcessPresenceBadge';
import { DossierApprovalBar } from '../molecules/DossierApprovalBar';
import { ProcessActivityStrip } from '../molecules/ProcessActivityStrip';
import { SettingsTeamTab } from '../molecules/SettingsTeamTab';
import { WorkspaceMessageBubble } from '../molecules/WorkspaceMessageBubble';
import { ProcessHubView } from '../organisms/ProcessHubView';

const TEAM_MEMBERS: AgencyMemberSummary[] = [
  { userId: 'u-ana', email: 'ana@agencia.ve', fullName: 'Ana Pérez', role: 'ANALYST' },
  { userId: 'u-carlos', email: 'carlos@agencia.ve', fullName: 'Carlos Méndez', role: 'REVIEWER' },
  { userId: 'u-owner', email: 'elena@agencia.ve', fullName: 'Elena Ruiz', role: 'OWNER' },
];

const INVITATIONS: AgencyInvitationSummary[] = [
  {
    id: 'inv-1',
    email: 'jorge@agencia.ve',
    role: 'ANALYST',
    status: 'PENDING',
    expiresAt: '2026-12-05T00:00:00.000Z',
  },
];

const THREADS: WorkspaceThread[] = [
  {
    id: 't-ana',
    title: 'Bomba hidráulica Ana',
    jurisdictionId: 've-seniat',
    status: 'regular',
    processKind: 'single_ruling',
    operationalStatus: 'processing',
    createdByUserId: 'u-ana',
    assignedToUserId: 'u-carlos',
    messages: [],
    createdAt: '2026-11-28T09:00:00Z',
    updatedAt: '2026-11-28T10:00:00Z',
  },
  {
    id: 't-review',
    title: 'Químico OGA revisión',
    jurisdictionId: 've-seniat',
    status: 'regular',
    processKind: 'oga_escalation',
    operationalStatus: 'in_review',
    createdByUserId: 'u-carlos',
    assignedToUserId: 'u-carlos',
    messages: [],
    createdAt: '2026-11-28T08:00:00Z',
    updatedAt: '2026-11-28T11:00:00Z',
  },
];

const SAMPLE_DOSSIER: A2UIDossierComponent = {
  type: 'dossier',
  id: 'd-1',
  title: 'Dictamen',
  hsCode: '8413.70.10.00',
  officialDescription: 'Bombas centrífugas',
  jurisdictionName: 'Venezuela',
  reviewStatus: 'draft_ai',
  technicalSpecs: [],
  rgiSteps: [],
  legalNotes: [],
  permits: [],
  flags: [],
};

describe('Fase B Team Collaboration UI', () => {
  it('defaults ProcessHubView by agencyRole (ANALYST -> Mis procesos, REVIEWER -> Asignados/Por aprobar, OWNER -> Toda la agencia)', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <ProcessHubView
        threads={THREADS}
        agencyRole="ANALYST"
        currentUserId="u-ana"
        teamMembers={TEAM_MEMBERS}
        onOpenProcess={vi.fn()}
        onArchiveProcess={vi.fn()}
        onNewThread={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText('Bomba hidráulica Ana')).toBeInTheDocument();
    expect(screen.queryByText('Químico OGA revisión')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Toda la agencia/i }));
    expect(screen.getByText('Químico OGA revisión')).toBeInTheDocument();

    rerender(
      <ProcessHubView
        threads={THREADS}
        agencyRole="REVIEWER"
        currentUserId="u-carlos"
        teamMembers={TEAM_MEMBERS}
        onOpenProcess={vi.fn()}
        onArchiveProcess={vi.fn()}
        onNewThread={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText('Químico OGA revisión')).toBeInTheDocument();
  });

  it('hides Aprobar y sellar for ANALYST under always_review and lets operator assign a reviewer with note', async () => {
    const user = userEvent.setup();
    const onRequestReview = vi.fn();

    render(
      <DossierApprovalBar
        dossier={SAMPLE_DOSSIER}
        workflowMode="always_review"
        agencyRole="ANALYST"
        teamMembers={TEAM_MEMBERS}
        onApprove={vi.fn()}
        onRequestReview={onRequestReview}
      />,
    );

    expect(screen.queryByRole('button', { name: /Aprobar y sellar/i })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Enviar a revisión/i }));
    await user.selectOptions(screen.getByLabelText(/Asignar revisor/i), 'u-carlos');
    await user.type(screen.getByPlaceholderText(/Nota de cumplimiento/i), 'Confirmar presión nominal');
    await user.click(screen.getByRole('button', { name: /Confirmar revisión/i }));

    expect(onRequestReview).toHaveBeenCalledWith('Confirmar presión nominal', 'u-carlos', 'Carlos Méndez');
  });

  it('renders ProcessActivityStrip, ProcessPresenceBadge, and author attribution on WorkspaceMessageBubble', () => {
    const events: ProcessActivityEvent[] = [
      {
        id: 'evt-1',
        action: 'review_requested',
        actorName: 'Ana Pérez',
        targetName: 'Carlos Méndez',
        note: 'Verificar Nota 1a',
        createdAt: '2026-11-28T10:15:00.000Z',
      },
    ];
    render(
      <div>
        <ProcessPresenceBadge peers={[{ userId: 'u-ana', fullName: 'Ana Pérez', initials: 'AP' }]} />
        <ProcessActivityStrip events={events} />
        <WorkspaceMessageBubble
          message={{
            id: 'm1',
            role: 'user',
            text: 'Bomba sumergible',
            createdAt: '2026-11-28T10:00:00.000Z',
            jurisdictionId: 've-seniat',
            authorName: 'Ana Pérez',
          }}
          inlineActions={{
            onOpenCanvasTab: vi.fn(),
            onExportPdf: vi.fn(),
            onSaveSku: vi.fn(),
            onSubmitSheet: vi.fn(),
            onAcceptTentative: vi.fn(),
            onSubmitQuestionnaire: vi.fn(),
            onSelectDisambiguation: vi.fn(),
          }}
        />
      </div>,
    );

    expect(screen.getByText(/Ana Pérez está viendo este proceso/i)).toBeInTheDocument();
    expect(screen.getByText(/Ana Pérez · Carlos Méndez/i)).toBeInTheDocument();
    expect(screen.getByText('Ana Pérez')).toBeInTheDocument();
  });

  it('supports inviting members, updating roles, and revoking invitations in SettingsTeamTab', async () => {
    const user = userEvent.setup();
    const onInvite = vi.fn().mockResolvedValue({ ok: true });
    const onUpdateRole = vi.fn().mockResolvedValue({ ok: true });
    const onRevoke = vi.fn().mockResolvedValue({ ok: true });

    render(
      <SettingsTeamTab
        currentUserId="u-owner"
        members={TEAM_MEMBERS}
        invitations={INVITATIONS}
        onInvite={onInvite}
        onUpdateRole={onUpdateRole}
        onRevokeInvitation={onRevoke}
      />,
    );

    await user.type(screen.getByLabelText(/Correo del colaborador/i), 'luis@agencia.ve');
    await user.selectOptions(screen.getByLabelText(/Rol de invitación/i), 'REVIEWER');
    await user.click(screen.getByRole('button', { name: /Enviar invitación/i }));
    expect(onInvite).toHaveBeenCalledWith('luis@agencia.ve', 'REVIEWER');

    await user.selectOptions(screen.getByLabelText(/Rol de Ana Pérez/i), 'REVIEWER');
    expect(onUpdateRole).toHaveBeenCalledWith('u-ana', 'REVIEWER');

    await user.click(screen.getByRole('button', { name: /Revocar invitación a jorge@agencia\.ve/i }));
    expect(onRevoke).toHaveBeenCalledWith('inv-1');
  });
});
