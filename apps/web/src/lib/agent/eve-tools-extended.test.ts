import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { A2UICalculatorComponentSchema, A2UIEnvelopeSchema } from '@tariffos/shared-types';
import calculateDutiesTool from '../../../../../agent/tools/calculate_duties';
import requestClarificationTool, {
  executeRequestTechnicalClarification,
  RequestTechnicalClarificationInputSchema,
} from '../../../../../agent/tools/request_technical_clarification';
import analyzeManifestTool, {
  AnalyzeInvoiceManifestInputSchema,
  executeAnalyzeInvoiceManifest,
} from '../../../../../agent/tools/analyze_invoice_manifest';

const REPO_ROOT = resolve(__dirname, '../../../../..');

describe('Eve instructions & modular skills on disk', () => {
  it('defines conversational multi-turn rules in agent/instructions.md without unnecessary tool calls', () => {
    const instructions = readFileSync(resolve(REPO_ROOT, 'agent/instructions.md'), 'utf8');
    expect(instructions).toMatch(/saludos|conceptuales/i);
    expect(instructions).toMatch(/sin invocar herramientas innecesarias/i);
    expect(instructions).toContain('ve-rgi-classification');
    expect(instructions).toContain('cif-duty-liquidation');
    expect(instructions).toContain('chat-manifest-analysis');
    expect(instructions).toContain('oga-compliance-review');
  });

  it('ships four modular packaged skills with valid frontmatter descriptions', () => {
    const expectedSkills = [
      've-rgi-classification',
      'cif-duty-liquidation',
      'chat-manifest-analysis',
      'oga-compliance-review',
    ];

    for (const skill of expectedSkills) {
      const skillPath = resolve(REPO_ROOT, 'agent/skills', skill, 'SKILL.md');
      expect(existsSync(skillPath)).toBe(true);
      const raw = readFileSync(skillPath, 'utf8');
      expect(raw).toMatch(/^---\n[\s\S]*?description:\s*.+\n[\s\S]*?---/);
    }
  });
});

describe('Eve request_technical_clarification tool (HITL)', () => {
  it('ends the turn cleanly and builds a schema-valid questionnaire A2UIEnvelope', async () => {
    expect((requestClarificationTool as { endsTurn?: boolean }).endsTurn).toBe(true);

    const parsed = RequestTechnicalClarificationInputSchema.parse({
      message: 'Para ubicar la subpartida en 85.01 confirma potencia y fases del motor:',
      title: 'Especificaciones del motor eléctrico',
      mode: 'questionnaire',
      questions: [
        {
          id: 'fases',
          label: 'Tipo de corriente / fases',
          fieldType: 'select',
          options: ['Monofásico AC', 'Trifásico AC', 'Corriente continua DC'],
        },
        {
          id: 'potencia',
          label: 'Potencia nominal',
          fieldType: 'number',
          unit: 'kW',
          placeholder: 'Ej. 5.5',
        },
      ],
    });

    const result = await executeRequestTechnicalClarification(parsed);
    expect(result.status).toBe('needs_input');

    const envelope = A2UIEnvelopeSchema.parse(result.envelope);
    expect(envelope.workflowState).toBe('needs_input');
    expect(envelope.classificationStatus).toBe('needs_details');
    expect(envelope.inlineComponents[0]?.type).toBe('questionnaire');
  });

  it('builds a schema-valid disambiguation A2UIEnvelope with numbered 1-click options', async () => {
    const parsed = RequestTechnicalClarificationInputSchema.parse({
      message: 'Detecté dos posibles configuraciones para este dispositivo:',
      title: '¿Cuál describe mejor el producto?',
      mode: 'disambiguation',
      options: [
        {
          id: 'opt-watch',
          label: 'Smartwatch multifunción (GPS, apps, sensores)',
          technicalDetail: 'Clasifica como demás relojes eléctricos en 9102.19.00.00.',
          suggestedHsHint: '9102.19.00.00',
        },
        {
          id: 'opt-band',
          label: 'Indicador optoelectrónico solamente',
          technicalDetail: 'Solo muestra hora/datos básicos sin funciones inteligentes.',
          suggestedHsHint: '9102.12.10.00',
        },
      ],
    });

    const result = await executeRequestTechnicalClarification(parsed);
    const envelope = A2UIEnvelopeSchema.parse(result.envelope);
    expect(envelope.classificationStatus).toBe('needs_disambiguation');
    expect(envelope.inlineComponents[0]?.type).toBe('disambiguation');
  });
});

describe('Eve analyze_invoice_manifest tool (streaming without polling)', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('enforces 2 to 25 item bounds on input schema', () => {
    expect(
      AnalyzeInvoiceManifestInputSchema.safeParse({
        items: [{ description: 'Solo un ítem' }],
      }).success,
    ).toBe(false);

    expect(
      AnalyzeInvoiceManifestInputSchema.safeParse({
        items: Array.from({ length: 26 }, (_, idx) => ({ description: `Item ${idx + 1}` })),
      }).success,
    ).toBe(false);
  });

  it('streams preliminary progress and yields a validated batch_manifest A2UIEnvelope', async () => {
    vi.stubEnv('DATABASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '');

    const input = AnalyzeInvoiceManifestInputSchema.parse({
      documentReference: 'FAC-2026-019',
      countryCode: 'VE',
      items: [
        { sku: 'INV-5K', description: 'Inversor solar híbrido 5kW 48V MPPT', originCountry: 'CN', cifValue: 1200 },
        { sku: 'PAN-550', description: 'Panel solar monocristalino 550W', originCountry: 'CN', cifValue: 2200 },
      ],
    });

    const snapshots: Array<Record<string, unknown>> = [];
    for await (const snap of executeAnalyzeInvoiceManifest(input, {
      auth: { current: { principalId: 'local', authenticator: 'local-dev' } },
    })) {
      snapshots.push(snap as unknown as Record<string, unknown>);
    }

    expect(snapshots.length).toBeGreaterThanOrEqual(2);
    expect(snapshots[0]?.envelope).toBeNull();

    const finalSnap = snapshots[snapshots.length - 1];
    expect(finalSnap?.totalItems).toBe(2);
    const envelope = A2UIEnvelopeSchema.parse(finalSnap?.envelope);
    expect(envelope.canvasComponents.some((c) => c.type === 'batch_manifest')).toBe(true);
    expect(envelope.inlineComponents.some((c) => c.type === 'document_summary')).toBe(true);
    expect(analyzeManifestTool.description).toMatch(/2 to 25|manifest/i);
  });
});

describe('Eve calculate_duties tool calculatorComponent output', () => {
  it('returns both customsValue breakdown and a validated A2UICalculatorComponent', async () => {
    const out = await (
      calculateDutiesTool as unknown as {
        execute: (input: Record<string, unknown>) => Promise<Record<string, unknown>>;
      }
    ).execute({
      jurisdictionId: 've-seniat',
      hsCode: '8471.30.90.90',
      originCode: 'CN',
      incoterm: 'FOB',
      invoiceAmount: 2000,
      originChargesAmount: 0,
      freightAmount: 150,
      insuranceAmount: 50,
      baseAdValoremPercent: 16,
      vatPercent: 16,
      customsFeePercent: 1,
      exchangeRate: 45,
      applyExemption: false,
      hasCertificateOfOrigin: false,
      applyAntidumping: false,
      antidumpingPercent: 0,
    });

    expect(out.customsValue).toBe(2200);
    const calc = A2UICalculatorComponentSchema.parse(out.calculatorComponent);
    expect(calc.hsCode).toBe('8471.30.90.90');
    expect(calc.suggestedExchangeRate).toBe(45);
  });
});
