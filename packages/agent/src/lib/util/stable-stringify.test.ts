import { describe, expect, it } from 'vitest';
import { stableStringify } from './stable-stringify.js';

describe('stableStringify', () => {
  it('serializes primitives', () => {
    expect(stableStringify(42)).toBe('42');
    expect(stableStringify('hello')).toBe('"hello"');
    expect(stableStringify(null)).toBe('null');
    expect(stableStringify(true)).toBe('true');
  });

  it('sorts object keys deterministically', () => {
    const obj1 = { b: 2, a: 1, c: 3 };
    const obj2 = { a: 1, c: 3, b: 2 };
    expect(stableStringify(obj1)).toBe(stableStringify(obj2));
    expect(stableStringify(obj1)).toBe('{"a":1,"b":2,"c":3}');
  });

  it('sorts nested object keys', () => {
    const obj1 = { outer: { z: 1, a: 2 } };
    const obj2 = { outer: { a: 2, z: 1 } };
    expect(stableStringify(obj1)).toBe(stableStringify(obj2));
  });

  it('preserves array order', () => {
    const arr = [3, 1, 2];
    expect(stableStringify(arr)).toBe('[3,1,2]');
  });

  it('sorts keys in arrays of objects', () => {
    const arr1 = [{ b: 1, a: 2 }];
    const arr2 = [{ a: 2, b: 1 }];
    expect(stableStringify(arr1)).toBe(stableStringify(arr2));
  });

  it('handles complex nested structures', () => {
    const obj1 = {
      questions: { final_code: { criteria: { '2106': 'a', '1901': 'b' } } },
      model: 'test',
    };
    const obj2 = {
      model: 'test',
      questions: { final_code: { criteria: { '1901': 'b', '2106': 'a' } } },
    };
    expect(stableStringify(obj1)).toBe(stableStringify(obj2));
  });
});
