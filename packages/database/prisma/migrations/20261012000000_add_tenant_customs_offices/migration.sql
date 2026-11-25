-- P0-4: tenant-configurable customs offices for the New Filing modal.
-- Empty array (the default) means "use the app's built-in defaults".
ALTER TABLE "public"."Tenant" ADD COLUMN "customsOffices" JSONB NOT NULL DEFAULT '[]';
