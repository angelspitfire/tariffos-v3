import { z } from 'zod';

export const ExonerationRegimeSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  description: z.string(),
  adValoremReliefRate: z.number(), // 1.0 = 100% relief, 0.5 = 50% relief
  fodinfaExempt: z.boolean().default(false),
  requiresOriginCert: z.boolean().default(true),
});

export type ExonerationRegime = z.infer<typeof ExonerationRegimeSchema>;

export const CurrencyRateSchema = z.object({
  code: z.string(),
  symbol: z.string(),
  rateToUsd: z.number(),
  label: z.string(),
});

export type CurrencyRate = z.infer<typeof CurrencyRateSchema>;

export const ExonerationSimulatorPayloadSchema = z.object({
  filingId: z.string(),
  cifUsd: z.number(),
  baseAdValoremRate: z.number(),
  vatRate: z.number(),
  fodinfaRate: z.number(),
  activeRegimeId: z.string(),
  regimes: z.array(ExonerationRegimeSchema),
  currencies: z.array(CurrencyRateSchema),
});

export type ExonerationSimulatorPayload = z.infer<typeof ExonerationSimulatorPayloadSchema>;
