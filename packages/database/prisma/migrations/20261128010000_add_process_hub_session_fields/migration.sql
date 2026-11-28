-- Process Hub lifecycle fields and lightweight operator metadata on ClassificationSession.
-- Idempotent and preserves RLS deny-by-default on public tables.

ALTER TABLE public."ClassificationSession"
  ADD COLUMN IF NOT EXISTS "process_kind" TEXT NOT NULL DEFAULT 'single_ruling',
  ADD COLUMN IF NOT EXISTS "operational_status" TEXT NOT NULL DEFAULT 'processing',
  ADD COLUMN IF NOT EXISTS "client_ref" TEXT,
  ADD COLUMN IF NOT EXISTS "primary_hs_code" TEXT,
  ADD COLUMN IF NOT EXISTS "item_progress" JSONB,
  ADD COLUMN IF NOT EXISTS "created_by_user_id" TEXT,
  ADD COLUMN IF NOT EXISTS "assigned_to_user_id" TEXT;

CREATE INDEX IF NOT EXISTS "ClassificationSession_tenant_id_operational_status_updatedAt_idx"
  ON public."ClassificationSession" ("tenant_id", "operational_status", "updatedAt" DESC);

CREATE INDEX IF NOT EXISTS "ClassificationSession_tenant_id_assigned_to_user_id_operational_status_idx"
  ON public."ClassificationSession" ("tenant_id", "assigned_to_user_id", "operational_status");

CREATE INDEX IF NOT EXISTS "ClassificationSession_tenant_id_process_kind_updatedAt_idx"
  ON public."ClassificationSession" ("tenant_id", "process_kind", "updatedAt" DESC);

ALTER TABLE public."ClassificationSession" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."ClassificationSession" FROM anon, authenticated;
