import { describe, expect, it } from 'vitest';
import { digits, formatCode, formatCodeLike } from './code.js';

describe('digits', () => {
  it('strips non-digits from dotted codes', () => {
    expect(digits('8517.62.41.00')).toBe('8517624100');
  });

  it('strips non-digits from undotted codes', () => {
    expect(digits('85176241')).toBe('85176241');
  });

  it('handles codes with spaces', () => {
    expect(digits('  2106.90.30  ')).toBe('21069030');
  });

  it('returns empty string for non-numeric input', () => {
    expect(digits('abc')).toBe('');
  });
});

describe('formatCode', () => {
  it('returns 4-digit codes unchanged', () => {
    expect(formatCode('8517')).toBe('8517');
  });

  it('dots longer codes as 4-digit prefix + pairs', () => {
    expect(formatCode('85176241')).toBe('8517.62.41');
  });

  it('dots 10-digit codes', () => {
    expect(formatCode('8517624100')).toBe('8517.62.41.00');
  });

  it('handles 6-digit codes', () => {
    expect(formatCode('210690')).toBe('2106.90');
  });

  it('handles irregular lengths', () => {
    expect(formatCode('2106903')).toBe('2106.90.3');
  });
});

describe('formatCodeLike', () => {
  it('is an alias for formatCode', () => {
    expect(formatCodeLike('85176241')).toBe(formatCode('85176241'));
  });
});
