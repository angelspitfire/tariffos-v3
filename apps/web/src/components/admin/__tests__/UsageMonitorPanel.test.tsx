import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { UsageMonitorPanel } from '../organisms/UsageMonitorPanel';

describe('UsageMonitorPanel', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('displays tenant classification quota, token counters, and near-limit warning', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          rows: [
            {
              tenantId: 'ten-1',
              tenantName: 'Aduanas Alpha',
              ownerEmail: 'alpha@ve.com',
              planName: 'Pro',
              billingStatus: 'ACTIVE',
              used: 360,
              limit: 400,
              percentUsed: 90,
              nearLimit: true,
              inputTokens: 120000,
              outputTokens: 35000,
              avgTokensPerClassification: 431,
              estimatedCostUsd: 0.0345,
              activeBatchJobs: 1,
              failedBatchJobs: 0,
            },
          ],
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    render(<UsageMonitorPanel />);

    await waitFor(() => {
      expect(screen.getByText('Aduanas Alpha')).toBeInTheDocument();
    });
    expect(screen.getByText('90%')).toBeInTheDocument();
    expect(screen.getByText(/Cerca o sobre el límite/i)).toBeInTheDocument();
    expect(screen.getByText(/120,000/)).toBeInTheDocument();
    expect(screen.getByText(/\$0\.0345/)).toBeInTheDocument();
  });
});
