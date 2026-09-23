import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL ?? "postgresql://build:build@127.0.0.1:5432/build";

// Next.js can evaluate server modules during `next build`. The harmless build-time
// fallback avoids requiring a live database during compilation; any real request
// still needs DATABASE_URL configured to reach PostgreSQL.
const isLocal = connectionString.includes("localhost") || connectionString.includes("127.0.0.1") || connectionString.includes("@db:");

const globalForPg = globalThis as unknown as { affirmativePool?: Pool };

export const pool = globalForPg.affirmativePool ?? new Pool({
  connectionString,
  ssl: isLocal ? false : { rejectUnauthorized: false },
  max: Number(process.env.DB_POOL_MAX ?? 5),
  idleTimeoutMillis: 15_000,
  connectionTimeoutMillis: 10_000,
});

if (process.env.NODE_ENV !== "production") globalForPg.affirmativePool = pool;
