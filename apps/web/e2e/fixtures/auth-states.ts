export interface E2ECredentials {
  email: string;
  password: string;
}

export function getOptionalE2ECredentials(): E2ECredentials | null {
  const email = process.env.E2E_BROKER_EMAIL?.trim();
  const password = process.env.E2E_BROKER_PASSWORD?.trim();
  if (!email || !password) return null;
  return { email, password };
}

export function isRemotePreviewTarget(): boolean {
  return Boolean(process.env.PLAYWRIGHT_BASE_URL?.trim());
}
