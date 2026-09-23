import type { Pool } from "pg";
import type { DomainError, OrderStatus } from "@/src/domain/order";

export async function cancelOrderCommand(db: Pool, orderId: string): Promise<{ success: boolean; orderId: string; status: OrderStatus | null; errors: DomainError[] }> {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query<{ status: OrderStatus; version: number }>("SELECT status, version FROM orders WHERE id=$1 FOR UPDATE", [orderId]);
    if (!result.rowCount) {
      await client.query("ROLLBACK");
      return { success: false, orderId, status: null, errors: [{ code: "ORDER_NOT_FOUND", message: "Order not found." }] };
    }
    const order = result.rows[0];
    if (order.status === "DISPATCHED" || order.status === "CANCELLED") {
      await client.query("ROLLBACK");
      return { success: false, orderId, status: order.status, errors: [{ code: "INVALID_ORDER_STATE", message: "Dispatched or cancelled orders cannot be cancelled again." }] };
    }

    const items = await client.query<{ medicine_id: string; quantity: number }>("SELECT medicine_id, quantity FROM order_items WHERE order_id=$1", [orderId]);
    for (const item of items.rows) {
      await client.query("UPDATE medicines SET stock = stock + $1, updated_at=NOW() WHERE id=$2", [item.quantity, item.medicine_id]);
    }

    const nextVersion = order.version + 1;
    await client.query("UPDATE orders SET status='CANCELLED', version=$2, updated_at=NOW() WHERE id=$1", [orderId, nextVersion]);
    await client.query(
      `INSERT INTO order_events(order_id, event_type, aggregate_version, payload)
       VALUES ($1, 'ORDER_CANCELLED', $2, $3::jsonb)`,
      [orderId, nextVersion, JSON.stringify({ status: "CANCELLED", updatedAt: new Date().toISOString() })],
    );
    await client.query("COMMIT");
    console.log(`[COMMAND] CancelOrder order=${orderId} inventory restored`);
    return { success: true, orderId, status: "CANCELLED", errors: [] };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
