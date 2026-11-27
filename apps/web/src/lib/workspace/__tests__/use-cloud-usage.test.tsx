// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import {
  resetCloudUsageCacheForTests,
  useCloudUsageSnapshot,
  useCloudUsageState,
} from '../use-cloud-usage';

vi.mock('@/lib/runtime-config', () => ({
  isCloudModeEnabled: () => true,
}));

function BothUsageConsumers() {
  const { usage, loaded } = useCloudUsageState();
  const snapshot = useCloudUsageSnapshot();
  return (
    <div>
      <span data-testid="loaded">{String(loaded)}</span>
      <span data-testid="plan-state">{usage?.planId ?? 'none'}</span>
      <span data-testid="plan-snap">{snapshot?.planId ?? 'none'}</span>
    </div>
  );
}

describe('useCloudUsageState shared request cache', () => {
  beforeEach(() => {
    resetCloudUsageCacheForTests();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    resetCloudUsageCacheForTests();
  });

  it('deduplicates concurrent /api/usage/current requests across shell and header consumers', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        usage: {
          tenantId: 't-1',
          tenantName: 'Agencia Demo',
          planId: 'pilot',
          planName: 'Piloto Operativo',
          billingStatus: 'ACTIVE',
          allowOverage: false,
          month: 11,
          year: 2026,
          used: 2,
          limit: 100,
          percentUsed: 2,
          inputTokens: 0,
          outputTokens: 0,
        },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<BothUsageConsumers />);

    await waitFor(() => {
      expect(screen.getByTestId('loaded').textContent).toBe('true');
    });
    expect(screen.getByTestId('plan-state').textContent).toBe('pilot');
    expect(screen.getByTestId('plan-snap').textContent).toBe('pilot');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
