import { describe, expect, it } from 'vitest';
import { createReadOnlyDemoThread, READONLY_DEMO_THREAD_ID } from './demo-readonly-thread';

describe('createReadOnlyDemoThread', () => {
  it('builds a static zero-AI demo dossier thread for read-only exploration', () => {
    const thread = createReadOnlyDemoThread();
    expect(thread.id).toBe(READONLY_DEMO_THREAD_ID);
    expect(thread.jurisdictionId).toBe('ve-seniat');
    expect(thread.messages.length).toBeGreaterThanOrEqual(2);

    const assistantMsg = thread.messages.find((m) => m.role === 'assistant');
    expect(assistantMsg?.envelope?.classificationStatus).toBe('classified');
    expect(assistantMsg?.envelope?.canvasComponents.some((c) => c.type === 'dossier')).toBe(true);
    expect(assistantMsg?.envelope?.canvasComponents.some((c) => c.type === 'calculator')).toBe(true);
  });
});
