/**
 * Token budget tracker for AI calls.
 *
 * Tracks input and output tokens per model per operation so a single eval run
 * or production session can't silently exhaust a free-tier daily quota.
 * Budgets are read from env at call time, never cached at module load.
 */

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface TokenBudget {
  maxInputTokens: number;
  maxOutputTokens: number;
  maxTotalTokens: number;
}

export interface BudgetSnapshot {
  used: TokenUsage;
  budget: TokenBudget;
  remaining: TokenUsage;
  exhausted: boolean;
}

/**
 * Default budgets — generous for production, tight for eval runs.
 * Override via env: AI_MAX_INPUT_TOKENS, AI_MAX_OUTPUT_TOKENS, AI_MAX_TOTAL_TOKENS
 */
export function defaultBudget(): TokenBudget {
  return {
    maxInputTokens: Number(process.env.AI_MAX_INPUT_TOKENS ?? 50_000),
    maxOutputTokens: Number(process.env.AI_MAX_OUTPUT_TOKENS ?? 20_000),
    maxTotalTokens: Number(process.env.AI_MAX_TOTAL_TOKENS ?? 60_000),
  };
}

/**
 * TokenBudgetTracker accumulates usage across calls in a process and can
 * report whether the budget is exhausted. One instance per process/run.
 */
export class TokenBudgetTracker {
  private used = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };

  constructor(private readonly budget: TokenBudget = defaultBudget()) {}

  /** Record usage from a completed call. */
  record(usage: TokenUsage): void {
    this.used.inputTokens += usage.inputTokens;
    this.used.outputTokens += usage.outputTokens;
    this.used.totalTokens += usage.totalTokens;
  }

  /** Current snapshot of usage vs budget. */
  snapshot(): BudgetSnapshot {
    const used = { ...this.used };
    return {
      used,
      budget: this.budget,
      remaining: {
        inputTokens: Math.max(0, this.budget.maxInputTokens - used.inputTokens),
        outputTokens: Math.max(0, this.budget.maxOutputTokens - used.outputTokens),
        totalTokens: Math.max(0, this.budget.maxTotalTokens - used.totalTokens),
      },
      exhausted:
        used.inputTokens >= this.budget.maxInputTokens ||
        used.outputTokens >= this.budget.maxOutputTokens ||
        used.totalTokens >= this.budget.maxTotalTokens,
    };
  }

  /** Check if recording more would exceed the budget (before making a call). */
  canAfford(estimated: TokenUsage): boolean {
    return (
      this.used.inputTokens + estimated.inputTokens <= this.budget.maxInputTokens &&
      this.used.outputTokens + estimated.outputTokens <= this.budget.maxOutputTokens &&
      this.used.totalTokens + estimated.totalTokens <= this.budget.maxTotalTokens
    );
  }

  /** Reset counters (test hook). */
  reset(): void {
    this.used = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
  }
}

/** Global default tracker — imported by modules that need budget awareness. */
export const defaultTracker = new TokenBudgetTracker();