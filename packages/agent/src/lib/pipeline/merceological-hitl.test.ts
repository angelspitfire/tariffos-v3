import { describe, expect, it } from 'vitest';
import {
  CANONICAL_MERCEOLOGICAL_ATTRIBUTES,
  HITL_CONFIDENCE_THRESHOLD,
  buildMerceologicalSheet,
  evaluateHitlGate,
} from './merceological-hitl.js';

describe('merceological-hitl', () => {
  it('builds all 7 canonical attributes with provenance, missing criticals, and confidence breakdown', () => {
    const sheet = buildMerceologicalSheet({
      description: 'Bomba centrífuga eléctrica 220V de acero inoxidable para bombeo industrial',
      productName: 'Bomba centrífuga industrial',
    });

    expect(sheet.attributes).toHaveLength(CANONICAL_MERCEOLOGICAL_ATTRIBUTES.length);
    expect(sheet.attributes).toHaveLength(7);

    const material = sheet.attributes.find((a) => a.key === 'naturaleza_materia');
    expect(material?.provenance).toBe('user_input');
    expect(material?.value.toLowerCase()).toContain('acero');

    const specs = sheet.attributes.find((a) => a.key === 'especificaciones_tecnicas');
    expect(specs?.value).toContain('220V');

    // Composition is missing (critical)
    expect(sheet.missingCriticalKeys).toContain('composicion');
    expect(sheet.confidenceBreakdown.penalties.some((p) => p.key === 'composicion')).toBe(true);
    expect(sheet.confidenceBreakdown.finalScore).toBeLessThan(99);
  });

  it('supports explicit attribute overrides with web_search provenance and reaches Alto confidence when complete', () => {
    const sheet = buildMerceologicalSheet({
      description: 'MacBook Pro 14 M5 Max',
      confirmedByUser: true,
      webSearchTriggered: true,
      webSources: [{ title: 'Apple Specs', uri: 'https://apple.com/macbook-pro' }],
      attributesOverride: {
        naturaleza_materia: { value: 'Carcasa de aluminio reciclado', provenance: 'web_search' },
        composicion: { value: '100% aluminio y electrónica integrada', provenance: 'web_search' },
        funcion_uso: { value: 'Procesamiento automático de datos portátil', provenance: 'user_input' },
        principio_funcionamiento: { value: 'Electrónico digital con batería interna', provenance: 'web_search' },
        estado_elaboracion: { value: 'Producto terminado nuevo', provenance: 'user_input' },
        presentacion: { value: 'Caja individual retail', provenance: 'user_input' },
        especificaciones_tecnicas: { value: '1.84 kg, pantalla 14.2", Wi-Fi 7', provenance: 'web_search' },
      },
    });

    expect(sheet.missingCriticalKeys).toEqual([]);
    expect(sheet.confidenceBreakdown.level).toBe('Alto');
    expect(sheet.confidenceBreakdown.finalScore).toBeGreaterThanOrEqual(85);
    expect(sheet.webSearchTriggered).toBe(true);
  });

  it('triggers HITL gate with clarifying questions and tentative proposal when critical attributes are missing', () => {
    const sheet = buildMerceologicalSheet({
      description: 'Válvula industrial',
    });

    const gate = evaluateHitlGate({
      sheet,
      confidenceThreshold: HITL_CONFIDENCE_THRESHOLD,
      topCandidate: {
        hsCode: '8481.80.99.00',
        title: 'Los demás artículos de grifería y órganos similares',
        confidencePct: 62,
        reason: 'Hipótesis preliminar sujeta a material y mecanismo de accionamiento',
      },
    });

    expect(gate.needsInput).toBe(true);
    expect(gate.workflowState).toBe('needs_input');
    expect(gate.clarifyingQuestions.length).toBeGreaterThan(0);
    expect(gate.clarifyingQuestions.every((q) => q.critical === true)).toBe(true);
    expect(gate.tentativeProposal?.hsCode).toBe('8481.80.99.00');
    expect(gate.decision.outcome).toBe('needs_input');
  });

  it('passes HITL gate as classified when no critical fields are missing and confidence meets threshold', () => {
    const sheet = buildMerceologicalSheet({
      description: 'Camiseta 100% algodón tejido punto para uso comercial terminada en caja retail 200g',
      attributesOverride: {
        naturaleza_materia: { value: 'Algodón textil', provenance: 'user_input' },
        composicion: { value: '100% algodón', provenance: 'user_input' },
        funcion_uso: { value: 'Prenda de vestir', provenance: 'user_input' },
        principio_funcionamiento: { value: 'Tejido de punto mecánico', provenance: 'user_input' },
        especificaciones_tecnicas: { value: '200 g/m2, talla M', provenance: 'user_input' },
      },
    });

    const gate = evaluateHitlGate({ sheet, confidencePct: 90 });
    expect(gate.needsInput).toBe(false);
    expect(gate.workflowState).toBe('classified');
    expect(gate.clarifyingQuestions).toEqual([]);
  });
});
