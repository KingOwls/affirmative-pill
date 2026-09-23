import { readFile } from "node:fs/promises";
import path from "node:path";
import { pool } from "../src/infrastructure/db/pool";

async function main() {
  const migrationPath = path.join(process.cwd(), "db/migrations/001_init.sql");
  const sql = await readFile(migrationPath, "utf8");
  try {
    await pool.query(sql);
    console.log("[db] migration 001_init applied / verified");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
