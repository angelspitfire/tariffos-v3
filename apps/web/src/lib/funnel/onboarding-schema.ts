import { z } from 'zod';
import { ApprovalWorkflowModeSchema, IncotermCodeSchema } from '@tariffos/shared-types';
export { isBootstrapAdminEmail } from '@/lib/admin/super-admin';

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
