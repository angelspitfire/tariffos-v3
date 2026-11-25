-- Add sustento JSON column to DecisionArtifact for auditable justifications.
--
-- Stores the claim-citation map (claims, citations, GRI chain, instruments,
-- model + prompt hash) so the sustento técnico is independently auditable
-- without re-running any model. Nullable so existing rows keep working.

ALTER TABLE "public"."decision_artifact"
  ADD COLUMN IF NOT EXISTS "sustento" JSON;
