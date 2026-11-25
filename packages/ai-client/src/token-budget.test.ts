import { describe, it, expect } from 'vitest';
import { TokenBudgetTracker, defaultBudget } from './token-budget.js';

describe('TokenBudgetTracker', () => {
  it('starts with zero usage and reports remaining equal to budget', () => {
    const tracker = new TokenBudgetTracker();
    const snap = tracker.snapshot();
    expect(snap.used).toEqual({ inputTokens: 0, outputTokens: 0, totalTokens: 0 });
    expect(snap.remaining).toEqual({
      inputTokens: snap.budget.maxInputTokens,
      outputTokens: snap.budget.maxOutputTokens,
      totalTokens: snap.budget.maxTotalTokens,
    });
    expect(snap.exhausted).toBe(false);
  });

  it('records usage and reduces remaining', () => {
    const tracker = new TokenBudgetTracker();
    tracker.record({ inputTokens: 100, outputTokens: 50, totalTokens: 150 });
    const snap = tracker.snapshot();
    expect(snap.used).toEqual({ inputTokens: 100, outputTokens: 50, totalTokens: 150 });
    expect(snap.remaining.inputTokens).toBe(snap.budget.maxInputTokens - 100);
    expect(snap.remaining.outputTokens).toBe(snap.budget.maxOutputTokens - 50);
    expect(snap.remaining.totalTokens).toBe(snap.budget.maxTotalTokens - 150);
  });

  it('reports exhausted when total exceeds budget', () => {
    const tracker = new TokenBudgetTracker({
      maxInputTokens: 100,
      maxOutputTokens: 100,
      maxTotalTokens: 150,
    });
    tracker.record({ inputTokens: 80, outputTokens: 80, totalTokens: 160 });
    expect(tracker.snapshot().exhausted).toBe(true);
  });

  it('canAfford returns false when a call would exceed budget', () => {
    const tracker = new TokenBudgetTracker({
      maxInputTokens: 100,
      maxOutputTokens: 100,
      maxTotalTokens: 150,
    });
    tracker.record({ inputTokens: 90, outputTokens: 0, totalTokens: 90 });
    expect(tracker.canAfford({ inputTokens: 20, outputTokens: 0, totalTokens: 20 })).toBe(false);
    expect(tracker.canAfford({ inputTokens: 5, outputTokens: 0, totalTokens: 5 })).toBe(true);
  });

  it('defaultBudget returns positive finite values', () => {
    const b = defaultBudget();
    expect(b.maxInputTokens).toBeGreaterThan(0);
    expect(b.maxOutputTokens).toBeGreaterThan(0);
    expect(b.maxTotalTokens).toBeGreaterThan(0);
  });

  it('reset clears all counters', () => {
    const tracker = new TokenBudgetTracker();
    tracker.record({ inputTokens: 500, outputTokens: 300, totalTokens: 800 });
    tracker.reset();
    const snap = tracker.snapshot();
    expect(snap.used).toEqual({ inputTokens: 0, outputTokens: 0, totalTokens: 0 });
    expect(snap.exhausted).toBe(false);
  });
});
