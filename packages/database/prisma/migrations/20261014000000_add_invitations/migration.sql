-- Settings/roles: organization invitations + denormalized member identity.
--
-- Membership gains `email`/`name` so the team list can render without a
-- cross-schema join to `auth.users` (Prisma cannot reach the auth schema).
-- `Invitation` holds one live row per (tenant, email); accepting it creates a
-- Membership with the invited role. Additive only — no data migration needed.

ALTER TABLE "Membership" ADD COLUMN "email" TEXT;
ALTER TABLE "Membership" ADD COLUMN "name" TEXT;
ALTER TABLE "Membership" ADD COLUMN "position" TEXT;
ALTER TABLE "Membership" ADD COLUMN "id_number" TEXT;

CREATE TYPE "public"."InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REVOKED', 'EXPIRED');

CREATE TABLE "public"."Invitation" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "status" "public"."InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "token" TEXT NOT NULL,
    "invited_by_id" TEXT,
    "invited_by_name" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "accepted_at" TIMESTAMP(3),
    "accepted_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Invitation_token_key" ON "public"."Invitation"("token");
CREATE UNIQUE INDEX "Invitation_tenant_id_email_key" ON "public"."Invitation"("tenant_id", "email");
CREATE INDEX "Invitation_tenant_id_idx" ON "public"."Invitation"("tenant_id");
CREATE INDEX "Invitation_email_idx" ON "public"."Invitation"("email");

ALTER TABLE "public"."Invitation"
  ADD CONSTRAINT "Invitation_tenant_id_fkey"
  FOREIGN KEY ("tenant_id") REFERENCES "public"."Tenant"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."Invitation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Invitation" FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_policy ON "public"."Invitation";
CREATE POLICY tenant_isolation_policy ON "public"."Invitation"
  AS PERMISSIVE FOR ALL
  USING (
    tenant_id = current_setting('app.current_tenant', true)
    OR current_setting('app.current_tenant', true) IS NULL
    OR current_setting('app.current_tenant', true) = ''
  );

-- New objects don't inherit the app's grants; mirror them explicitly so the
-- app role (tariffos_app) and the PostgREST roles can use the table and enum.
GRANT USAGE ON TYPE "public"."InvitationStatus" TO anon, authenticated, project_admin, tariffos_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."Invitation" TO anon, authenticated, project_admin, tariffos_app;
