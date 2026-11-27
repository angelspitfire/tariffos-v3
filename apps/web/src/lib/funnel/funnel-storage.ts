import type {
  ApprovalWorkflowMode,
  IncotermCode,
  SubscriptionBillingCycle,
} from '@tariffos/shared-types';
import { JURISDICTIONS } from '@/lib/workspace/jurisdictions';

export {
  clearOnboardingDraft,
  DEFAULT_CUSTOMS_OFFICE,
  readOnboardingDraft,
  saveOnboardingDraft,
  VE_CUSTOMS_OFFICES,
  type OnboardingWizardDraft,
  type OnboardingWizardStep,
} from './onboarding-draft-storage';

const LEGACY_PENDING_QUERY_KEY = 'tariffos_pending_query';
const PENDING_QUERY_KEY = 'tariffos_pending_query_v1';
const PENDING_QUERY_KEYS = [LEGACY_PENDING_QUERY_KEY, PENDING_QUERY_KEY] as const;
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
  role?: string;
  brokerLicense?: string;
  taxId?: string;
  companyName: string;
  defaultJurisdictionId: string;
  defaultCustomsOffice?: string;
  defaultIncoterm: IncotermCode;
  preferredCurrency: 'USD' | 'EUR';
  approvalWorkflowMode: ApprovalWorkflowMode;
  selectedPlanId: string;
  selectedBillingCycle: SubscriptionBillingCycle;
  onboardingCompleted: boolean;
}

export interface FunnelJurisdictionOption {
  id: string;
  countryCode: string;
  country: string;
  authority: string;
  nomenclature: string;
  liveInCloud: boolean;
}

export const FUNNEL_JURISDICTIONS: readonly FunnelJurisdictionOption[] = JURISDICTIONS.map((jur) => ({
  id: jur.id,
  countryCode: jur.countryCode,
  country: jur.country,
  authority: jur.authority,
  nomenclature: jur.nomenclature,
  liveInCloud: Boolean(jur.pilot),
}));

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
    for (const key of PENDING_QUERY_KEYS) {
      removeKey('session', key);
      removeKey('local', key);
    }
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
    for (const key of PENDING_QUERY_KEYS) {
      const value = session?.getItem(key) ?? local?.getItem(key);
      if (value && value.trim().length > 0) return value.trim();
    }
    return null;
  } catch {
    return null;
  }
}

export function consumePendingQuery(): string | null {
  const value = readPendingQuery();
  for (const key of PENDING_QUERY_KEYS) {
    removeKey('session', key);
    removeKey('local', key);
  }
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
