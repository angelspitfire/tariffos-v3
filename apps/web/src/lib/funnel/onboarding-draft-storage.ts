import type {
  ApprovalWorkflowMode,
  IncotermCode,
  SubscriptionBillingCycle,
} from '@tariffos/shared-types';

const ONBOARDING_DRAFT_KEY = 'tariffos_onboarding_draft_v1';
const ONBOARDING_DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const DEFAULT_CUSTOMS_OFFICE = '5001 - LA GUAIRA';

export const VE_CUSTOMS_OFFICES: readonly string[] = [
  '5001 - LA GUAIRA',
  '5002 - MAIQUETÍA (AÉREA)',
  '5003 - PUERTO CABELLO',
  '5004 - MARACAIBO',
  '5005 - GUANTA / PUERTO LA CRUZ',
  '5006 - SAN ANTONIO DEL TÁCHIRA',
  '5007 - VALENCIA',
] as const;

export type OnboardingWizardStep = 1 | 2;

export interface OnboardingWizardDraft {
  userId?: string;
  currentStep: OnboardingWizardStep;
  fullName: string;
  role: string;
  companyName: string;
  brokerLicense: string;
  taxId?: string;
  defaultJurisdictionId: string;
  defaultCustomsOffice?: string;
  defaultIncoterm: IncotermCode;
  preferredCurrency: 'USD' | 'EUR';
  approvalWorkflowMode: ApprovalWorkflowMode;
  selectedPlanId: string;
  selectedBillingCycle: SubscriptionBillingCycle;
  updatedAt: string;
}

function getLocalStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function saveOnboardingDraft(draft: OnboardingWizardDraft): void {
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    storage.setItem(ONBOARDING_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Ignore storage quota or private-mode write failures.
  }
}

export function readOnboardingDraft(expectedUserId?: string): OnboardingWizardDraft | null {
  const storage = getLocalStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(ONBOARDING_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OnboardingWizardDraft & { currentStep?: number };
    const updatedTime = Date.parse(parsed.updatedAt ?? '');
    if (Number.isFinite(updatedTime) && Date.now() - updatedTime > ONBOARDING_DRAFT_TTL_MS) {
      storage.removeItem(ONBOARDING_DRAFT_KEY);
      return null;
    }
    if (expectedUserId && parsed.userId !== expectedUserId) {
      return null;
    }
    const clampedStep: OnboardingWizardStep =
      typeof parsed.currentStep === 'number' && parsed.currentStep >= 2 ? 2 : 1;
    return {
      ...parsed,
      currentStep: clampedStep,
    };
  } catch {
    return null;
  }
}

export function clearOnboardingDraft(): void {
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    storage.removeItem(ONBOARDING_DRAFT_KEY);
  } catch {
    // Ignore storage errors.
  }
}
