-- Drop dead tables (P5). All verified 0 rows on live DB 2026-10-01,
-- zero app-code references. SystemConfig's sole row was a stale
-- 2026-06 build log (log-error-to-db.js is removed alongside).
-- Order: children before parents (FKs, no CASCADE).

DROP TABLE IF EXISTS "public"."EvaluationResult";
DROP TABLE IF EXISTS "public"."EvaluationRun";
DROP TABLE IF EXISTS "public"."GoldenItem";
DROP TABLE IF EXISTS "public"."GoldenDataset";
DROP TABLE IF EXISTS "public"."RepairHistory";
DROP TABLE IF EXISTS "public"."ManualInvoice";
DROP TABLE IF EXISTS "public"."_ConcurrentPermissionToNationalTariff";
DROP TABLE IF EXISTS "public"."ConcurrentPermission";
DROP TABLE IF EXISTS "public"."SystemConfig";

DROP TYPE IF EXISTS "public"."RepairReason";
DROP TYPE IF EXISTS "public"."RepairAction";
DROP TYPE IF EXISTS "public"."RepairStatus";
DROP TYPE IF EXISTS "public"."InvoiceStatus";
