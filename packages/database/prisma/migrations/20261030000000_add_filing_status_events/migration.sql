-- Filing status audit trail (workflow integrity, plan item #11).
--
-- `Filing.status` is a plain text column that the app used to write directly
-- (any string, no history). This table makes every status change attributable:
-- the API writes one row here in the same transaction as the `filings` update,
-- so an unattributed jump is impossible.
--
--   from_status  the raw value that was stored ("Draft", "In progress", …)
--   to_status    the canonical status the state machine moved to
--
-- Append-only: rows are never updated or deleted, except by the cascade when
-- the filing itself is deleted.

CREATE TABLE IF NOT EXISTS "public"."filing_status_events" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "filing_id" TEXT NOT NULL,
    "from_status" TEXT,
    "to_status" TEXT NOT NULL,
    "user_id" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "filing_status_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "filing_status_events_filing_id_created_at_idx"
  ON "public"."filing_status_events"("filing_id", "created_at");
CREATE INDEX IF NOT EXISTS "filing_status_events_tenant_id_idx"
  ON "public"."filing_status_events"("tenant_id");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'filing_status_events_filing_id_fkey'
  ) THEN
    ALTER TABLE "public"."filing_status_events"
      ADD CONSTRAINT "filing_status_events_filing_id_fkey"
      FOREIGN KEY ("filing_id") REFERENCES "public"."filings"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'filing_status_events_tenant_id_fkey'
  ) THEN
    ALTER TABLE "public"."filing_status_events"
      ADD CONSTRAINT "filing_status_events_tenant_id_fkey"
      FOREIGN KEY ("tenant_id") REFERENCES "public"."Tenant"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Tenant isolation (repo convention: ENABLE + FORCE RLS, tenant_isolation_policy)
ALTER TABLE "public"."filing_status_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."filing_status_events" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON "public"."filing_status_events";
CREATE POLICY tenant_isolation_policy ON "public"."filing_status_events"
  AS PERMISSIVE FOR ALL
  USING (
    tenant_id = current_setting('app.current_tenant', true)
    OR current_setting('app.current_tenant', true) IS NULL
    OR current_setting('app.current_tenant', true) = ''
  );
