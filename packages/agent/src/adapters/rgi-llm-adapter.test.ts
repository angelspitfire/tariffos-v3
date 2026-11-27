import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  budgetLegalNotes,
  createRgiLlmRunner,
  MAX_OUTPUT_TOKENS_DEEP,
  MAX_OUTPUT_TOKENS_STANDARD,
  RgiResponseSchema,
  runRgiWithLlm,
} from './rgi-llm-adapter.js';

const mockGenerateJson = vi.fn();
const mockGetLlmProvider = vi.fn((_override?: unknown) => ({ generateJson: mockGenerateJson }));

vi.mock('@tariffos/ai-client', () => ({
  getLlmProvider: (override?: unknown) => mockGetLlmProvider(override),
}));

const sampleResponse = {
  hsCode: '8471.30.00.00',
  confidenceLevel: 'Alto' as const,
  confidencePct: 93,
  confidenceReason: 'Coincide con laptops portátiles',
  rgiSteps: [],
  alternatives: [],
  rejected: [],
  flags: [],
  unresolved: [],
};

beforeEach(() => {
  mockGenerateJson.mockReset();
  mockGetLlmProvider.mockClear();
});

describe('createRgiLlmRunner', () => {
  it('routes calls through the overridden provider and standard/deep models', async () => {
    mockGenerateJson.mockResolvedValue(sampleResponse);

    const runner = createRgiLlmRunner({
      provider: 'google',
      model: 'gemini-2.5-flash',
      deepModel: 'gemini-2.5-pro',
    });

    const std = await runner({
      item: { lineId: '1', description: 'Laptop 14 pulgadas', originCountry: 'CN', cifValue: 800 },
      candidates: [],
      notes: [],
      deepMode: false,
    });

    expect(mockGetLlmProvider).toHaveBeenCalledWith({
      provider: 'google',
      baseUrl: undefined,
    });
    expect(std.modelUsed).toBe('gemini-2.5-flash');
    expect(mockGenerateJson.mock.calls[0][2]).toMatchObject({ model: 'gemini-2.5-flash' });

    const deep = await runner({
      item: { lineId: '2', description: 'Laptop 14 pulgadas', originCountry: 'CN', cifValue: 800 },
      candidates: [],
      notes: [],
      deepMode: true,
    });

    expect(deep.modelUsed).toBe('gemini-2.5-pro');
    expect(mockGenerateJson.mock.calls[1][2]).toMatchObject({ model: 'gemini-2.5-pro' });
  });

  it('keeps runRgiWithLlm backwards compatible when no override is supplied', async () => {
    mockGenerateJson.mockResolvedValueOnce(sampleResponse);
    const result = await runRgiWithLlm({
      item: { lineId: '3', description: 'Teclado USB', originCountry: 'CN', cifValue: 25 },
      candidates: [],
      notes: [],
      deepMode: false,
    });

    expect(mockGetLlmProvider).toHaveBeenCalledWith(undefined);
    expect(result.hsCode).toBe('8471.30.00.00');
  });

  it('enforces maxOutputTokens per mode, budgets legalNotes, and propagates tokenUsage', async () => {
    mockGenerateJson.mockImplementation(async (_prompt, _schema, opts) => {
      opts?.onUsage?.({ inputTokens: 3900, outputTokens: 850 });
      return sampleResponse;
    });

    const notes = Array.from({ length: 12 }, (_, idx) => ({
      ref: `Nota ${idx + 1}`,
      text: 'X'.repeat(1200),
    }));
    expect(budgetLegalNotes(notes, 3000)).toHaveLength(2);

    const runner = createRgiLlmRunner({ provider: 'openrouter', model: 'nvidia/nemotron-3.5-super-vl' });
    const std = await runner({
      item: { lineId: '4', description: 'Válvula industrial', originCountry: 'US', cifValue: 500 },
      candidates: [],
      notes,
      deepMode: false,
    });

    expect(mockGenerateJson.mock.calls[0][2]).toMatchObject({
      maxOutputTokens: MAX_OUTPUT_TOKENS_STANDARD,
    });
    expect(std.tokenUsage).toEqual({ inputTokens: 3900, outputTokens: 850 });

    await runner({
      item: { lineId: '5', description: 'Válvula industrial', originCountry: 'US', cifValue: 500 },
      candidates: [],
      notes,
      deepMode: true,
    });
    expect(mockGenerateJson.mock.calls[1][2]).toMatchObject({
      maxOutputTokens: MAX_OUTPUT_TOKENS_DEEP,
    });
  });

  it('forwards valid image data URLs as inline multimodal attachments without dumping base64 into prompt text', async () => {
    mockGenerateJson.mockResolvedValueOnce(sampleResponse);
    const pngDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB';
    const runner = createRgiLlmRunner({ provider: 'nvidia', model: 'nvidia/nemotron-3.5-super-vl-120b-a12b' });

    await runner({
      item: {
        lineId: 'img-1',
        description: 'Placa técnica de equipo',
        originCountry: 'CN',
        cifValue: 500,
        imageDataUrls: [pngDataUrl, 'invalid-url'],
      },
      candidates: [],
      notes: [],
      deepMode: false,
    });

    const [prompt, , callOpts] = mockGenerateJson.mock.calls[0] as [
      string,
      unknown,
      { attachments?: Array<{ type: string; dataUrl: string; mimeType: string }> },
    ];
    expect(prompt).not.toContain('iVBORw0KGgo');
    expect(prompt).toContain('"attachedImagesCount":1');
    expect(callOpts.attachments).toEqual([
      { type: 'inline', dataUrl: pngDataUrl, mimeType: 'image/png' },
    ]);
  });

  it('instructs the model with Venezuela Decreto 4.944 NCM rules and non-blocking compliance flags', async () => {
    mockGenerateJson.mockResolvedValueOnce(sampleResponse);

    const runner = createRgiLlmRunner({ provider: 'google', model: 'gemini-2.5-flash' });
    await runner({
      item: {
        lineId: '6',
        description: 'Compresor de aire de tornillo RTF-100 75 kW 8 bar',
        originCountry: 'CN',
        cifValue: 18500,
      },
      candidates: [],
      notes: [],
      deepMode: false,
    });

    const sentPrompt = String(mockGenerateJson.mock.calls[0][0]);
    expect(sentPrompt).toContain('Decreto 4.944');
    expect(sentPrompt).toContain('NCM');
    expect(sentPrompt).toContain('antidumping');
    expect(sentPrompt).toContain('unresolved');
    expect(sentPrompt).toContain('Spanish');
  });

  it('normalizes omitted or null optional array fields to empty arrays in RgiResponseSchema while rejecting invalid types', () => {
    const parsed = RgiResponseSchema.parse({
      hsCode: '9018.12.10.00',
      confidenceLevel: 'Medio',
      confidencePct: 75,
      confidenceReason: 'Ecógrafo Doppler con dos transductores.',
      rgiSteps: [],
      alternatives: null,
      rejected: undefined,
    });

    expect(parsed.alternatives).toEqual([]);
    expect(parsed.rejected).toEqual([]);
    expect(parsed.flags).toEqual([]);
    expect(parsed.unresolved).toEqual([]);

    expect(() =>
      RgiResponseSchema.parse({
        hsCode: '9018.12.10.00',
        confidenceLevel: 'Medio',
        confidencePct: 75,
        confidenceReason: 'Bad flags',
        rgiSteps: [],
        flags: 'invalid',
      }),
    ).toThrow();
  });
});
