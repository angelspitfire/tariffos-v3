import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendChatRequest } from './chat-api-client';

describe('chat-api-client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('throws error when response is not ok', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    await expect(sendChatRequest([])).rejects.toThrow('HTTP 500');
  });

  it('throws error when response body is null', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      body: null,
    });

    await expect(sendChatRequest([])).rejects.toThrow('Empty response body');
  });
});
