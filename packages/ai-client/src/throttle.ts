/**
 * Request pacing for @tariffos/ai-client (F0).
 *
 * Spaces calls so a burst does not hammer the endpoint. The mechanism is
 * copied from the one agent already runs, renamed to the
 * provider-neutral `LLM_MAX_RPM`.
 *
 * Why it survives the migration: the original limit existed because the
 * free tier metered a small number of requests per day, and every retry of
 * a rate-limited call spends another slot of that same quota — a retry storm
 * burns the whole day's budget in minutes. The quota changes with the
 * provider; the storm does not.
 *
 * The state is module-level because the callers are different modules
 * (translation, classification prose, discriminators) and the budget they
 * share is one.
 */

/** Milliseconds in a minute, used to turn RPM into an interval. */
const MS_PER_MINUTE = 60_000;

/** Earliest timestamp at which the next call may go out. */
let nextAt = 0;

/**
 * The configured RPM limit. 0 or absent disables pacing, which is the
 * production default: a broker waiting seconds per line is worse than a
 * degraded justification.
 */
function maxRpm(): number {
  const raw = Number(process.env.LLM_MAX_RPM);
  return Number.isFinite(raw) && raw > 0 ? raw : 0;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Wait for this call's slot.
 *
 * Call it immediately before each request: scheduling at request time
 * (rather than at task start) is what keeps a batch of parallel lines from
 * collapsing back into a burst.
 */
export async function paceGenerateCall(): Promise<void> {
  const rpm = maxRpm();
  if (rpm === 0) return;
  const interval = Math.ceil(MS_PER_MINUTE / rpm);
  const now = Date.now();
  const at = Math.max(now, nextAt);
  nextAt = at + interval;
  if (at > now) await sleep(at - now);
}

/** Test hook — pacing state must not leak between cases. */
export function resetPacing(): void {
  nextAt = 0;
}
