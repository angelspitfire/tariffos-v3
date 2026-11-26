import { describe, expect, it } from 'vitest';
import { chapterToSectionPath } from './hs-sections.js';

describe('chapterToSectionPath', () => {
  it('maps dotted and compact HS codes across all 22 sections', () => {
    expect(chapterToSectionPath('01')).toBe('SEC-I');
    expect(chapterToSectionPath('05')).toBe('SEC-I');
    expect(chapterToSectionPath('06')).toBe('SEC-II');
    expect(chapterToSectionPath('15')).toBe('SEC-III');
    expect(chapterToSectionPath('22')).toBe('SEC-IV');
    expect(chapterToSectionPath('27')).toBe('SEC-V');
    expect(chapterToSectionPath('30')).toBe('SEC-VI');
    expect(chapterToSectionPath('39')).toBe('SEC-VII');
    expect(chapterToSectionPath('42')).toBe('SEC-VIII');
    expect(chapterToSectionPath('44')).toBe('SEC-IX');
    expect(chapterToSectionPath('48')).toBe('SEC-X');
    expect(chapterToSectionPath('61')).toBe('SEC-XI');
    expect(chapterToSectionPath('64')).toBe('SEC-XII');
    expect(chapterToSectionPath('69')).toBe('SEC-XIII');
    expect(chapterToSectionPath('71')).toBe('SEC-XIV');
    expect(chapterToSectionPath('73')).toBe('SEC-XV');
    expect(chapterToSectionPath('8471.30.90.90')).toBe('SEC-XVI');
    expect(chapterToSectionPath('8501520000')).toBe('SEC-XVI');
    expect(chapterToSectionPath('87')).toBe('SEC-XVII');
    expect(chapterToSectionPath('90')).toBe('SEC-XVIII');
    expect(chapterToSectionPath('93')).toBe('SEC-XIX');
    expect(chapterToSectionPath('95')).toBe('SEC-XX');
    expect(chapterToSectionPath('97')).toBe('SEC-XXI');
    expect(chapterToSectionPath('98')).toBe('SEC-XXII');
  });

  it('returns null for empty, invalid, or out-of-range inputs', () => {
    expect(chapterToSectionPath('')).toBeNull();
    expect(chapterToSectionPath('abc')).toBeNull();
    expect(chapterToSectionPath('00')).toBeNull();
    expect(chapterToSectionPath('99')).toBeNull();
  });
});
