/**
 * IDecisionModel - Port for the decision model (System 1: Laya/TypeSafe).
 * Uses SystemOne wire protocol. Two adapters: TypeSafeAdapter + LayaAdapter.
 * 
 * @package apps/agent/src/domain/ports
 * @layer Domain Port
 */
export interface DecisionRequest {
  state: {
    product: string;
    broker_note?: string;
  };
  questions: {
    final_code: ChoiceQuestion;
    gri_rule: ChoiceQuestion;
  };
  model: string;
}

export interface ChoiceQuestion {
  instruction: string;
  options: Record<string, string>;  // code -> description
}

export interface DecisionResponse {
  answers: {
    final_code: ChoiceAnswer;
    gri_rule: ChoiceAnswer;
  };
  probabilities: Record<string, number>;  // code -> probability
  confidence: number;                     // margin-over-uniform (0-1)
  metadata: {
    model: string;
    latencyMs: number;
    tokensUsed?: number;
  };
}

export interface ChoiceAnswer {
  choice: string;           // Selected code
  probability: number;      // Model probability for this choice
}

export interface IDecisionModel {
  /** 
   * Ask the decision model to choose from a ballot of HS codes.
   * Uses the SystemOne wire protocol.
   */
  chooseBallot(request: DecisionRequest): Promise<DecisionResponse>;
}

/** 
 * Adapter implementations (both implement IDecisionModel):
 * - TypeSafeAdapter: calls hosted TypeSafe/Jev endpoint (HTTPS)
 * - LayaAdapter: calls local Laya server (HTTP, same SystemOne protocol)
 * Both are swapped via `DecisionProvider` factory — the ONLY real seam.
 */
export type DecisionAdapter = 'TypeSafeAdapter' | 'LayaAdapter';

export interface DecisionProviderConfig {
  adapter: DecisionAdapter;
  typeSafeEndpoint?: string;
  layaEndpoint?: string;
  timeoutMs: number;
  maxRetries: number;
}