import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AiQualityInspector } from './AiQualityInspector';

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('AiQualityInspector', () => {
  it('renders model stats, artifact rows, and opens the detail drawer on click', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            artifacts: [
              {
                id: 'art-1',
                classificationId: 'cls-1',
                tenantId: 'ten-1',
                tenantName: 'Agencia Demo',
                query: 'Motor trifásico 5HP',
                hsCode: '8501.52.10.00',
                officialDescription: 'Motores polifásicos',
                modelUsed: 'gemini-2.5-flash',
                provider: 'google',
                tierUsed: 'tier2_rgi_llm',
                confidencePct: 91,
                confidenceLevel: 'Alto',
                verifiedAgainstDb: true,
                flagCount: 0,
                createdAt: '2026-11-26T00:00:00Z',
              },
            ],
            modelStats: [
              {
                model: 'gemini-2.5-flash',
                provider: 'google',
                count: 1,
                avgConfidencePct: 91,
                verifiedRatePct: 100,
              },
            ],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            artifact: {
              id: 'art-1',
              classificationId: 'cls-1',
              tenantId: 'ten-1',
              tenantName: 'Agencia Demo',
              filingId: null,
              lineId: 'l-1',
              query: 'Motor trifásico 5HP',
              hsCode: '8501.52.10.00',
              officialDescription: 'Motores polifásicos',
              modelUsed: 'gemini-2.5-flash',
              provider: 'google',
              tierUsed: 'tier2_rgi_llm',
              confidencePct: 91,
              confidenceLevel: 'Alto',
              verifiedAgainstDb: true,
              flagCount: 0,
              createdAt: '2026-11-26T00:00:00Z',
              retrievalTrace: {},
              promptSnapshot: {},
              modelMetadata: { provider: 'google' },
              rerankingScores: {},
              sustento: { rgiSteps: [{ rule: 'RGI 1', conclusion: 'Partida 8501' }], flags: [] },
              finalDecision: { hsCode: '8501.52.10.00' },
            },
          }),
          { status: 200 },
        ),
      );

    render(<AiQualityInspector />);
    await waitFor(() => expect(screen.getByText('Motor trifásico 5HP')).toBeTruthy());
    fireEvent.click(screen.getByText('Motor trifásico 5HP'));
    await waitFor(() => expect(screen.getByText('Partida 8501')).toBeTruthy());
  });
});
