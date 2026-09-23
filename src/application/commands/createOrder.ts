import type { Pool } from "pg";
import type {
  CreateOrderInput,
  DomainError,
  OrderStatus,
} from "@/src/domain/order";

import {
  getInitialOrderStatus,
  validateCreateOrderInput,
} from "@/src/domain/order";

type MedicineRow = {
  id: string;
  name: string;
  price_cents: number;
  stock: number;
  requires_prescription: boolean;
};

export type CreateOrderResult = {
  success: boolean;
  orderId: string | null;
  status: OrderStatus | null;
  errors: DomainError[];
};

export async function createOrderCommand(db: Pool, input: CreateOrderInput): Promise<CreateOrderResult> {
  const inputErrors = validateCreateOrderInput(input);
  if (inputErrors.length) return { success: false, orderId: null, status: null, errors: inputErrors };

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const ids = [...new Set(input.items.map((item) => item.medicineId))];
    const medicineResult = await client.query<MedicineRow>(
      `SELECT id, name, price_cents, stock, requires_prescription
       FROM medicines
       WHERE id = ANY($1::uuid[])
       FOR UPDATE`,
      [ids],
    );
    const medicines = new Map(medicineResult.rows.map((row) => [row.id, row]));

    const errors: DomainError[] = [];
    for (const item of input.items) {
      const medicine = medicines.get(item.medicineId);
      if (!medicine) {
        errors.push({ code: "MEDICINE_NOT_FOUND", message: `Medicine ${item.medicineId} does not exist.`, field: "items" });
      } else if (medicine.stock < item.quantity) {
        errors.push({ code: "OUT_OF_STOCK", message: `${medicine.name} has only ${medicine.stock} unit(s) available.`, field: "items" });
      }
    }

    const requiresPrescription = medicineResult.rows.some( (m) => m.requires_prescription);
    const initialStatus = getInitialOrderStatus(requiresPrescription);
    if (requiresPrescription && !input.prescription) {
      errors.push({ code: "PRESCRIPTION_REQUIRED", message: "At least one medicine requires prescription support.", field: "prescription" });
    }

    if (errors.length) {
      await client.query("ROLLBACK");
      return { success: false, orderId: null, status: null, errors };
    }

    const totalCents = input.items.reduce((total, item) => total + medicines.get(item.medicineId)!.price_cents * item.quantity, 0);
    const orderResult = await client.query<{
      id: string;
      status: OrderStatus;
      created_at: string;
      updated_at: string;
    }>(
      `INSERT INTO orders(
          patient_name,
          status,
          total_cents
      )
      VALUES ($1, $2, $3)
      RETURNING
          id,
          status,
          created_at,
          updated_at`,
      [
        input.patientName.trim(),
        initialStatus,
        totalCents,
      ],
    );
    const order = orderResult.rows[0];

    for (const item of input.items) {
      const medicine = medicines.get(item.medicineId)!;
      await client.query(
        `UPDATE medicines SET stock = stock - $1, updated_at = NOW() WHERE id = $2`,
        [item.quantity, item.medicineId],
      );
      await client.query(
        `INSERT INTO order_items(order_id, medicine_id, quantity, unit_price_cents, medicine_name_snapshot)
         VALUES ($1,$2,$3,$4,$5)`,
        [order.id, item.medicineId, item.quantity, medicine.price_cents, medicine.name],
      );
    }

    if (input.prescription) {
      await client.query(
        `INSERT INTO prescriptions(order_id, prescription_number, doctor_name, issued_at)
         VALUES ($1,$2,$3,$4)`,
        [order.id, input.prescription.prescriptionNumber, input.prescription.doctorName, input.prescription.issuedAt],
      );
    }

    const snapshotItems = input.items.map((item) => ({
      medicineId: item.medicineId,
      medicineName: medicines.get(item.medicineId)!.name,
      quantity: item.quantity,
      unitPriceCents: medicines.get(item.medicineId)!.price_cents,
      subtotalCents: medicines.get(item.medicineId)!.price_cents * item.quantity,
    }));

    await client.query(
      `INSERT INTO order_events(order_id, event_type, aggregate_version, payload)
       VALUES ($1, 'ORDER_CREATED', 1, $2::jsonb)`,
      [order.id, JSON.stringify({
        orderId: order.id,
        patientName: input.patientName.trim(),
        status: order.status,
        totalCents,
        items: snapshotItems,
        prescriptionRequired: requiresPrescription,
        prescriptionValidated: false,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
      })],
    );

    await client.query("COMMIT");
    console.log(`[COMMAND] CreateOrder accepted order=${order.id} total=${totalCents}`);
    return { success: true, orderId: order.id, status: order.status, errors: [] };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
