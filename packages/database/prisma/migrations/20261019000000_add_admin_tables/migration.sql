-- Admin console: manual billing, system settings, webhooks
-- Written as idempotent SQL so it can be applied to the live InsForge Postgres
-- directly (the migration history there is not managed by `prisma migrate deploy`).

-- Enum: PaymentStatus
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentStatus') THEN
    CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED', 'REFUNDED');
  END IF;
END $$;

-- Plan.allowOverage
ALTER TABLE "Plan" ADD COLUMN IF NOT EXISTS "allowOverage" BOOLEAN NOT NULL DEFAULT false;

-- Payment
CREATE TABLE IF NOT EXISTS "Payment" (
  "id"         TEXT NOT NULL,
  "tenantId"   TEXT NOT NULL,
  "amount"     DOUBLE PRECISION NOT NULL,
  "currency"   TEXT NOT NULL DEFAULT 'USD',
  "method"     TEXT NOT NULL,
  "reference"  TEXT,
  "status"     "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "verifiedAt" TIMESTAMP(3),
  "verifiedBy" TEXT,
  "metadata"   JSONB,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Payment_tenantId_status_idx" ON "Payment"("tenantId", "status");
CREATE INDEX IF NOT EXISTS "Payment_tenantId_createdAt_idx" ON "Payment"("tenantId", "createdAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Payment_tenantId_fkey'
  ) THEN
    ALTER TABLE "Payment"
      ADD CONSTRAINT "Payment_tenantId_fkey"
      FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- SystemSetting
CREATE TABLE IF NOT EXISTS "SystemSetting" (
  "id"          TEXT NOT NULL,
  "key"         TEXT NOT NULL,
  "value"       TEXT NOT NULL,
  "description" TEXT,
  "type"        TEXT NOT NULL DEFAULT 'string',
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SystemSetting_key_key" ON "SystemSetting"("key");

-- Webhook
CREATE TABLE IF NOT EXISTS "Webhook" (
  "id"            TEXT NOT NULL,
  "name"          TEXT NOT NULL,
  "url"           TEXT NOT NULL,
  "events"        TEXT[],
  "secret"        TEXT NOT NULL,
  "isActive"      BOOLEAN NOT NULL DEFAULT true,
  "retryCount"    INTEGER NOT NULL DEFAULT 3,
  "lastTriggered" TIMESTAMP(3),
  "lastStatus"    INTEGER,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Webhook_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Webhook_isActive_idx" ON "Webhook"("isActive");

-- Relations used by the admin Legal Docs console
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'LegalDocumentChunk_resourceId_fkey'
  ) THEN
    ALTER TABLE "LegalDocumentChunk"
      ADD CONSTRAINT "LegalDocumentChunk_resourceId_fkey"
      FOREIGN KEY ("resourceId") REFERENCES "GlobalLegalResource"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'LegalKnowledgeParent_countryCode_fkey'
  ) THEN
    ALTER TABLE "LegalKnowledgeParent"
      ADD CONSTRAINT "LegalKnowledgeParent_countryCode_fkey"
      FOREIGN KEY ("countryCode") REFERENCES "Country"("code")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- Row Level Security: Payment is tenant-isolated; SystemSetting/Webhook are
-- readable only by the unscoped system connection.
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "payment_tenant_isolation_policy" ON "Payment";
CREATE POLICY "payment_tenant_isolation_policy" ON "Payment"
  USING (
    "tenantId" = current_setting('app.current_tenant', true)
    OR current_setting('app.current_tenant', true) IS NULL
    OR current_setting('app.current_tenant', true) = ''
  );

ALTER TABLE "SystemSetting" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SystemSetting" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "system_setting_admin_only_policy" ON "SystemSetting";
CREATE POLICY "system_setting_admin_only_policy" ON "SystemSetting"
  USING (
    current_setting('app.current_tenant', true) IS NULL
    OR current_setting('app.current_tenant', true) = ''
  );

ALTER TABLE "Webhook" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Webhook" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "webhook_admin_only_policy" ON "Webhook";
CREATE POLICY "webhook_admin_only_policy" ON "Webhook"
  USING (
    current_setting('app.current_tenant', true) IS NULL
    OR current_setting('app.current_tenant', true) = ''
  );

-- DML privileges for the application role (managed separately on InsForge,
-- where objects are created by the migration runner).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'tariffos_app') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON "Payment"       TO tariffos_app;
    GRANT SELECT, INSERT, UPDATE, DELETE ON "SystemSetting" TO tariffos_app;
    GRANT SELECT, INSERT, UPDATE, DELETE ON "Webhook"       TO tariffos_app;
    GRANT USAGE ON TYPE "PaymentStatus" TO tariffos_app;
  END IF;
END $$;

-- Seed common settings so the admin Settings page is not empty on first load.
INSERT INTO "SystemSetting" ("id", "key", "value", "description", "type", "createdAt", "updatedAt")
VALUES
  ('ss_support_email',     'support_email',     'support@tariffos.com', 'Public support contact shown in the app',       'string',  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('ss_billing_email',     'billing_email',     'billing@tariffos.com', 'Where manual payment receipts are sent',        'string',  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('ss_maintenance_mode',  'maintenance_mode',  'false',                'Block tenant access with a maintenance notice', 'boolean', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('ss_signup_enabled',    'signup_enabled',    'true',                 'Allow new tenant self-signup',                  'boolean', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('ss_grace_period_days', 'grace_period_days', '7',                    'Days before a PAST_DUE tenant is suspended',    'number',  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;
