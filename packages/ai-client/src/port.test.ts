import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  EmbeddingDimensionMismatchError,
  SchemaViolationError,
  validateJson,
  type EmbedCallOptions,
  type GenerateCallOptions,
} from './port.js';

describe('options', () => {
  it('leaves the model optional so adapters can fall back to their default', () => {
    const opts: GenerateCallOptions = { temperature: 0.4 };
    expect(opts.model).toBeUndefined();
  });

  it('leaves the embedding width optional but declares it in the contract', () => {
    const opts: EmbedCallOptions = { model: 'text-embedding-3-small' };
    expect(opts.dims).toBeUndefined();
  });
});

describe('SchemaViolationError', () => {
  it('carries readable issues', () => {
    const err = new SchemaViolationError(['field.name: expected string']);
    expect(err.name).toBe('SchemaViolationError');
    expect(err.issues).toEqual(['field.name: expected string']);
    expect(err.message).toContain('field.name: expected string');
  });

  it('keeps the raw preview out of the issue list', () => {
    const err = new SchemaViolationError(['bad'], '{"partial":');
    expect(err.issues).toEqual(['bad']);
    expect(err.message).toContain('{"partial":');
  });
});

describe('EmbeddingDimensionMismatchError', () => {
  it('reports both widths', () => {
    const err = new EmbeddingDimensionMismatchError(768, 1536);
    expect(err.expected).toBe(768);
    expect(err.actual).toBe(1536);
    expect(err.message).toContain('768');
    expect(err.message).toContain('1536');
  });

  it('is not a schema violation: it is a contract violation', () => {
    const err = new EmbeddingDimensionMismatchError(768, 1536);
    expect(err).not.toBeInstanceOf(SchemaViolationError);
  });
});

describe('validateJson', () => {
  const schema = z.object({ name: z.string() });

  it('returns the parsed payload when it satisfies the schema', () => {
    expect(validateJson('{"name":"tariff"}', schema)).toEqual({ name: 'tariff' });
  });

  it('throws SchemaViolationError on malformed JSON', () => {
    expect(() => validateJson('not json at all', schema)).toThrow(SchemaViolationError);
  });

  it('throws SchemaViolationError when the payload does not satisfy the schema', () => {
    expect(() => validateJson('{"age":30}', schema)).toThrow(SchemaViolationError);
  });

  it('throws SchemaViolationError on an empty response', () => {
    expect(() => validateJson('   ', schema)).toThrow(SchemaViolationError);
  });

  it('reports the offending path in the issues', () => {
    try {
      validateJson('{"name":42}', schema);
      expect.unreachable('validateJson should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(SchemaViolationError);
      const issues = (err as SchemaViolationError).issues;
      expect(issues.length).toBeGreaterThan(0);
      expect(issues.join(' ')).toContain('name');
    }
  });
});
