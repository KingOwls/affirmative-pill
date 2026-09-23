"use client";

import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { useParams } from "next/navigation";
import { formatCOP } from "@/src/ui/money";

const ORDER = gql`
  query OrderProjection($id: ID!) {
    order(id: $id) {
      id patientName status totalCents prescriptionRequired prescriptionValidated
      projectedVersion createdAt updatedAt projectionUpdatedAt
      items { medicineId medicineName quantity unitPriceCents subtotalCents }
    }
  }
`;
const VALIDATE = gql`mutation Validate($orderId: ID!) { validatePrescription(orderId: $orderId) { success status errors { code message } } }`;
const DISPATCH = gql`mutation Dispatch($orderId: ID!) { dispatchOrder(orderId: $orderId) { success status errors { code message } } }`;
const CANCEL = gql`mutation Cancel($orderId: ID!) { cancelOrder(orderId: $orderId) { success status errors { code message } } }`;

type Order = { id: string; patientName: string; status: string; totalCents: number; prescriptionRequired: boolean; prescriptionValidated: boolean; projectedVersion: number; createdAt: string; updatedAt: string; projectionUpdatedAt: string; items: { medicineId: string; medicineName: string; quantity: number; unitPriceCents: number; subtotalCents: number }[] };
type Data = { order: Order | null };

export default function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error, refetch } = useQuery<Data>(ORDER, { variables: { id }, pollInterval: 1200, fetchPolicy: "network-only" });
  const [validate, validateState] = useMutation(VALIDATE);
  const [dispatch, dispatchState] = useMutation(DISPATCH);
  const [cancel, cancelState] = useMutation(CANCEL);
  const busy = validateState.loading || dispatchState.loading || cancelState.loading;

  if (loading && !data) return <section className="section"><div className="notice">La orden fue aceptada. Esperando su proyección CQRS…</div></section>;
  if (error) return <section className="section"><div className="error">{error.message}</div></section>;
  if (!data?.order) return <section className="section"><div className="notice">La proyección todavía no está disponible. Esta vista consulta nuevamente cada 1.2 segundos.</div></section>;
  const order = data.order;

  async function run(action: () => Promise<unknown>) { await action(); await refetch(); }

  return (
    <section className="section">
      <span className="badge">Read Model · projection v{order.projectedVersion}</span>
      <h2>Pedido {order.id.slice(0, 8)}</h2>
      <div className="grid-2">
        <div className="card stack">
          <div className="muted">Estado operativo</div>
          <div className="order-status">{order.status}</div>
          <div>Paciente: <strong>{order.patientName}</strong></div>
          <div>Total: <strong>{formatCOP(order.totalCents)}</strong></div>
          <div>Fórmula requerida: <strong>{order.prescriptionRequired ? "Sí" : "No"}</strong></div>
          <div>Fórmula validada: <strong>{order.prescriptionValidated ? "Sí" : "No"}</strong></div>
          <div className="muted">Proyección actualizada: {new Date(order.projectionUpdatedAt).toLocaleString("es-CO")}</div>
        </div>
        <div className="card stack">
          <strong>Panel de sustentación</strong>
          <p className="muted">Estos botones representan comandos de dominio para demostrar las transiciones y el read model.</p>
          {order.status === "PENDING_APPROVAL" && order.prescriptionRequired && <button disabled={busy} className="btn" onClick={() => run(() => validate({ variables: { orderId: id } }))}>Validar fórmula</button>}
          {order.status === "APPROVED" && <button disabled={busy} className="btn" onClick={() => run(() => dispatch({ variables: { orderId: id } }))}>Confirmar despacho</button>}
          {(order.status === "PENDING_APPROVAL" || order.status === "APPROVED") && <button disabled={busy} className="btn danger" onClick={() => run(() => cancel({ variables: { orderId: id } }))}>Cancelar y restaurar stock</button>}
        </div>
      </div>
      <div className="section">
        <h2>Ítems proyectados</h2>
        <div className="card">
          {order.items.map((item) => <div className="cart-row" key={item.medicineId}><div><strong>{item.medicineName}</strong></div><div>x{item.quantity}</div><div>{formatCOP(item.subtotalCents)}</div></div>)}
        </div>
      </div>
    </section>
  );
}
