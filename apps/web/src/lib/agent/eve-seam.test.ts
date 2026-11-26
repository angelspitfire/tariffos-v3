import { afterEach, describe, expect, it } from 'vitest';
import { AgentReviewTriggerSchema } from '@tariffos/shared-types';
import {
  DEFAULT_ANTHROPIC_MODEL,
  parseEveModelSpec,
  resolveEveModel,
} from '../../../agent/model-resolver';
import requestDossierReviewTool, {
  executeRequestDossierReview,
  RequestDossierReviewInputSchema,
} from '../../../agent/tools/request_dossier_review';

describe('Eve swap-ready model resolver', () => {
  const originalEveModel = process.env.EVE_MODEL;

  afterEach(() => {
    if (originalEveModel === undefined) {
      delete process.env.EVE_MODEL;
    } else {
      process.env.EVE_MODEL = originalEveModel;
    }
  });

  it('defaults to Anthropic claude-sonnet-4 when EVE_MODEL is unset', () => {
    delete process.env.EVE_MODEL;
    expect(parseEveModelSpec()).toEqual({
      provider: 'anthropic',
      modelId: DEFAULT_ANTHROPIC_MODEL,
    });
    const model = resolveEveModel();
    expect(typeof model).toBe('object');
    if (typeof model !== 'string') {
      expect(model.modelId).toBe(DEFAULT_ANTHROPIC_MODEL);
      expect(model.provider.toLowerCase()).toContain('anthropic');
    }
  });

  it('resolves provider-prefixed OpenAI and Anthropic specs from EVE_MODEL', () => {
    process.env.EVE_MODEL = 'openai:gpt-4.1';
    expect(parseEveModelSpec()).toEqual({
      provider: 'openai',
      modelId: 'gpt-4.1',
    });
    const openaiModel = resolveEveModel();
    expect(typeof openaiModel).toBe('object');
    if (typeof openaiModel !== 'string') {
      expect(openaiModel.modelId).toBe('gpt-4.1');
      expect(openaiModel.provider.toLowerCase()).toContain('openai');
    }

    process.env.EVE_MODEL = 'anthropic:claude-opus-4';
    const anthropicModel = resolveEveModel();
    expect(typeof anthropicModel).toBe('object');
    if (typeof anthropicModel !== 'string') {
      expect(anthropicModel.modelId).toBe('claude-opus-4');
      expect(anthropicModel.provider.toLowerCase()).toContain('anthropic');
    }
  });

  it('treats bare model names as Anthropic and slash-qualified IDs as Vercel AI Gateway strings', () => {
    expect(parseEveModelSpec('claude-sonnet-4-5')).toEqual({
      provider: 'anthropic',
      modelId: 'claude-sonnet-4-5',
    });

    const gatewayModel = resolveEveModel('anthropic/claude-sonnet-4');
    expect(gatewayModel).toBe('anthropic/claude-sonnet-4');
  });

  it('resolves OpenRouter and NVIDIA Build specs from EVE_MODEL', () => {
    process.env.EVE_MODEL = 'openrouter:nvidia/nemotron-3.5-super-vl-120b-a12b';
    expect(parseEveModelSpec()).toEqual({
      provider: 'openrouter',
      modelId: 'nvidia/nemotron-3.5-super-vl-120b-a12b',
    });
    const openrouterModel = resolveEveModel();
    expect(typeof openrouterModel).toBe('object');
    if (typeof openrouterModel !== 'string') {
      expect(openrouterModel.modelId).toBe('nvidia/nemotron-3.5-super-vl-120b-a12b');
      expect(openrouterModel.provider.toLowerCase()).toContain('openrouter');
    }

    process.env.EVE_MODEL = 'nvidia:nvidia/nemotron-3.5-super-vl-120b-a12b';
    expect(parseEveModelSpec()).toEqual({
      provider: 'nvidia',
      modelId: 'nvidia/nemotron-3.5-super-vl-120b-a12b',
    });
    const nvidiaModel = resolveEveModel();
    expect(typeof nvidiaModel).toBe('object');
    if (typeof nvidiaModel !== 'string') {
      expect(nvidiaModel.modelId).toBe('nvidia/nemotron-3.5-super-vl-120b-a12b');
      expect(nvidiaModel.provider.toLowerCase()).toContain('nvidia');
    }
  });

  it('throws a clear error on unsupported provider prefixes', () => {
    expect(() => parseEveModelSpec('unsupported:foo-1')).toThrow(/Unsupported EVE_MODEL provider/);
  });
});

describe('Eve request_dossier_review tool', () => {
  it('returns a schema-valid AgentReviewTrigger with reviewStatus in_review', async () => {
    expect(requestDossierReviewTool.description).toContain('in_review');

    const parsedInput = RequestDossierReviewInputSchema.parse({
      hsCode: '8501.52.10.00',
      invokedBySkill: 'venezuela-tariff-classification',
      reason: 'Falta potencia nominal y certificado SENCAMER para confirmar subpartida.',
      missingFields: ['potencia_nominal_kw', 'numero_fases'],
    });

    const result = await executeRequestDossierReview(parsedInput);
    expect(result.reviewStatus).toBe('in_review');
    expect(result.hsCode).toBe('8501.52.10.00');

    const validatedTrigger = AgentReviewTriggerSchema.parse(result);
    expect(validatedTrigger.invokedBySkill).toBe('venezuela-tariff-classification');
    expect(validatedTrigger.missingFields).toEqual(['potencia_nominal_kw', 'numero_fases']);
  });
});
