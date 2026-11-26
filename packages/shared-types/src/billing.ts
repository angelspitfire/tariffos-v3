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
    planId: 'trial',
    name: 'Trial / Piloto',
    description:
      'Prueba guiada del motor de clasificación arancelaria RGI con ficha merceológica HITL y dictamen PDF.',
    monthlyPriceUsd: 0,
    annualPriceUsd: 0,
    maxUsers: 1,
    currency: 'USD',
    monthlyQuota: 5,
    features: [
      'Hasta 5 clasificaciones completas de prueba',
      'Ficha merceológica con validación HITL guiada',
      'Dictamen técnico PDF con desglose tributario',
    ],
    paymentInstructions: 'Plan gratuito de evaluación inicial (5 clasificaciones).',
    published: true,
    sortOrder: 1,
  },
  {
    planId: 'basico',
    name: 'Básico',
    description:
      'Para operadores independientes e importadores ocasionales que buscan dictámenes confiables con respaldo RGI.',
    monthlyPriceUsd: 49,
    annualPriceUsd: 490,
    maxUsers: 1,
    currency: 'USD',
    monthlyQuota: 40,
    features: [
      'Hasta 40 clasificaciones arancelarias por mes',
      '1 operador con firma digital en dictámenes PDF',
      'Calculadora tributaria oficial y trazabilidad RGI',
      'Historial de expedientes y exportación técnica',
    ],
    paymentInstructions: DEFAULT_PAYMENT_INSTRUCTIONS,
    published: true,
    sortOrder: 2,
  },
  {
    planId: 'pro',
    name: 'Pro',
    description:
      'Para agentes aduanales y analistas activos con carga por lotes, catálogo SKU y alertas normativas.',
    monthlyPriceUsd: 299,
    annualPriceUsd: 2990,
    maxUsers: 3,
    currency: 'USD',
    monthlyQuota: 400,
    features: [
      'Hasta 400 clasificaciones arancelarias por mes',
      'Procesamiento batch por lotes (Excel/CSV) y triage de confianza',
      'Catálogo corporativo SKU y comparador RGI',
      'Hasta 3 usuarios + alertas normativas prioritarias',
    ],
    paymentInstructions: DEFAULT_PAYMENT_INSTRUCTIONS,
    published: true,
    sortOrder: 3,
  },
  {
    planId: 'enterprise',
    name: 'Enterprise',
    description:
      'Para agencias de aduanas multi-equipo con alto volumen, múltiples jurisdicciones y auditoría completa.',
    monthlyPriceUsd: 449,
    annualPriceUsd: 4490,
    maxUsers: 10,
    currency: 'USD',
    monthlyQuota: 1500,
    features: [
      'Hasta 1,500 clasificaciones arancelarias por mes',
      'Hasta 10 usuarios con multi-jurisdicción y decretos oficiales',
      'Auditoría tributaria completa y reportes ejecutivos',
      'Soporte técnico prioritario y validación acelerada',
    ],
    paymentInstructions: DEFAULT_PAYMENT_INSTRUCTIONS,
    published: true,
    sortOrder: 4,
  },
  {
    planId: 'corporate',
    name: 'Corporate',
    description:
      'Licencia anual para grandes agencias, navieras y corporativos con volumen masivo y acompañamiento dedicado.',
    monthlyPriceUsd: 0,
    annualPriceUsd: 5900,
    annualOnly: true,
    maxUsers: 25,
    currency: 'USD',
    monthlyQuota: 5000,
    features: [
      'Hasta 5,000 clasificaciones/mes (escalable a medida)',
      'Hasta 25 usuarios, multi-sucursal y SLA dedicado',
      'Onboarding asistido y carga inicial de catálogo SKU',
      'Facturación anual corporativa (equiv. $492/mes)',
    ],
    paymentInstructions: DEFAULT_PAYMENT_INSTRUCTIONS,
    published: true,
    sortOrder: 5,
  },
] as const;
