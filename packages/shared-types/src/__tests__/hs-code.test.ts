import { describe, expect, it } from 'vitest';
import { extractHsDigits, formatHsCode } from '../hs-code.js';

describe('extractHsDigits', () => {
  it('strips dots, spaces, and non-digit characters', () => {
    expect(extractHsDigits('8471.30.90.90')).toBe('8471309090');
    expect(extractHsDigits(' 8517-62 4100 ')).toBe('8517624100');
  });
});

describe('formatHsCode', () => {
  it('keeps 4-digit headings without dots', () => {
    expect(formatHsCode('8471')).toBe('8471');
  });

  it('formats 6, 8, and 10 digit codes with dots in 4+2+2+2 groups', () => {
    expect(formatHsCode('847130')).toBe('8471.30');
    expect(formatHsCode('84713090')).toBe('8471.30.90');
    expect(formatHsCode('8471309090')).toBe('8471.30.90.90');
    expect(formatHsCode('2106903')).toBe('2106.90.3');
  });

  it('is idempotent on already dotted codes and trims whitespace', () => {
    expect(formatHsCode(' 8471.30.90.90 ')).toBe('8471.30.90.90');
    expect(formatHsCode('8504.40.90.00')).toBe('8504.40.90.00');
  });

  it('returns trimmed input when fewer than 4 digits are present', () => {
    expect(formatHsCode(' 84 ')).toBe('84');
    expect(formatHsCode('')).toBe('');
  });
});
