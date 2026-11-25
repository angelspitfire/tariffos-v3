/**
 * Wraps a promise with a hard timeout. Rejects with a TimeoutError when the
 * deadline passes, and aborts the underlying signal if provided.
 */

export class TimeoutError extends Error {
  constructor(public readonly operation: string, public readonly timeoutMs: number) {
    super(`${operation} timed out after ${timeoutMs}ms`);
    this.name = 'TimeoutError';
  }
}

/**
 * Race `promise` against a timeout. On timeout, abort the controller (if any)
 * and reject with TimeoutError. The promise may continue running in the
 * background but its result is discarded.
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  operation: string,
): Promise<T> {
  let rejectTimeout: (reason: Error) => void = () => {};
  const timeout = new Promise<never>((_, reject) => {
    rejectTimeout = reject;
  });
  const timeoutHandle = setTimeout(() => {
    rejectTimeout(new TimeoutError(operation, timeoutMs));
  }, timeoutMs);

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timeoutHandle);
  }
}
