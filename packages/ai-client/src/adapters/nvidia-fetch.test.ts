import { describe, expect, it, vi } from 'vitest';
import { createNvidiaTransportFetch } from './nvidia-fetch.js';

describe('createNvidiaTransportFetch', () => {
  it('injects input_type: query into /embeddings requests when absent', async () => {
    const baseFetch = vi.fn<typeof fetch>().mockResolvedValue(new Response('{}', { status: 200 }));
    const wrapped = createNvidiaTransportFetch(baseFetch);

    await wrapped('https://integrate.api.nvidia.com/v1/embeddings', {
      method: 'POST',
      body: JSON.stringify({ model: 'nvidia/nemotron-3.5-embed-1b', input: 'laptop' }),
    });

    const sentBody = JSON.parse(String(baseFetch.mock.calls[0]?.[1]?.body)) as Record<string, unknown>;
    expect(sentBody.input_type).toBe('query');
  });

  it('injects chat_template_kwargs.enable_thinking=false on /chat/completions when absent', async () => {
    const baseFetch = vi.fn<typeof fetch>().mockResolvedValue(new Response('{}', { status: 200 }));
    const wrapped = createNvidiaTransportFetch(baseFetch);

    await wrapped('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      body: JSON.stringify({ model: 'nvidia/nemotron-3.5-super-vl-120b-a12b', messages: [] }),
    });

    const sentBody = JSON.parse(String(baseFetch.mock.calls[0]?.[1]?.body)) as {
      chat_template_kwargs?: { enable_thinking?: boolean };
    };
    expect(sentBody.chat_template_kwargs).toEqual({ enable_thinking: false });
  });
});
