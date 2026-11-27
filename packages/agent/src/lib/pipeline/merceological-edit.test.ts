import { describe, expect, it } from 'vitest';
import {
  buildDefaultMerceologicalSheet,
  mergeUserEditedSheet,
} from './merceological-edit.js';

describe('merceological-edit (canonical UI/HITL sheet helpers)', () => {
  it('builds a canonical 7-attribute sheet marking composicion as critical and using provenance weights', () => {
    const sheet = buildDefaultMerceologicalSheet('Válvula industrial', {
      naturaleza_materia: 'Acero inoxidable AISI 316',
    });

    expect(sheet.attributes).toHaveLength(7);
    const composicion = sheet.attributes.find((a) => a.key === 'composicion');
    expect(composicion?.critical).toBe(true);
    expect(sheet.missingCriticalKeys).toContain('composicion');
    expect(sheet.confidenceBreakdown.finalScore).toBeGreaterThanOrEqual(5);
    expect(sheet.confidenceBreakdown.finalScore).toBeLessThanOrEqual(99);
  });

  it('recomputes canonical confidence and clears placeholder-like missing text when user edits a sheet', () => {
    const base = buildDefaultMerceologicalSheet('Bomba centrífuga');
    const updated = mergeUserEditedSheet(
      base,
      {
        naturaleza_materia: 'Hierro fundido',
        composicion: '100% hierro dúctil',
        funcion_uso: 'Bombeo de agua residual',
        principio_funcionamiento: 'Eléctrico trifásico',
        estado_elaboracion: 'Terminado nuevo',
        presentacion: 'Pallet individual',
        especificaciones_tecnicas: 'N/A',
      },
      true,
    );

    expect(updated.confirmedByUser).toBe(true);
    expect(updated.missingCriticalKeys).toEqual(['especificaciones_tecnicas']);
    const tech = updated.attributes.find((a) => a.key === 'especificaciones_tecnicas');
    expect(tech?.provenance).toBe('missing');
    expect(tech?.value).toBe('');
  });
});
