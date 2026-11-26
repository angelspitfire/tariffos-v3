-- Partial expression HNSW index for 768-dim Nemotron/Gemini embeddings
CREATE INDEX IF NOT EXISTS "TariffNodeEmbedding_embedding_768_hnsw_idx"
  ON public."TariffNodeEmbedding"
  USING hnsw (((embedding)::vector(768)) vector_cosine_ops)
  WHERE dims = 768;
