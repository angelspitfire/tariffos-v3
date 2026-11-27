import { z } from 'zod';
import { ApprovalWorkflowModeSchema, IncotermCodeSchema } from '@tariffos/shared-types';

export function isBootstrapAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const raw = process.env.PLATFORM_ADMIN_EMAILS ?? '';
  if (!raw.trim()) return false;
  const normalized = email.trim().toLowerCase();
  return raw
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .some((entry) => entry.length > 0 && entry === normalized);
}

export const ExpressOnboardingSchema = z.object({
  fullName: z.string().trim().min(2, 'Nombre completo requerido.'),
  companyName: z.string().trim().min(2, 'Nombre de empresa o agencia requerido.'),
  role: z.string().trim().min(2).default('Agente Aduanal'),
  brokerLicense: z.string().trim().optional().default(''),
  taxId: z.string().trim().optional(),
  countryCode: z.string().trim().length(2).default('VE'),
  defaultCustomsOffice: z.string().trim().optional(),
  defaultIncoterm: IncotermCodeSchema.default('FOB'),
  preferredCurrency: z.enum(['USD', 'EUR']).default('USD'),
  approvalWorkflowMode: ApprovalWorkflowModeSchema.default('agent_decides'),
  selectedPlanId: z.string().trim().min(1).default('pilot'),
  selectedBillingCycle: z.enum(['monthly', 'annual', 'custom']).default('monthly'),
});

export type ExpressOnboardingInput = z.infer<typeof ExpressOnboardingSchema>;
