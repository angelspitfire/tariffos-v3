-- Structured manifest lines per filing (demo-that-sells M0).
-- One row per invoice line: HS adjudication, Jev-style confidence +
-- candidates, triage status, CIF, tax breakdown, permits, RGI chain,
-- engine provenance. Tenant-isolated via RLS like every other table.

-- CreateEnum
CREATE TYPE "public"."FilingLineStatus" AS ENUM ('DRAFT', 'AUTO', 'CONFIRM', 'BLOCKED');

-- CreateTable
CREATE TABLE "public"."FilingLine" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "filing_id" TEXT NOT NULL,
    "line_number" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "hs_code" TEXT,
    "oma_code" TEXT,
    "confidence" DOUBLE PRECISION,
    "candidates" JSONB DEFAULT '[]',
    "status" "public"."FilingLineStatus" NOT NULL DEFAULT 'DRAFT',
    "cif_value" DOUBLE PRECISION,
    "tax_breakdown" JSONB,
    "permits" JSONB DEFAULT '[]',
    "rgi_steps" JSONB DEFAULT '[]',
    "engine_name" TEXT,
    "engine_version" TEXT,
    "corpus_version" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FilingLine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FilingLine_filing_id_line_number_key" ON "public"."FilingLine"("filing_id", "line_number");
CREATE INDEX "FilingLine_filing_id_idx" ON "public"."FilingLine"("filing_id");
CREATE INDEX "FilingLine_tenant_id_idx" ON "public"."FilingLine"("tenant_id");
CREATE INDEX "FilingLine_status_idx" ON "public"."FilingLine"("status");

-- AddForeignKey
ALTER TABLE "public"."FilingLine" ADD CONSTRAINT "FilingLine_filing_id_fkey" FOREIGN KEY ("filing_id") REFERENCES "public"."filings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."FilingLine" ADD CONSTRAINT "FilingLine_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Tenant isolation (repo convention: ENABLE + FORCE RLS, tenant_isolation_policy)
ALTER TABLE "public"."FilingLine" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."FilingLine" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON "public"."FilingLine";
CREATE POLICY tenant_isolation_policy ON "public"."FilingLine"
  AS PERMISSIVE FOR ALL
  USING (
    tenant_id = current_setting('app.current_tenant', true)
    OR current_setting('app.current_tenant', true) IS NULL
    OR current_setting('app.current_tenant', true) = ''
  );
