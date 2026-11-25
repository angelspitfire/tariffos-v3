export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogFields = Record<string, unknown>;

const LEVELS: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

function threshold(): number {
  const raw = (process.env.LOG_LEVEL ?? '').trim().toLowerCase();
  return (LEVELS[raw as LogLevel] ?? LEVELS.info);
}

/** Errors become {name, message} so one JSON.stringify never throws. */
export function serializeError(err: unknown): LogFields {
  if (err instanceof Error) return { name: err.name, message: err.message };
  return { message: String(err) };
}

/**
 * One JSON object per line: `{ level, ts, msg, ...bindings, ...fields }`.
 * Dependency-free; a greppable `sessionId` on hot-path lines is the point
 * (refinement-plan §2.4).
 */
export class Logger {
  constructor(private readonly bindings: LogFields = {}) {}

  /** A logger that stamps every line with the given fields. */
  child(bindings: LogFields): Logger {
    return new Logger({ ...this.bindings, ...bindings });
  }

  write(level: LogLevel, msg: string, fields?: LogFields): void {
    if (LEVELS[level] < threshold()) return;
    const line = JSON.stringify({
      level,
      ts: new Date().toISOString(),
      ...this.bindings,
      ...fields,
      msg,
    });
    if (level === 'error' || level === 'warn') process.stderr.write(line + '\n');
    else process.stdout.write(line + '\n');
  }

  debug(msg: string, fields?: LogFields): void {
    this.write('debug', msg, fields);
  }

  info(msg: string, fields?: LogFields): void {
    this.write('info', msg, fields);
  }

  warn(msg: string, fields?: LogFields): void {
    this.write('warn', msg, fields);
  }

  error(msg: string, fields?: LogFields): void {
    this.write('error', msg, fields);
  }
}

/** Shared root logger; use child() to bind sessionId/tenantId per request. */
export const logger = new Logger();
