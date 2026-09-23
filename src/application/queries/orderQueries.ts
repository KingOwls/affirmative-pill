import type { Pool } from "pg";
import { projectPendingEvents } from "@/src/application/projections/orderProjector";

export async function getOrderProjection(db: Pool, orderId: string) {
  if ((process.env.PROJECTION_MODE ?? "inline") === "inline") {
    await projectPendingEvents(db, 50, orderId);
  }
  const result = await db.query(
    `SELECT order_id AS id, patient_name AS "patientName", status, total_cents AS "totalCents",
            items, prescription_required AS "prescriptionRequired",
            prescription_validated AS "prescriptionValidated",
            projected_version AS "projectedVersion", created_at AS "createdAt",
            updated_at AS "updatedAt", projection_updated_at AS "projectionUpdatedAt"
     FROM order_projections WHERE order_id=$1`,
    [orderId],
  );
  return result.rows[0] ?? null;
}
