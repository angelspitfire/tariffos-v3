import { z } from 'zod';

export const PermitStatusSchema = z.enum(['approved', 'pending', 'blocking']);
export type PermitStatus = z.infer<typeof PermitStatusSchema>;

export const RegulatoryAgencySchema = z.enum([
  'SENCAMER',
  'CONATEL',
  'ARCSA',
  'AGROCALIDAD',
  'MIPRO',
]);
export type RegulatoryAgency = z.infer<typeof RegulatoryAgencySchema>;

export const LinePermitSchema = z.object({
  id: z.string(),
  agency: RegulatoryAgencySchema,
  code: z.string(),
  name: z.string(),
  status: PermitStatusSchema,
  notes: z.string(),
  requiredDoc: z.string(),
});
export type LinePermit = z.infer<typeof LinePermitSchema>;

export const LineComplianceSchema = z.object({
  lineItemId: z.string(),
  itemNumber: z.number(),
  hsCode: z.string(),
  productDescription: z.string(),
  permits: z.array(LinePermitSchema),
  overallStatus: PermitStatusSchema,
});
export type LineCompliance = z.infer<typeof LineComplianceSchema>;

export const PermitsMatrixPayloadSchema = z.object({
  filingId: z.string(),
  filingStatus: PermitStatusSchema,
  totalPermits: z.number(),
  approvedCount: z.number(),
  pendingCount: z.number(),
  blockingCount: z.number(),
  lines: z.array(LineComplianceSchema),
});
export type PermitsMatrixPayload = z.infer<typeof PermitsMatrixPayloadSchema>;
