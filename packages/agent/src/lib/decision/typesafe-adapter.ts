import { choice, TypeSafeClient } from '@typesafe-ai/sdk';
import type {
  ComplianceChoiceAnswer,
  ComplianceChoicePrompt,
  DecisionProvider,
} from './provider.js';

/** TypeSafe Jev decision provider — encapsulates `@typesafe-ai/sdk`. */
function createTypesafeProvider(): DecisionProvider {
  let client: TypeSafeClient | null = null;

  function getClient(): TypeSafeClient {
    if (!client) {
      const apiKey = process.env.TYPESAFE_API_KEY;
      if (!apiKey) {
        throw new Error(
          'TYPESAFE_API_KEY is not set. Populate it in .env.local — TypeSafe judgments refuse to run without a key.',
        );
      }
      client = new TypeSafeClient({ apiKey });
    }
    return client;
  }

  const classifyChoice = async (
    input: ComplianceChoicePrompt,
  ): Promise<ComplianceChoiceAnswer> => {
    const result = await getClient().systemOne({
      state: input.state,
      questions: {
        classification: choice(input.prompt, input.categories),
      },
    });
    const answer = result.answers.classification as
      | { choice?: string; confidence?: number }
      | undefined;
    return {
      choice: answer?.choice ?? 'allowed',
      confidence: typeof answer?.confidence === 'number' ? answer.confidence : 0,
    };
  };

  return {
    name: 'typesafe-jev',
    classifyChoice,
  };
}

let cached: DecisionProvider | null = null;

export function typesafeProvider(): DecisionProvider {
  if (!cached) {
    cached = createTypesafeProvider();
  }
  return cached;
}
