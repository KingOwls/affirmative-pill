import type { Pool } from "pg";
import type { DomainError, OrderStatus } from "@/src/domain/order";

export type StatusCommandResult = {
  success: boolean;
  orderId: string;
  status: OrderStatus | null;
  errors: DomainError[];
};

export async function validatePrescriptionCommand(db: Pool, orderId: string): Promise<StatusCommandResult> {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const orderResult = await client.query<{ status: OrderStatus; version: number }>(
      "SELECT status, version FROM orders WHERE id = $1 FOR UPDATE",
      [orderId],
    );
    if (!orderResult.rowCount) {
      await client.query("ROLLBACK");
      return { success: false, orderId, status: null, errors: [{ code: "ORDER_NOT_FOUND", message: "Order not found." }] };
    }
    const order = orderResult.rows[0];
    if (order.status !== "PENDING_APPROVAL") {
      await client.query("ROLLBACK");
      return { success: false, orderId, status: order.status, errors: [{ code: "INVALID_ORDER_STATE", message: "Only pending orders can be approved." }] };
    }

    const rx = await client.query("SELECT id FROM prescriptions WHERE order_id = $1", [orderId]);
    if (!rx.rowCount) {
      await client.query("ROLLBACK");
      return { success: false, orderId, status: order.status, errors: [{ code: "PRESCRIPTION_MISSING", message: "No prescription support is registered for this order." }] };
    }

    await client.query("UPDATE prescriptions SET validated = TRUE, validated_at = NOW() WHERE order_id = $1", [orderId]);
    const nextVersion = order.version + 1;
    await client.query("UPDATE orders SET status = 'APPROVED', version = $2, updated_at = NOW() WHERE id = $1", [orderId, nextVersion]);
    await client.query(
      `INSERT INTO order_events(order_id, event_type, aggregate_version, payload)
       VALUES ($1, 'PRESCRIPTION_VALIDATED', $2, $3::jsonb)`,
      [orderId, nextVersion, JSON.stringify({ status: "APPROVED", prescriptionValidated: true, updatedAt: new Date().toISOString() })],
    );
    await client.query("COMMIT");
    console.log(`[COMMAND] ValidatePrescription order=${orderId}`);
    return { success: true, orderId, status: "APPROVED", errors: [] };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
