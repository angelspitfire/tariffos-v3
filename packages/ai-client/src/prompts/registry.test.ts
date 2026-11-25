import { describe, it, expect } from 'vitest';
import { getPrompt, renderPrompt, listPrompts } from './registry.js';

describe('prompt registry', () => {
  it('returns the decision prompt by name', () => {
    const def = getPrompt('decision.final_code');
    expect(def.version).toBe('1.0.0');
    expect(def.text).toContain('tariff subheading');
    expect(def.variables).toEqual([]);
  });

  it('renders variables in the prose prompt', () => {
    const rendered = renderPrompt('prose.justification', {
      product: 'aluminum charger',
      hsCode: '8504.40.10.00',
      hsDescription: 'Static converters',
      claims: 'Claim 1: input voltage matches',
    });
    expect(rendered).toContain('aluminum charger');
    expect(rendered).toContain('8504.40.10.00');
    expect(rendered).toContain('Static converters');
    expect(rendered).toContain('Claim 1: input voltage matches');
  });

  it('throws on unknown prompt name', () => {
    expect(() => getPrompt('does.not.exist')).toThrow(/Unknown prompt/);
  });

  it('lists all prompts with versions', () => {
    const list = listPrompts();
    expect(list.length).toBeGreaterThan(0);
    for (const item of list) {
      expect(item.name).toBeTruthy();
      expect(item.version).toMatch(/^\d+\.\d+\.\d+$/);
      expect(item.description).toBeTruthy();
    }
    expect(list.some((p) => p.name === 'decision.final_code')).toBe(true);
    expect(list.some((p) => p.name === 'prose.justification')).toBe(true);
  });
});
