import type { GenerateCallOptions } from '../port.js';

/** Safely extracts token counts from AI SDK usage objects across versions. */
export function reportCallUsage(
  rawUsage: unknown,
  onUsage?: GenerateCallOptions['onUsage'],
): void {
  if (!onUsage || !rawUsage || typeof rawUsage !== 'object') return;
  const u = rawUsage as Record<string, unknown>;
  const inputRaw = u.inputTokens ?? u.promptTokens;
  const outputRaw = u.outputTokens ?? u.completionTokens;
  const inputTokens = typeof inputRaw === 'number' && Number.isFinite(inputRaw) ? Math.max(0, Math.round(inputRaw)) : 0;
  const outputTokens = typeof outputRaw === 'number' && Number.isFinite(outputRaw) ? Math.max(0, Math.round(outputRaw)) : 0;
  if (inputTokens > 0 || outputTokens > 0) {
    onUsage({ inputTokens, outputTokens });
  }
}