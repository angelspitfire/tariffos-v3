import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { SkuPrecedent } from '@tariffos/shared-types';
import { ArtifactDirectoryDrawer } from '../molecules/ArtifactDirectoryDrawer';
import { SkuCatalogModal } from '../organisms/SkuCatalogModal';

describe('ArtifactDirectoryDrawer and SkuCatalogModal edit', () => {
  it('filters artifacts inside ArtifactDirectoryDrawer and selects on click', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn<(id: string) => void>();
    render(
      <ArtifactDirectoryDrawer
        open
        artifacts={[
          { id: 'm1', versionNumber: 1, code: '8504.40.90.00', title: 'Inversor solar', createdAt: '2026-10-01' },
          { id: 'm2', versionNumber: 2, code: '9018.12.10.00', title: 'Ecógrafo', createdAt: '2026-11-01' },
        ]}
        activeArtifactId="m1"
        onSelectArtifact={onSelect}
        onClose={vi.fn<() => void>()}
      />,
    );

    await user.type(screen.getByPlaceholderText(/Buscar artefacto/i), '9018');
    await user.click(screen.getByRole('button', { name: /9018\.12\.10\.00/i }));
    expect(onSelect).toHaveBeenCalledWith('m2');
  });

  it('supports inline editing of an existing SKU precedent in SkuCatalogModal', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn<(p: SkuPrecedent) => void>();
    const existing: SkuPrecedent = {
      id: 'sku-1',
      sku: 'INV-5000',
      normalizedSku: 'inv-5000',
      title: 'Inversor 5kW',
      description: 'Inversor 5kW',
      hsCode: '8504.40.90.00',
      jurisdictionId: 've-seniat',
      adValoremPercent: 10,
      vatPercent: 16,
      legalRegime: 'Libre',
      reviewStatus: 'approved',
      usageCount: 2,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };

    render(
      <SkuCatalogModal
        open
        precedents={[existing]}
        jurisdictionId="ve-seniat"
        onClose={vi.fn<() => void>()}
        onSave={onSave}
        onDelete={vi.fn<(id: string) => void>()}
        onApplyToChat={vi.fn<(p: SkuPrecedent) => void>()}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Editar SKU INV-5000/i }));
    const titleInput = screen.getByPlaceholderText(/Descripción breve/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'Inversor híbrido 5kW');
    await user.click(screen.getByRole('button', { name: /Guardar precedente/i }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'sku-1',
        title: 'Inversor híbrido 5kW',
      }),
    );
  });
});
