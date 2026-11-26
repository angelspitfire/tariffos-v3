import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LlmSettingsPanel } from './LlmSettingsPanel';

const samplePayload = {
  active: {
    provider: 'nvidia',
    model: 'nvidia/nemotron-3.5-super-vl-120b-a12b',
    deepModel: 'nvidia/nemotron-3-ultra-550b-a55b',
    canRunLive: true,
  },
  source: 'env',
  updatedAt: null,
  providers: [
    { provider: 'nvidia', configured: true, envVar: 'NVIDIA_API_KEY', defaultBaseUrl: 'https://integrate.api.nvidia.com/v1' },
    { provider: 'google', configured: true, envVar: 'GOOGLE_GENERATIVE_AI_API_KEY', defaultBaseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai' },
  ],
  presets: {
    nvidia: [{ id: 'nvidia/nemotron-3.5-super-vl-120b-a12b', label: 'Nemotron', tier: 'standard', note: '' }],
    google: [{ id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', tier: 'standard', note: '' }],
    openrouter: [],
    'openai-compatible': [],
  },
  envDefaults: { provider: 'nvidia', model: 'nvidia/nemotron-3.5-super-vl-120b-a12b' },
  embeddingLock: { model: 'text-embedding-3-small', dims: 768 },
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('LlmSettingsPanel', () => {
  it('loads settings, runs the model smoke test, and saves an override', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify(samplePayload), { status: 200 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true, latencyMs: 245 }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            ...samplePayload,
            source: 'database',
            active: { provider: 'google', model: 'gemini-2.5-flash', canRunLive: true },
          }),
          { status: 200 },
        ),
      );

    render(<LlmSettingsPanel />);
    await waitFor(() => expect(screen.getByDisplayValue('nvidia/nemotron-3.5-super-vl-120b-a12b')).toBeTruthy());

    fireEvent.change(screen.getByLabelText('Proveedor LLM'), { target: { value: 'google' } });
    fireEvent.click(screen.getByRole('button', { name: 'Probar modelo' }));
    await waitFor(() => expect(screen.getByText(/245 ms/)).toBeTruthy());

    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    await waitFor(() => expect(screen.getByText(/google\/gemini-2.5-flash/)).toBeTruthy());
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
