-- Admin Console Phase 1: append-only admin_audit_logs + WaitlistLead contact fields
-- Idempotent and purely non-destructive SQL.

CREATE TABLE IF NOT EXISTS public."admin_audit_logs" (
  "id"            TEXT NOT NULL,
  "actor_user_id" TEXT NOT NULL,
  "actor_email"   TEXT,
  "actor_role"    TEXT NOT NULL,
  "action"        TEXT NOT NULL,
  "target_type"   TEXT NOT NULL,
  "target_id"     TEXT NOT NULL,
  "tenant_id"     TEXT,
  "before_state"  JSONB,
  "after_state"   JSONB,
  "reason"        TEXT,
  "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "admin_audit_logs_actor_user_id_created_at_idx"
  ON public."admin_audit_logs" ("actor_user_id", "created_at" DESC);

CREATE INDEX IF NOT EXISTS "admin_audit_logs_tenant_id_created_at_idx"
  ON public."admin_audit_logs" ("tenant_id", "created_at" DESC);

CREATE INDEX IF NOT EXISTS "admin_audit_logs_action_created_at_idx"
  ON public."admin_audit_logs" ("action", "created_at" DESC);

ALTER TABLE public."admin_audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."admin_audit_logs" FORCE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'admin_audit_logs'
      AND policyname = 'admin_audit_logs_admin_only_policy'
  ) THEN
    CREATE POLICY "admin_audit_logs_admin_only_policy" ON public."admin_audit_logs"
      USING (
        current_setting('app.current_tenant', true) IS NULL
        OR current_setting('app.current_tenant', true) = ''
      );
  END IF;
END $$;

ALTER TABLE public."WaitlistLead" ADD COLUMN IF NOT EXISTS "name" TEXT;
ALTER TABLE public."WaitlistLead" ADD COLUMN IF NOT EXISTS "company" TEXT;
ALTER TABLE public."WaitlistLead" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE public."WaitlistLead" ADD COLUMN IF NOT EXISTS "notes" TEXT;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'tariffos_app') THEN
    GRANT SELECT, INSERT ON public."admin_audit_logs" TO tariffos_app;
  END IF;
END $$;
