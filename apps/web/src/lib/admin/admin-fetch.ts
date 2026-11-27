/** Typed JSON fetch helper for admin panels that throws server error messages cleanly. */
export async function adminFetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const payload = (await res.json().catch(() => null)) as ({ error?: string } & T) | null;
  if (!res.ok) {
    throw new Error(payload?.error || `Error HTTP ${res.status}`);
  }
  if (payload === null) {
    throw new Error('Respuesta vacía del servidor.');
  }
  return payload;
}
