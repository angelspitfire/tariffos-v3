'use client';

import { renderGenerativeUI } from '@assistant-ui/react-generative-ui';
import { library } from '@/lib/generative-ui-library';

export interface GenerativeUIRendererProps {
  display: unknown;
}

export function GenerativeUIRenderer({ display }: GenerativeUIRendererProps) {
  return renderGenerativeUI(display, library, { status: 'done' });
}
