import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createRgiLlmRunner, runRgiWithLlm } from './rgi-llm-adapter.js';

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
});
