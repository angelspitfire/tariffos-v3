import { afterEach, describe, expect, it } from 'vitest';
import { DEFAULT_RGI_DEEP_MODEL, DEFAULT_RGI_MODEL, rgiModel } from './index.js';
import { restoreEnv, stubEnv } from './stub-env.js';

afterEach(restoreEnv);

describe('rgiModel', () => {
  it('defaults the standard model to Nemotron 3.5 Super VL', () => {
    stubEnv({ RGI_MODEL: undefined, LLM_MODEL: undefined });
    expect(rgiModel(false)).toBe('nvidia/nemotron-3.5-super-vl-120b-a12b');
    expect(DEFAULT_RGI_MODEL).toBe('nvidia/nemotron-3.5-super-vl-120b-a12b');
  });

  it('defaults the deep model to Nemotron 3 Ultra', () => {
    stubEnv({ RGI_DEEP_MODEL: undefined, RGI_MODEL: undefined });
    expect(rgiModel(true)).toBe('nvidia/nemotron-3-ultra-550b-a55b');
    expect(DEFAULT_RGI_DEEP_MODEL).toBe('nvidia/nemotron-3-ultra-550b-a55b');
  });

  it('honours RGI_MODEL for the standard path', () => {
    stubEnv({ RGI_MODEL: ' gemini-2.5-flash ' });
    expect(rgiModel(false)).toBe('gemini-2.5-flash');
  });

  it('honours RGI_DEEP_MODEL for the deep path', () => {
    stubEnv({ RGI_DEEP_MODEL: 'gemini-2.5-pro' });
    expect(rgiModel(true)).toBe('gemini-2.5-pro');
  });

  it('deep mode falls back to RGI_MODEL when no deep model is set', () => {
    stubEnv({ RGI_DEEP_MODEL: undefined, RGI_MODEL: 'gemini-2.5-flash' });
    expect(rgiModel(true)).toBe('gemini-2.5-flash');
  });

  it('treats a blank value as unset', () => {
    stubEnv({ RGI_MODEL: '   ' });
    expect(rgiModel(false)).toBe(DEFAULT_RGI_MODEL);
  });
});
