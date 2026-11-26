-- Console-managed allowlist of internal platform administrators
-- Idempotent and purely non-destructive SQL.

CREATE TABLE IF NOT EXISTS public."platform_admins" (
  "id"         TEXT NOT NULL,
  "email"      TEXT NOT NULL,
  "role"       TEXT NOT NULL DEFAULT 'super_admin',
  "is_active"  BOOLEAN NOT NULL DEFAULT true,
  "notes"      TEXT,
  "created_by" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "platform_admins_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "platform_admins_email_key"
  ON public."platform_admins" ("email");

CREATE INDEX IF NOT EXISTS "platform_admins_is_active_idx"
  ON public."platform_admins" ("is_active");

ALTER TABLE public."platform_admins" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."platform_admins" FORCE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'platform_admins'
      AND policyname = 'platform_admins_admin_only_policy'
  ) THEN
    CREATE POLICY "platform_admins_admin_only_policy" ON public."platform_admins"
      USING (
        current_setting('app.current_tenant', true) IS NULL
        OR current_setting('app.current_tenant', true) = ''
      );
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'tariffos_app') THEN
    GRANT SELECT, INSERT, UPDATE ON public."platform_admins" TO tariffos_app;
  END IF;
END $$;
