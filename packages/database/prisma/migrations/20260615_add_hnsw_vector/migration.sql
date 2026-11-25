-- Add pgvector extension if it doesn't already exist in the environment
CREATE EXTENSION IF NOT EXISTS vector;

-- HNSW index on the LegalKnowledgeChunk embedding column: dramatically
-- speeds up cosine distance (<=>) vector searches.
--
-- HNSW requires a dimensioned column (vector(1536)); the column is the
-- dimensionless `vector` Prisma models as Unsupported("vector"), so the
-- original CREATE INDEX failed with "column does not have dimensions".
-- Create the index only once embeddings land on a typed column — this
-- migration must succeed either way.
DO $$
DECLARE
  dims int;
BEGIN
  SELECT atttypmod INTO dims
  FROM pg_attribute
  WHERE attrelid = '"public"."LegalKnowledgeChunk"'::regclass
    AND attname = 'embedding';
  IF dims > 0 THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS "LegalKnowledgeChunk_embedding_idx" ON "LegalKnowledgeChunk" USING hnsw (embedding vector_cosine_ops)';
  END IF;
END $$;
