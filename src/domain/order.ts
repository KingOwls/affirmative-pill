export type OrderStatus = "PENDING_APPROVAL" | "APPROVED" | "DISPATCHED" | "CANCELLED";

export interface DomainError {
  code: string;
  message: string;
  field?: string | null;
}

export interface PrescriptionInput {
  prescriptionNumber: string;
  doctorName: string;
  issuedAt: string;
}

export interface CreateOrderItemInput {
  medicineId: string;
  quantity: number;
}

export interface CreateOrderInput {
  patientName: string;
  items: CreateOrderItemInput[];
  prescription?: PrescriptionInput | null;
}

export function validateCreateOrderInput(input: CreateOrderInput): DomainError[] {
  const errors: DomainError[] = [];
  if (!input.patientName.trim()) errors.push({ code: "PATIENT_REQUIRED", message: "Patient name is required.", field: "patientName" });
  if (!input.items.length) errors.push({ code: "EMPTY_ORDER", message: "The order must contain at least one item.", field: "items" });
  for (const [index, item] of input.items.entries()) {
    if (!item.medicineId) errors.push({ code: "MEDICINE_REQUIRED", message: "Medicine id is required.", field: `items.${index}.medicineId` });
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) errors.push({ code: "INVALID_QUANTITY", message: "Quantity must be a positive integer.", field: `items.${index}.quantity` });
  }
  return errors;
}
