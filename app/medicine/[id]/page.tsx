"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useParams } from "next/navigation";
import { formatCOP } from "@/src/ui/money";
import { useCart } from "@/src/ui/cart";

const MEDICINE = gql`
  query MedicineDetail($id: ID!) {
    medicine(id: $id) {
      id sku name activeIngredient presentation indications priceCents stock requiresPrescription
      category { id name }
      laboratory { id name }
    }
  }
`;

type Data = { medicine: null | { id: string; sku: string; name: string; activeIngredient: string; presentation: string; indications: string; priceCents: number; stock: number; requiresPrescription: boolean; category: { name: string } | null; laboratory: { name: string } | null } };

export default function MedicinePage() {
  const params = useParams<{ id: string }>();
  const { add } = useCart();
  const { data, loading, error } = useQuery<Data>(MEDICINE, { variables: { id: params.id } });
  if (loading) return <section className="section"><div className="notice">Cargando ficha…</div></section>;
  if (error) return <section className="section"><div className="error">{error.message}</div></section>;
  if (!data?.medicine) return <section className="section"><div className="error">Medicamento no encontrado.</div></section>;
  const m = data.medicine;
  return (
    <section className="detail">
      <span className={m.requiresPrescription ? "badge rx" : "badge"}>{m.requiresPrescription ? "Requiere fórmula" : "Venta libre"}</span>
      <h1>{m.name}</h1>
      <div className="grid-2">
        <div className="card">
          <div className="kv"><strong>Principio activo</strong><span>{m.activeIngredient}</span></div>
          <div className="kv"><strong>Presentación</strong><span>{m.presentation}</span></div>
          <div className="kv"><strong>Laboratorio</strong><span>{m.laboratory?.name}</span></div>
          <div className="kv"><strong>Categoría</strong><span>{m.category?.name}</span></div>
          <div className="kv"><strong>Stock</strong><span>{m.stock}</span></div>
          <div className="kv"><strong>Indicaciones</strong><span>{m.indications}</span></div>
        </div>
        <div className="card stack">
          <div className="price">{formatCOP(m.priceCents)}</div>
          <p className="muted">La selección de campos de esta pantalla es distinta a la del catálogo, evitando over-fetching desde el cliente.</p>
          <button className="btn" disabled={m.stock <= 0} onClick={() => add({ medicineId: m.id, name: m.name, priceCents: m.priceCents, requiresPrescription: m.requiresPrescription })}>
            {m.stock > 0 ? "Agregar al carrito" : "Agotado"}
          </button>
        </div>
      </div>
    </section>
  );
}
