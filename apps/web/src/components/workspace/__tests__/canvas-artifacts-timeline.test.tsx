import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { A2UIDossierComponent } from '@tariffos/shared-types';
import { computeDossierDiff, type ThreadArtifactSummary } from '@/lib/workspace/artifact-versions';
import { OpenArtifactTabsStrip } from '../molecules/OpenArtifactTabsStrip';
import { ChangeTimelineModal } from '../organisms/ChangeTimelineModal';

function makeDossier(hsCode: string, regime: string): A2UIDossierComponent {
  return {
    type: 'dossier',
    id: `dos-${hsCode}`,
    title: 'Inversor solar',
    hsCode,
    officialDescription: 'Convertidores estáticos',
    jurisdictionName: 'Venezuela (SENIAT)',
    confidencePct: 94,
    confidenceLevel: 'Alta',
    reviewStatus: 'draft_ai',
    legalNotes: [regime],
    technicalSpecs: [{ key: 'Potencia', value: '5 kW' }],
    rgiSteps: [{ rule: 'RGI 1', application: 'Nota 85' }],
    permits: [],
    flags: [],
  };
}

describe('Canvas multi-artifact tabs and ChangeTimelineModal', () => {
  it('switches between multiple artifacts in OpenArtifactTabsStrip', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn<(id: string) => void>();
    const artifacts: ThreadArtifactSummary[] = [
      { id: 'm1', versionNumber: 1, code: '8504.40.90.00', title: 'Inversor 5kW', createdAt: '2026-01-01' },
      { id: 'm2', versionNumber: 2, code: '9018.12.10.00', title: 'Ecógrafo', createdAt: '2026-01-02' },
    ];

    render(
      <OpenArtifactTabsStrip
        artifacts={artifacts}
        activeArtifactId="m2"
        onSelectArtifact={onSelect}
      />,
    );

    await user.click(screen.getByRole('tab', { name: /8504\.40\.90\.00/i }));
    expect(onSelect).toHaveBeenCalledWith('m1');
  });

  it('computes dossier diff and renders ChangeTimelineModal comparison', () => {
    const left = makeDossier('8504.40.10.00', 'Libre');
    const right = makeDossier('8504.40.90.00', 'Licencia');
    const diff = computeDossierDiff(left, right);
    expect(diff.find((r) => r.label === 'Código SA / NCM')?.status).toBe('changed');

    const artifacts: ThreadArtifactSummary[] = [
      { id: 'm1', versionNumber: 1, code: left.hsCode, title: 'Inversor v1', createdAt: '2026-01-01', dossier: left },
      { id: 'm2', versionNumber: 2, code: right.hsCode, title: 'Inversor v2', createdAt: '2026-01-02', dossier: right },
    ];

    render(
      <ChangeTimelineModal
        open
        artifacts={artifacts}
        onClose={vi.fn<() => void>()}
        onSelectArtifact={vi.fn<(id: string) => void>()}
      />,
    );

    expect(screen.getByText(/Línea de tiempo y comparador de versiones/i)).toBeInTheDocument();
    expect(screen.getAllByText('8504.40.10.00').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('8504.40.90.00').length).toBeGreaterThanOrEqual(1);
  });
});
