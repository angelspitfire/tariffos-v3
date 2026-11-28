-- Multi-jurisdiction tariff effective duty, statistical unit, temporary exemption rules, and append-only audit metadata.
-- Idempotent and enforces RLS deny-by-default on public tables.

ALTER TABLE public."NationalTariff"
  ADD COLUMN IF NOT EXISTS "baseAdValorem" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "tariffExceptionCode" TEXT,
  ADD COLUMN IF NOT EXISTS "statisticalUnit" TEXT;

ALTER TABLE public."DecisionArtifact"
  ADD COLUMN IF NOT EXISTS "user_id" TEXT,
  ADD COLUMN IF NOT EXISTS "source_sha256" TEXT,
  ADD COLUMN IF NOT EXISTS "dataset_version" TEXT,
  ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 1;

CREATE TABLE IF NOT EXISTS public."TariffExemptionRule" (
  "id" TEXT NOT NULL,
  "countryCode" TEXT NOT NULL,
  "hsCode" TEXT NOT NULL,
  "programCode" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "decreeRef" TEXT NOT NULL,
  "gazetteRef" TEXT,
  "exemptAdValoremPct" DOUBLE PRECISION,
  "exemptVatPct" DOUBLE PRECISION,
  "requiredPermitCode" TEXT,
  "conditionsSummary" TEXT,
  "validFromDate" TIMESTAMP(3) NOT NULL,
  "validToDate" TIMESTAMP(3),
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "TariffExemptionRule_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "TariffExemptionRule_countryCode_fkey"
    FOREIGN KEY ("countryCode") REFERENCES public."Country"("code") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "TariffExemptionRule_countryCode_hsCode_programCode_key"
  ON public."TariffExemptionRule" ("countryCode", "hsCode", "programCode");

CREATE INDEX IF NOT EXISTS "TariffExemptionRule_countryCode_hsCode_isActive_idx"
  ON public."TariffExemptionRule" ("countryCode", "hsCode", "isActive");

CREATE INDEX IF NOT EXISTS "TariffExemptionRule_validToDate_idx"
  ON public."TariffExemptionRule" ("validToDate");

ALTER TABLE public."TariffExemptionRule" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."TariffExemptionRule" FROM anon, authenticated;
