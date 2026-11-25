import type { GenerativeUIComponent } from '@assistant-ui/react-generative-ui';
import type { ReactNode } from 'react';
import { z } from 'zod';

export function component<P extends object>(
  description: string,
  properties: z.ZodType<P>,
  render: (props: P) => ReactNode,
): GenerativeUIComponent {
  return {
    description,
    properties,
    streamProperties: false,
    render: (raw: unknown) => render(raw as unknown as P),
  };
}
