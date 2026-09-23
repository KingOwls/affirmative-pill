"use client";

import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { useCart } from "@/src/ui/cart";
import { formatCOP } from "@/src/ui/money";

const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      success orderId status
      errors { code message field }
    }
  }
`;

type MutationData = { createOrder: { success: boolean; orderId: string | null; status: string | null; errors: { code: string; message: string; field?: string | null }[] } };

export default function CartPage() {
  const cart = useCart();
  const router = useRouter();
  const [patientName, setPatientName] = useState("");
  const [prescriptionNumber, setPrescriptionNumber] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [issuedAt, setIssuedAt] = useState("");
  const requiresPrescription = useMemo(() => cart.items.some((x) => x.requiresPrescription), [cart.items]);
  const [createOrder, { loading, error }] = useMutation<MutationData>(CREATE_ORDER);
  const [domainErrors, setDomainErrors] = useState<MutationData["createOrder"]["errors"]>([]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setDomainErrors([]);
    const result = await createOrder({
      variables: {
        input: {
          patientName,
          items: cart.items.map((x) => ({ medicineId: x.medicineId, quantity: x.quantity })),
          prescription: requiresPrescription ? { prescriptionNumber, doctorName, issuedAt } : undefined,
        },
      },
    });
    const payload = result.data?.createOrder;
    if (!payload) return;
    if (!payload.success || !payload.orderId) {
      setDomainErrors(payload.errors);
      return;
    }
    cart.clear();
    router.push(`/orders/${payload.orderId}`);
  }

  return (
    <section className="section">
      <span className="badge">Command Model</span>
      <h2>Carrito y creación del pedido</h2>
      {!cart.items.length ? <div className="notice">El carrito está vacío.</div> : (
        <form className="grid-2" onSubmit={submit}>
          <div className="card">
            {cart.items.map((item) => (
              <div className="cart-row" key={item.medicineId}>
                <div><strong>{item.name}</strong><div className="muted">{formatCOP(item.priceCents)} c/u {item.requiresPrescription ? "· requiere fórmula" : ""}</div></div>
                <input className="input" style={{ width: 90 }} type="number" min={1} value={item.quantity} onChange={(e) => cart.setQuantity(item.medicineId, Number(e.target.value))} />
                <button type="button" className="btn secondary" onClick={() => cart.remove(item.medicineId)}>Quitar</button>
              </div>
            ))}
            <p className="price">Total: {formatCOP(cart.totalCents)}</p>
          </div>
          <div className="card stack">
            <label>Paciente<input className="input" style={{ width: "100%" }} value={patientName} onChange={(e) => setPatientName(e.target.value)} required /></label>
            {requiresPrescription && <>
              <div className="notice">Este pedido contiene medicamentos que requieren soporte de fórmula médica.</div>
              <label>Número de fórmula<input className="input" style={{ width: "100%" }} value={prescriptionNumber} onChange={(e) => setPrescriptionNumber(e.target.value)} required /></label>
              <label>Profesional médico<input className="input" style={{ width: "100%" }} value={doctorName} onChange={(e) => setDoctorName(e.target.value)} required /></label>
              <label>Fecha de expedición<input className="input" style={{ width: "100%" }} type="date" value={issuedAt} onChange={(e) => setIssuedAt(e.target.value)} required /></label>
            </>}
            {error && <div className="error">{error.message}</div>}
            {domainErrors.map((e) => <div className="error" key={`${e.code}-${e.field}`}>{e.code}: {e.message}</div>)}
            <button className="btn" disabled={loading}>{loading ? "Procesando transacción…" : "Crear pedido"}</button>
          </div>
        </form>
      )}
    </section>
  );
}
