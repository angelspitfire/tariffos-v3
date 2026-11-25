import { describe, it, expect } from 'vitest';
import { dispatchTool } from './dispatch-tool';
import { PresentToolSchema } from './tools';

describe('dispatch-tool', () => {
  describe('dispatchTool', () => {
    it('should return present tool for "present the cargo manifest"', () => {
      const result = dispatchTool('present the cargo manifest in a grid');
      expect(result.toolName).toBe('present');
      expect(result.artifactKind).toBe('present');
    });

    it('should return present tool for "display as grid"', () => {
      const result = dispatchTool('display as grid the manifest');
      expect(result.toolName).toBe('present');
    });

    it('should return present tool for "render the data"', () => {
      const result = dispatchTool('render the data as a component');
      expect(result.toolName).toBe('present');
    });

    it('should return present tool with display result', () => {
      const result = dispatchTool('present the cargo manifest in a grid');
      expect(result.toolName).toBe('present');
      const toolResult = result.toolResult as { display?: { type?: string; title?: string } };
      expect(toolResult).toHaveProperty('display');
      expect(toolResult.display).toHaveProperty('type', 'grid');
      expect(toolResult.display).toHaveProperty('title', 'Resumen de Despacho Aduanero');
    });

    it('should return calculate_taxes for "show me the tax breakdown"', () => {
      const result = dispatchTool('show me the tax breakdown');
      expect(result.toolName).toBe('calculate_taxes');
      expect(result.artifactKind).toBe('tax-breakdown');
    });

    it('should return calculate_taxes for "tax breakdown"', () => {
      const result = dispatchTool('tax breakdown');
      expect(result.toolName).toBe('calculate_taxes');
    });

    it('should return classify_single_item for "individual power supply"', () => {
      const result = dispatchTool('individual power supply classification');
      expect(result.toolName).toBe('classify_single_item');
      expect(result.artifactKind).toBe('single-item');
    });

    it('should return audit_discrepancies for "audit discrepancies"', () => {
      const result = dispatchTool('audit discrepancies between invoice and bol');
      expect(result.toolName).toBe('audit_discrepancies');
      expect(result.artifactKind).toBe('discrepancy-audit');
    });

    it('should return resolve_disambiguation for "arbitration on adapters"', () => {
      const result = dispatchTool('arbitration on adapters line 3');
      expect(result.toolName).toBe('resolve_disambiguation');
      expect(result.artifactKind).toBe('disambiguation');
    });

    it('should return verify_permits_compliance for "permit compliance"', () => {
      const result = dispatchTool('verify permit compliance');
      expect(result.toolName).toBe('verify_permits_compliance');
      expect(result.artifactKind).toBe('permits-matrix');
    });

    it('should return simulate_exonerations for "simulate exonerations"', () => {
      const result = dispatchTool('simulate exonerations under EU FTA');
      expect(result.toolName).toBe('simulate_exonerations');
      expect(result.artifactKind).toBe('exoneration-simulator');
    });

    it('should return generate_customs_dossier for "generate dossier"', () => {
      const result = dispatchTool('generate customs dossier');
      expect(result.toolName).toBe('generate_customs_dossier');
      expect(result.artifactKind).toBe('customs-dossier');
    });

    it('should return classify_batch_manifest as default', () => {
      const result = dispatchTool('hello world');
      expect(result.toolName).toBe('classify_batch_manifest');
      expect(result.artifactKind).toBe('batch-manifest');
    });

    it('should not trigger present for "grid" when "tax" is also present', () => {
      const result = dispatchTool('show me the tax grid');
      expect(result.toolName).toBe('calculate_taxes');
    });

    it('should not trigger present for "stack" when "tax" is also present', () => {
      const result = dispatchTool('tax stack view');
      expect(result.toolName).toBe('calculate_taxes');
    });

    it('should match all 6 Spanish quick prompts correctly', () => {
      expect(dispatchTool('Generar expediente oficial').toolName).toBe('generate_customs_dossier');
      expect(dispatchTool('Simulador de acuerdos TLC').toolName).toBe('simulate_exonerations');
      expect(dispatchTool('Ver matriz de vistos buenos').toolName).toBe('verify_permits_compliance');
      expect(dispatchTool('Arbitraje de subpartida (Línea 3)').toolName).toBe('resolve_disambiguation');
      expect(dispatchTool('Ver manifiesto de carga').toolName).toBe('classify_batch_manifest');
      expect(dispatchTool('Liquidación de tributos').toolName).toBe('calculate_taxes');
    });
  });

  describe('PresentToolSchema', () => {
    it('should validate valid present display', () => {
      const validDisplay = {
        display: {
          type: 'grid',
          title: 'Test',
          props: { filingId: 'TR-123' },
        },
      };
      expect(() => PresentToolSchema.parse(validDisplay)).not.toThrow();
    });

    it('should validate minimal present display', () => {
      const minimalDisplay = {
        display: {
          type: 'card',
        },
      };
      expect(() => PresentToolSchema.parse(minimalDisplay)).not.toThrow();
    });

    it('should reject invalid display type', () => {
      const invalidDisplay = {
        display: {
          type: 'invalid',
        },
      };
      expect(() => PresentToolSchema.parse(invalidDisplay)).toThrow();
    });
  });
});
