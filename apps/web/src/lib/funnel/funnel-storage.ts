import type {
  ApprovalWorkflowMode,
  IncotermCode,
  SubscriptionBillingCycle,
} from '@tariffos/shared-types';

const PENDING_QUERY_KEY = 'tariffos_pending_query_v1';
const SELECTED_PLAN_KEY = 'tariffos_selected_plan_v1';
const MOCK_SESSION_KEY = 'tariffos_mock_session_v1';
const MOCK_PROFILE_KEY = 'tariffos_mock_profile_v1';

export interface SelectedPlanPreference {
  planId: string;
  billingCycle: SubscriptionBillingCycle;
}

export interface FunnelMockUser {
  userId: string;
  email: string;
  fullName: string;
  provider: 'email' | 'google' | 'local';
}

export interface OnboardingProfileDraft {
  fullName: string;
  companyName: string;
  defaultJurisdictionId: string;
  defaultIncoterm: IncotermCode;
  preferredCurrency: 'USD' | 'EUR';
  approvalWorkflowMode: ApprovalWorkflowMode;
  selectedPlanId: string;
  selectedBillingCycle: SubscriptionBillingCycle;
  onboardingCompleted: boolean;
}

export interface FunnelJurisdictionOption {
  id: string;
  country: string;
  authority: string;
  nomenclature: string;
}

export const FUNNEL_JURISDICTIONS: readonly FunnelJurisdictionOption[] = [
  {
    id: 've-seniat',
    country: 'Venezuela',
    authority: 'SENIAT',
    nomenclature: 'NCM 10 dígitos · Consolidado 2026 (Decreto 4.944 / 5.198)',
  },
  {
    id: 'co-dian',
    country: 'Colombia',
    authority: 'DIAN',
    nomenclature: 'NANDINA 10 dígitos',
  },
  {
    id: 'pa-ana',
    country: 'Panamá',
    authority: 'ANA',
    nomenclature: 'SA 12 dígitos',
  },
  {
    id: 'mx-sat',
    country: 'México',
    authority: 'SAT / ANAM',
    nomenclature: 'LIGIE + NICO 10 dígitos',
  },
] as const;

function getStorage(kind: 'local' | 'session'): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return kind === 'session' ? window.sessionStorage : window.localStorage;
  } catch {
    return null;
  }
}

function readJson<T>(kind: 'local' | 'session', key: string): T | null {
  const storage = getStorage(kind);
  if (!storage) return null;
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(kind: 'local' | 'session', key: string, value: unknown): void {
  const storage = getStorage(kind);
  if (!storage) return;
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota or private-mode write failures.
  }
}

function removeKey(kind: 'local' | 'session', key: string): void {
  const storage = getStorage(kind);
  if (!storage) return;
  try {
    storage.removeItem(key);
  } catch {
    // Ignore storage errors.
  }
}

export function savePendingQuery(query: string): void {
  const trimmed = query.trim();
  if (!trimmed) {
    removeKey('session', PENDING_QUERY_KEY);
    removeKey('local', PENDING_QUERY_KEY);
    return;
  }
  const session = getStorage('session');
  const local = getStorage('local');
  try {
    session?.setItem(PENDING_QUERY_KEY, trimmed);
    local?.setItem(PENDING_QUERY_KEY, trimmed);
  } catch {
    // Ignore storage errors.
  }
}

export function readPendingQuery(): string | null {
  const session = getStorage('session');
  const local = getStorage('local');
  try {
    return session?.getItem(PENDING_QUERY_KEY) ?? local?.getItem(PENDING_QUERY_KEY) ?? null;
  } catch {
    return null;
  }
}

export function consumePendingQuery(): string | null {
  const value = readPendingQuery();
  removeKey('session', PENDING_QUERY_KEY);
  removeKey('local', PENDING_QUERY_KEY);
  return value;
}

export function saveSelectedPlan(
  planId: string,
  billingCycle: SubscriptionBillingCycle,
): void {
  writeJson('local', SELECTED_PLAN_KEY, { planId, billingCycle });
}

export function readSelectedPlan(): SelectedPlanPreference | null {
  return readJson<SelectedPlanPreference>('local', SELECTED_PLAN_KEY);
}

export function clearSelectedPlan(): void {
  removeKey('local', SELECTED_PLAN_KEY);
}

export function saveMockSession(user: FunnelMockUser): void {
  writeJson('local', MOCK_SESSION_KEY, user);
}

export const saveFunnelSession = saveMockSession;

export function readMockSession(): FunnelMockUser | null {
  return readJson<FunnelMockUser>('local', MOCK_SESSION_KEY);
}

export function clearMockSession(): void {
  removeKey('local', MOCK_SESSION_KEY);
}

export function saveMockProfile(profile: OnboardingProfileDraft): void {
  writeJson('local', MOCK_PROFILE_KEY, profile);
}

export function readMockProfile(): OnboardingProfileDraft | null {
  return readJson<OnboardingProfileDraft>('local', MOCK_PROFILE_KEY);
}
