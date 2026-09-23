import type { Pool } from "pg";

export type MedicineRow = {
  id: string;
  sku: string;
  name: string;
  activeIngredient: string;
  presentation: string;
  indications: string;
  priceCents: number;
  stock: number;
  requiresPrescription: boolean;
  categoryId: string;
  laboratoryId: string;
};

export async function searchMedicines(db: Pool, input: { search?: string | null; category?: string | null; requiresPrescription?: boolean | null; limit?: number | null; offset?: number | null }) {
  const limit = Math.min(Math.max(input.limit ?? 20, 1), 50);
  const offset = Math.max(input.offset ?? 0, 0);
  const values: unknown[] = [];
  const conditions: string[] = [];

  if (input.search?.trim()) {
    values.push(`%${input.search.trim()}%`);
    conditions.push(`(m.name ILIKE $${values.length} OR m.active_ingredient ILIKE $${values.length})`);
  }
  if (input.category?.trim()) {
    values.push(input.category.trim());
    conditions.push(`EXISTS (SELECT 1 FROM categories c WHERE c.id=m.category_id AND c.name ILIKE $${values.length})`);
  }
  if (typeof input.requiresPrescription === "boolean") {
    values.push(input.requiresPrescription);
    conditions.push(`m.requires_prescription = $${values.length}`);
  }
  values.push(limit, offset);
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const result = await db.query(
    `SELECT
       m.id, m.sku, m.name, m.active_ingredient AS "activeIngredient",
       m.presentation, m.indications, m.price_cents AS "priceCents", m.stock,
       m.requires_prescription AS "requiresPrescription",
       m.category_id AS "categoryId", m.laboratory_id AS "laboratoryId",
       COUNT(*) OVER()::int AS "totalCount"
     FROM medicines m
     ${where}
     ORDER BY m.name
     LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values,
  );
  return {
    nodes: result.rows,
    totalCount: result.rows[0]?.totalCount ?? 0,
  };
}

export async function getMedicine(db: Pool, id: string): Promise<MedicineRow | null> {
  const result = await db.query<MedicineRow>(
    `SELECT id, sku, name, active_ingredient AS "activeIngredient", presentation, indications,
            price_cents AS "priceCents", stock, requires_prescription AS "requiresPrescription",
            category_id AS "categoryId", laboratory_id AS "laboratoryId"
     FROM medicines WHERE id=$1`,
    [id],
  );
  return result.rows[0] ?? null;
}
