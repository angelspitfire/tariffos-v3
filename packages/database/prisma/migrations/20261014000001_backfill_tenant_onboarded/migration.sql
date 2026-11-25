-- Onboarding: mark every pre-existing organization as already onboarded.
--
-- `Tenant.isOnboarded` / `onboardedAt` have been in the schema since the
-- multi-tenant split but nothing ever wrote them, so every org in the wild has
-- `isOnboarded = false`. Now that the app shell gates on that flag
-- (`apps/filings/src/lib/app-access.ts`), an un-onboarded owner is redirected
-- to `/onboarding` — which would drag every existing customer through a
-- first-run flow to re-enter an org they have been filing under for months.
--
-- No DDL: both columns already exist. Data only, and idempotent.
--
-- Applied 2026-10-14 against TariffOS-beta: 4 tenants updated, 0 left behind.
-- New orgs are provisioned with the placeholder name
-- (`apps/filings/src/lib/provision-tenant.ts`) and get the real one from
-- /onboarding, which is what stamps these columns from here on.

UPDATE public."Tenant"
SET "isOnboarded" = true,
    "onboardedAt" = COALESCE("onboardedAt", now()),
    -- @updatedAt is client-side in Prisma, so a raw UPDATE has to set it.
    "updatedAt" = now()
WHERE "isOnboarded" = false;
