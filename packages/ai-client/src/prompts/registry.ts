/**
 * Versioned prompt registry.
 *
 * Every prompt sent to a model is registered here with a semantic version.
 * Train data and inference must never drift — fine-tuned checkpoints (e.g.
 * the Laya `tariff` checkpoint) were fine-tuned on exact instruction text, so
 * both sides import from here rather than restating prompts inline.
 *
 * Changing a prompt bumps its version and invalidates any cached results
 * keyed on the old prompt text.
 */

export interface PromptDef {
  /** Semantic version, e.g. '1.0.0'. Bump on any wording change. */
  version: string;
  /** Human-readable description of what the prompt does. */
  description: string;
  /** The exact prompt text sent to the model. */
  text: string;
  /** Variables the caller interpolates, e.g. {product, hsCode}. */
  variables: string[];
}

/** All registered prompts, keyed by name. */
export const PROMPTS: Record<string, PromptDef> = {
  /**
   * Decision instruction for the `final_code` choice question.
   * Fine-tuned into the Laya `tariff` checkpoint — do not reword without
   * retraining.
   */
  'decision.final_code': {
    version: '1.0.0',
    description:
      'Asks the decision model to pick the precise tariff subheading for a product.',
    text: 'Which tariff subheading precisely covers the product?',
    variables: [],
  },

  /**
   * GRI rule selection question, asked in parallel with the code choice.
   */
  'decision.gri_rule': {
    version: '1.0.0',
    description:
      'Asks which WCO General Rule of Interpretation governs the classification.',
    text:
      'Which WCO General Rule of Interpretation (1, 3b, 3c, or 6) governs this classification?',
    variables: [],
  },

  /**
   * Prose justification: technical English + colloquial Spanish.
   */
  'prose.justification': {
    version: '1.0.0',
    description:
      'Renders the two-sentence justification (technical EN, colloquial ES) for a decided line.',
    text: `You are a customs-broker aide. Product: "{{product}}". Assigned subheading: {{hsCode}} ({{hsDescription}}). Claims to defend:\n{{claims}} Return JSON {"technical": "<2 sentences English>", "colloquial": "<2 sentences Spanish>"}.`,
    variables: ['product', 'hsCode', 'hsDescription', 'claims'],
  },

  /**
   * Nomenclature question synthesis: one Socratic question for competing codes.
   */
  'discriminator.nomenclature': {
    version: '1.0.0',
    description:
      'Synthesizes one short plain-language question that competing tariff options answer completely.',
    text: `You are a customs broker expert assisting in tariff classification. Product: "{{productDescription}}". These candidate tariff subheadings are nearly tied: {{options}} Write ONE short question in Spanish and English: a plain-language "¿Qué es el producto?" choice the options below answer completely. Every option must be one possible answer to that exact question. NEVER quote legal text or use customs jargon. Return JSON strictly as: {"question_es": "...", "question_en": "...", "labels": [{"es": "...", "en": "..."}]}.`,
    variables: ['productDescription', 'options'],
  },
};

/** Look up a prompt by name and return its definition. */
export function getPrompt(name: string): PromptDef {
  const def = PROMPTS[name];
  if (!def) throw new Error(`Unknown prompt: ${name}`);
  return def;
}

/** Render a prompt by interpolating its variables. Variables are replaced as {{var}}. */
export function renderPrompt(name: string, values: Record<string, string>): string {
  const def = getPrompt(name);
  let text = def.text;
  for (const [key, value] of Object.entries(values)) {
    text = text.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), value);
  }
  return text;
}

/** List all registered prompts with versions (for audit / cache invalidation). */
export function listPrompts(): Array<{ name: string; version: string; description: string }> {
  return Object.entries(PROMPTS).map(([name, def]) => ({
    name,
    version: def.version,
    description: def.description,
  }));
}
