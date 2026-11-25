import { choice } from '@typesafe-ai/sdk';
import type { ComplianceFlag } from '@tariffos/shared-types';
import type { DecisionProvider } from '../decision/provider.js';
import type { InvoiceItemInput } from './types.js';

export interface PreGateResult {
  blocked: boolean;
  category: string;
  confidence: number;
  flag: ComplianceFlag | null;
}

const PROHIBITED_CATEGORIES: Record<string, string> = {
  allowed: 'Normal commercial goods with no apparent import prohibition or dual-use restriction.',
  prohibited_tariff: 'Goods explicitly prohibited from import in the national tariff (e.g., narcotics, illicit weapons, counterfeit currency, hazardous waste).',
  restricted_dual_use: 'Controlled precursors, explosives, military/dual-use equipment, or sanctioned strategic goods requiring special state authorization.',
};

const PRE_GATE_CONFIDENCE_THRESHOLD = 0.75;

/**
 * Fast System One compliance pre-gate run before RGI reasoning.
 * Flags prohibited or restricted goods early to avoid wasted LLM compute.
 */
export async function runCompliancePreGate(
  item: InvoiceItemInput,
  countryCode: string,
  provider?: DecisionProvider,
): Promise<PreGateResult> {
  if (!provider) {
    return { blocked: false, category: 'allowed', confidence: 1, flag: null };
  }

  try {
    const result = await provider.systemOne({
      state: {
        product: item.description,
        origin: item.originCountry,
        jurisdiction: countryCode,
      },
      questions: {
        compliance_status: choice(
          'Classify whether this merchandise falls under prohibited or restricted import categories before tariff classification.',
          PROHIBITED_CATEGORIES,
        ),
      },
    });

    const answer = result.answers.compliance_status as
      | { choice?: string; confidence?: number }
      | undefined;
    const picked = answer?.choice ?? 'allowed';
    const confidence = typeof answer?.confidence === 'number' ? answer.confidence : 0;

    const blocked =
      picked !== 'allowed' && confidence >= PRE_GATE_CONFIDENCE_THRESHOLD;

    if (!blocked) {
      return { blocked: false, category: picked, confidence, flag: null };
    }

    return {
      blocked: true,
      category: picked,
      confidence,
      flag: {
        type: 'blocking',
        title: `Pre-Gate Compliance (${picked})`,
        text: `Item flagged before RGI classification with ${(confidence * 100).toFixed(0)}% confidence. Requires mandatory legal/OGA verification against national tariff prohibitions.`,
      },
    };
  } catch {
    return { blocked: false, category: 'allowed', confidence: 0, flag: null };
  }
}
