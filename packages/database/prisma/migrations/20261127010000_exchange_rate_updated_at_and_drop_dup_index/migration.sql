ALTER TABLE "public"."ExchangeRate"
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

DROP INDEX IF EXISTS "public"."ExchangeRate_pair_valueDate_idx";
