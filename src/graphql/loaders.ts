import DataLoader from "dataloader";
import type { Pool } from "pg";

export type NamedEntity = { id: string; name: string };

function namedEntityLoader(db: Pool, table: "categories" | "laboratories", label: string) {
  return new DataLoader<string, NamedEntity | null>(async (ids) => {
    console.log(`[DataLoader] ${label} batch ids=[${ids.join(", ")}]`);
    const result = await db.query<NamedEntity>(`SELECT id, name FROM ${table} WHERE id = ANY($1::uuid[])`, [ids]);
    const byId = new Map(result.rows.map((row) => [row.id, row]));
    return ids.map((id) => byId.get(id) ?? null);
  });
}

export function createLoaders(db: Pool) {
  return {
    categories: namedEntityLoader(db, "categories", "categories"),
    laboratories: namedEntityLoader(db, "laboratories", "laboratories"),
  };
}

export type Loaders = ReturnType<typeof createLoaders>;
