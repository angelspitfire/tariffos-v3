-- Drop unused Postgres extensions (P4). Verified zero usage in all
-- migrations and app code; `vector` stays (embedding columns).
DROP EXTENSION IF EXISTS "pg_cron";
DROP EXTENSION IF EXISTS "http";
DROP EXTENSION IF EXISTS "pgcrypto";
