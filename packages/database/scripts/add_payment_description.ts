import { Pool } from 'pg';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  await pool.query(
    `ALTER TABLE "public"."Payment" ADD COLUMN IF NOT EXISTS "description" TEXT;`,
  );
  console.log('Added description column to Payment table');
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
