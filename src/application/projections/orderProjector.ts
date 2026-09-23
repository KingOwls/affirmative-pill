import type { Pool, PoolClient } from "pg";

type EventRow = {
  id: string;
  order_id: string;
  event_type: string;
  aggregate_version: number;
  payload: Record<string, unknown>;
};

async function projectEvent(client: PoolClient, event: EventRow) {
  if (event.event_type === "ORDER_CREATED") {
    const p = event.payload as {
      patientName: string;
      status: string;
      totalCents: number;
      items: unknown[];
      prescriptionRequired: boolean;
      prescriptionValidated: boolean;
      createdAt: string;
      updatedAt: string;
    };
    await client.query(
      `INSERT INTO order_projections
        (order_id, patient_name, status, total_cents, items, prescription_required, prescription_validated, projected_version, created_at, updated_at, projection_updated_at)
       VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7,$8,$9,$10,NOW())
       ON CONFLICT (order_id) DO UPDATE SET
         patient_name=EXCLUDED.patient_name,
         status=EXCLUDED.status,
         total_cents=EXCLUDED.total_cents,
         items=EXCLUDED.items,
         prescription_required=EXCLUDED.prescription_required,
         prescription_validated=EXCLUDED.prescription_validated,
         projected_version=EXCLUDED.projected_version,
         updated_at=EXCLUDED.updated_at,
         projection_updated_at=NOW()`,
      [event.order_id, p.patientName, p.status, p.totalCents, JSON.stringify(p.items), p.prescriptionRequired, p.prescriptionValidated, event.aggregate_version, p.createdAt, p.updatedAt],
    );
  } else {
    const status = String(event.payload.status ?? "PENDING_APPROVAL");
    const validated = event.payload.prescriptionValidated;
    await client.query(
      `UPDATE order_projections
       SET status=$2,
           prescription_validated=COALESCE($3::boolean, prescription_validated),
           projected_version=$4,
           updated_at=COALESCE($5::timestamptz, NOW()),
           projection_updated_at=NOW()
       WHERE order_id=$1`,
      [event.order_id, status, typeof validated === "boolean" ? validated : null, event.aggregate_version, event.payload.updatedAt ?? null],
    );
  }
  await client.query("UPDATE order_events SET projected_at=NOW() WHERE id=$1", [event.id]);
}

export async function projectPendingEvents(db: Pool, limit = 20, orderId?: string): Promise<number> {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query<EventRow>(
      `SELECT id::text, order_id, event_type, aggregate_version, payload
       FROM order_events
       WHERE projected_at IS NULL
         AND ($2::uuid IS NULL OR order_id = $2::uuid)
       ORDER BY id
       LIMIT $1
       FOR UPDATE SKIP LOCKED`,
      [limit, orderId ?? null],
    );
    for (const event of result.rows) await projectEvent(client, event);
    await client.query("COMMIT");
    return result.rows.length;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
