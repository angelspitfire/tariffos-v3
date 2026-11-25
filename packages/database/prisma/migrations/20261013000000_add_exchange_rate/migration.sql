-- Fina borrowings workstream D: central USD→Bs. exchange rate (BCV reference).
-- Global table: every tenant reads the same latest row (open RLS read); rows
-- are written only by the sync-bcv-rate Inngest cron via the system client.
CREATE TABLE "ExchangeRate" (
    "id" TEXT NOT NULL,
    "pair" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "valueDate" TIMESTAMP(3) NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExchangeRate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ExchangeRate_pair_valueDate_key" ON "ExchangeRate"("pair", "valueDate");
CREATE INDEX "ExchangeRate_pair_valueDate_idx" ON "ExchangeRate"("pair", "valueDate");

ALTER TABLE "ExchangeRate" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ExchangeRate" FORCE ROW LEVEL SECURITY;
CREATE POLICY public_read ON "ExchangeRate" USING (true) WITH CHECK (true);
