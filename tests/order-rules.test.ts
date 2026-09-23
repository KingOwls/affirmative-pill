import { describe, expect, it } from "vitest";
import {
  getInitialOrderStatus,
  validateCreateOrderInput,
} from "../src/domain/order";


describe("order domain rules", () => {
  it("rejects an empty order", () => {
    const errors = validateCreateOrderInput({ patientName: "Paciente", items: [] });
    expect(errors.some((e) => e.code === "EMPTY_ORDER")).toBe(true);
  });

  it("rejects non-positive quantities", () => {
    const errors = validateCreateOrderInput({ patientName: "Paciente", items: [{ medicineId: "x", quantity: 0 }] });
    expect(errors.some((e) => e.code === "INVALID_QUANTITY")).toBe(true);
  });

  it("accepts a basic valid command shape", () => {
    const errors = validateCreateOrderInput({ patientName: "Paciente", items: [{ medicineId: "x", quantity: 2 }] });
    expect(errors).toEqual([]);
  });

  it("approves an OTC order immediately", () => {
    expect(
      getInitialOrderStatus(false)
    ).toBe("APPROVED");
  });

  it("keeps prescription orders pending approval", () => {
    expect(
      getInitialOrderStatus(true)
    ).toBe("PENDING_APPROVAL");
  });
});
