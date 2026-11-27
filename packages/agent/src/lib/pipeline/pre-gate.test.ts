import { describe, expect, it, vi } from 'vitest';
import type { DecisionProvider } from '../decision/provider.js';
import { runCompliancePreGate } from './pre-gate.js';

describe('runCompliancePreGate', () => {
  const item = {
    lineId: 'L1',
    description: 'Precursor químico industrial',
    originCountry: 'CN',
    cifValue: 1000,
  };

  it('passes through when provider is undefined or category is allowed', async () => {
    await expect(runCompliancePreGate(item, 'VE')).resolves.toMatchObject({
      blocked: false,
      category: 'allowed',
      flag: null,
    });

    const provider: DecisionProvider = {
      name: 'mock',
      classifyChoice: vi.fn().mockResolvedValue({ choice: 'allowed', confidence: 0.99 }),
    };
    await expect(runCompliancePreGate(item, 'VE', provider)).resolves.toMatchObject({
      blocked: false,
      category: 'allowed',
    });
  });

  it('blocks when prohibited/restricted confidence meets threshold and degrades safely on provider error', async () => {
    const blockingProvider: DecisionProvider = {
      name: 'mock',
      classifyChoice: vi.fn().mockResolvedValue({ choice: 'prohibited_tariff', confidence: 0.9 }),
    };
    const blocked = await runCompliancePreGate(item, 'VE', blockingProvider);
    expect(blocked.blocked).toBe(true);
    expect(blocked.flag?.type).toBe('blocking');

    const failingProvider: DecisionProvider = {
      name: 'mock',
      classifyChoice: vi.fn().mockRejectedValue(new Error('SDK timeout')),
    };
    await expect(runCompliancePreGate(item, 'VE', failingProvider)).resolves.toEqual({
      blocked: false,
      category: 'allowed',
      confidence: 0,
      flag: null,
    });
  });
});
