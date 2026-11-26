import { z } from 'zod';

export const SubscriptionStatusSchema = z.enum([
  'trial',
  'pending_payment',
  'active',
  'past_due',
  'suspended',
  'cancelled',
]);

export const SubscriptionBillingCycleSchema = z.enum(['monthly', 'annual', 'custom']);

export const ManualPaymentMethodSchema = z.enum([
  'transferencia_usd',
  'zelle',
  'pago_movil',
  'binance_pay',
  'transferencia_bs',
  'efectivo',
  'otro',
]);

export const ManualPaymentStatusSchema = z.enum([
  'pending_verification',
  'verified',
  'rejected',
]);

export const SubscriptionPlanConfigSchema = z.object({
  planId: z.string(),
  name: z.string(),
  description: z.string(),
  monthlyPriceUsd: z.number().nonnegative(),
  annualPriceUsd: z.number().nonnegative(),
  annualOnly: z.boolean().optional(),
  oneTimeOnly: z.boolean().optional(),
  customPricing: z.boolean().optional(),
  allowBatch: z.boolean().optional(),
  creditableDays: z.number().int().positive().optional(),
  maxUsers: z.number().int().positive().optional(),
  currency: z.enum(['USD', 'EUR']),
  monthlyQuota: z.number().int().nonnegative(),
  features: z.array(z.string()),
  paymentInstructions: z.string(),
  published: z.boolean(),
  sortOrder: z.number().int(),
});

export const ManualPaymentRecordSchema = z.object({
  paymentId: z.string(),
  userId: z.string(),
  tenantId: z.string(),
  userEmail: z.string(),
  companyName: z.string().optional(),
  planId: z.string(),
  planName: z.string(),
  billingCycle: SubscriptionBillingCycleSchema,
  monthsCovered: z.number().int().positive(),
  amount: z.number().positive(),
  currency: z.enum(['USD', 'EUR', 'VES']),
  method: ManualPaymentMethodSchema,
  referenceCode: z.string().min(2),
  paidAt: z.string(),
  status: ManualPaymentStatusSchema,
  receiptStorageKey: z.string().optional(),
  notes: z.string().optional(),
  verifiedBy: z.string().optional(),
  verifiedAt: z.string().optional(),
  rejectionReason: z.string().optional(),
});

export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>;
export type SubscriptionBillingCycle = z.infer<typeof SubscriptionBillingCycleSchema>;
export type ManualPaymentMethod = z.infer<typeof ManualPaymentMethodSchema>;
export type ManualPaymentStatus = z.infer<typeof ManualPaymentStatusSchema>;
export type SubscriptionPlanConfig = z.infer<typeof SubscriptionPlanConfigSchema>;
export type ManualPaymentRecord = z.infer<typeof ManualPaymentRecordSchema>;

export const DEFAULT_PAYMENT_INSTRUCTIONS = [
  '1. Transferencia / Zelle: solicita los datos de cuenta vigentes a soporte@tariffos.app indicando tu correo.',
  '2. Pago Móvil o Transferencia nacional (Bs.): adjunta el comprobante con referencia bancaria completa.',
  '3. Binance Pay (USDT): conserva el Order ID / TxID y repórtalo en el formulario.',
  'Activación verificada en menos de 24 horas hábiles.',
].join('\n');

export const SAAS_PLANS: readonly SubscriptionPlanConfig[] = [
  {
    planId: 'pilot',
    name: 'Piloto Operativo',
    description:
      'Prueba operativa con facturas reales en producción: 250 clasificaciones vitalicias, lotes Excel y dictámenes PDF firmables. 100% acreditable al Plan Agencia.',
    monthlyPriceUsd: 150,
    annualPriceUsd: 0,
    oneTimeOnly: true,
    allowBatch: true,
    creditableDays: 30,
    maxUsers: 2,
    currency: 'USD',
    monthlyQuota: 250,
    features: [
      '250 clasificaciones arancelarias completas (pago único · 30 días)',
      'Hasta 2 usuarios + carga masiva por lotes (Excel/CSV)',
      'Dictámenes técnicos PDF con cálculo tributario CIF y respaldo RGI',
      '100% acreditable al primer mes del Plan Agencia dentro de 30 días + 1 sesión de onboarding',
    ],
    paymentInstructions: DEFAULT_PAYMENT_INSTRUCTIONS,
    published: true,
    sortOrder: 1,
  },
  {
    planId: 'agencia',
    name: 'Agencia',
    description:
      'Estación operativa completa para agencias de aduanas activas con lotes Excel/CSV, catálogo SKU corporativo, calculadora CIF y dictámenes firmables.',
    monthlyPriceUsd: 300,
    annualPriceUsd: 3000,
    allowBatch: true,
    maxUsers: 5,
    currency: 'USD',
    monthlyQuota: 1000,
    features: [
      'Hasta 1,000 clasificaciones arancelarias por mes',
      'Hasta 5 usuarios con firma digital y patente aduanal',
      'Carga por lotes (Excel/CSV), triage de confianza y catálogo SKU corporativo',
      'Calculadora tributaria CIF oficial y dictámenes PDF firmables',
    ],
    paymentInstructions: DEFAULT_PAYMENT_INSTRUCTIONS,
    published: true,
    sortOrder: 2,
  },
  {
    planId: 'enterprise',
    name: 'Enterprise',
    description:
      'Para grandes agencias, navieras y corporativos multi-sucursal con alto volumen, carga inicial de catálogos SKU, integraciones y SLA dedicado.',
    monthlyPriceUsd: 0,
    annualPriceUsd: 0,
    customPricing: true,
    allowBatch: true,
    maxUsers: 25,
    currency: 'USD',
    monthlyQuota: 5000,
    features: [
      'Volumen mensual y usuarios a medida para grandes agencias y corporativos',
      'Multi-sucursal, multi-jurisdicción y carga inicial de catálogo SKU',
      'Auditoría tributaria completa, integraciones y SLA dedicado',
      'Acompañamiento técnico prioritario y onboarding corporativo',
    ],
    paymentInstructions:
      'Plan a medida. Solicita una cotización personalizada según tu volumen y sucursales.',
    published: true,
    sortOrder: 3,
  },
] as const;
