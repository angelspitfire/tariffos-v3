import { typesafeProvider } from './typesafe-adapter.js';

export interface ComplianceChoicePrompt {
  state: Record<string, string | number | boolean | null>;
  prompt: string;
  categories: Record<string, string>;
}

export interface ComplianceChoiceAnswer {
  choice: string;
  confidence: number;
}

export interface DecisionProvider {
  readonly name: string;
  readonly classifyChoice: (input: ComplianceChoicePrompt) => Promise<ComplianceChoiceAnswer>;
}

/** Default hosted System One decision provider. */
export function defaultProvider(): DecisionProvider {
  return typesafeProvider();
}
