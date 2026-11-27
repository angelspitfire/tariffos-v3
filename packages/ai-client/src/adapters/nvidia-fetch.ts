/**
 * Transport-level fetch wrapper for NVIDIA Build (NIM):
 * - Injects `input_type` ("query" | "passage") on `/embeddings` requests.
 * - Injects `chat_template_kwargs.enable_thinking = false` on `/chat/completions`
 *   unless explicitly overridden, preventing unbounded thinking stalls.
 */
export function createNvidiaTransportFetch(baseFetch?: typeof fetch): typeof fetch {
  return async (input, init) => {
    const targetFetch = baseFetch ?? globalThis.fetch;
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    if (typeof init?.body === 'string') {
      try {
        const parsed = JSON.parse(init.body) as Record<string, unknown>;
        let modified = false;
        if (url.includes('/embeddings') && !parsed.input_type) {
          parsed.input_type = 'query';
          modified = true;
        } else if (url.includes('/chat/completions') && parsed.chat_template_kwargs === undefined) {
          parsed.chat_template_kwargs = { enable_thinking: false };
          modified = true;
        }
        if (modified) {
          return targetFetch(input, { ...init, body: JSON.stringify(parsed) });
        }
      } catch {
        // Fall through with original request if body is not JSON.
      }
    }
    return targetFetch(input, init);
  };
}
