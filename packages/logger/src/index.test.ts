import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Logger, logger, serializeError } from './index.js';

let out: string[] = [];
let err: string[] = [];
const realLog = process.stdout.write;
const realErr = process.stderr.write;

beforeEach(() => {
  out = [];
  err = [];
  process.stdout.write = ((chunk: string) => {
    out.push(chunk);
    return true;
  }) as typeof process.stdout.write;
  process.stderr.write = ((chunk: string) => {
    err.push(chunk);
    return true;
  }) as typeof process.stderr.write;
});

afterEach(() => {
  process.stdout.write = realLog;
  process.stderr.write = realErr;
  delete process.env.LOG_LEVEL;
});

function lastLine(chunks: string[]): Record<string, unknown> {
  return JSON.parse(chunks[chunks.length - 1]);
}

describe('logger', () => {
  it('writes one JSON object per line with level, ts and msg', () => {
    logger.info('classification.started', { sessionId: 's-1' });
    const line = lastLine(out);
    expect(line.level).toBe('info');
    expect(line.msg).toBe('classification.started');
    expect(line.sessionId).toBe('s-1');
    expect(typeof line.ts).toBe('string');
    expect(out[0].endsWith('\n')).toBe(true);
  });

  it('merges child bindings into every line', () => {
    const child = logger.child({ sessionId: 's-2', tenantId: 't-1' });
    child.error('boom', { err: serializeError(new Error('nope')) });
    const line = lastLine(err);
    expect(line.sessionId).toBe('s-2');
    expect(line.tenantId).toBe('t-1');
    expect(line.err).toEqual({ name: 'Error', message: 'nope' });
  });

  it('routes warn and error to stderr, info and debug to stdout', () => {
    process.env.LOG_LEVEL = 'debug';
    logger.warn('w');
    logger.debug('d');
    expect(err).toHaveLength(1);
    expect(out).toHaveLength(1);
  });

  it('drops lines below LOG_LEVEL', () => {
    process.env.LOG_LEVEL = 'warn';
    logger.info('quiet');
    logger.error('loud');
    expect(out).toHaveLength(0);
    expect(err).toHaveLength(1);
  });

  it('defaults to info when LOG_LEVEL is unset or invalid', () => {
    logger.debug('hidden');
    expect(out).toHaveLength(0);
    process.env.LOG_LEVEL = 'nonsense';
    logger.debug('still hidden');
    logger.info('visible');
    expect(out).toHaveLength(1);
    expect(lastLine(out).msg).toBe('visible');
    delete process.env.LOG_LEVEL;
  });

  it('child bindings override parent bindings', () => {
    const parent = new Logger({ sessionId: 'parent' });
    const child = parent.child({ sessionId: 'child' });
    child.info('x');
    expect(lastLine(out).sessionId).toBe('child');
  });
});

describe('serializeError', () => {
  it('keeps name and message from Error instances', () => {
    expect(serializeError(new TypeError('bad'))).toEqual({ name: 'TypeError', message: 'bad' });
  });

  it('stringifies anything else', () => {
    expect(serializeError('plain')).toEqual({ message: 'plain' });
    expect(serializeError(42)).toEqual({ message: '42' });
  });
});
