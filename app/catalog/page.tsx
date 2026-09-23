"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import Link from "next/link";
import { useState } from "react";
import { formatCOP } from "@/src/ui/money";

type Medicine = { id: string; name: string; activeIngredient: string; presentation: string; priceCents: number; stock: number; requiresPrescription: boolean; category: { name: string } | null; laboratory: { name: string } | null };
type Data = { medicines: { totalCount: number; nodes: Medicine[] } };

const MEDICINES = gql`
  query Catalog($filter: MedicineFilterInput, $limit: Int) {
    medicines(filter: $filter, limit: $limit) {
      totalCount
      nodes {
        id
        name
        activeIngredient
        presentation
        priceCents
        stock
        requiresPrescription
        category { name }
        laboratory { name }
      }
    }
  }
`;

export default function CatalogPage() {
  const [search, setSearch] = useState("");
  const [rx, setRx] = useState<string>("");
  const { data, loading, error } = useQuery<Data>(MEDICINES, {
    variables: { filter: { search: search || undefined, requiresPrescription: rx === "" ? undefined : rx === "true" }, limit: 50 },
  });

  return (
    <section className="section">
      <span className="badge">Read Model</span>
      <h2>Catálogo de medicamentos</h2>
      <div className="form-row">
        <input className="input grow" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nombre o principio activo" />
        <select className="input" value={rx} onChange={(e) => setRx(e.target.value)}>
          <option value="">Todos</option>
          <option value="false">Venta libre</option>
          <option value="true">Con fórmula</option>
        </select>
      </div>
      {loading && <div className="notice">Consultando por GraphQL…</div>}
      {error && <div className="error">{error.message}</div>}
      {data && <p className="muted">{data.medicines.totalCount} resultado(s). Incluimos categoría y laboratorio para demostrar batching con DataLoader.</p>}
      <div className="grid">
        {data?.medicines.nodes.map((medicine) => (
          <article className="card medicine-card" key={medicine.id}>
            <div>
              <div className="form-row">
                <span className="badge">{medicine.category?.name ?? "Sin categoría"}</span>
                {medicine.requiresPrescription && <span className="badge rx">Requiere fórmula</span>}
              </div>
              <h3>{medicine.name}</h3>
              <div className="muted">{medicine.activeIngredient} · {medicine.presentation}</div>
              <p className="muted">{medicine.laboratory?.name}</p>
            </div>
            <div>
              <p className="price">{formatCOP(medicine.priceCents)}</p>
              <Link className="btn" href={`/medicine/${medicine.id}`}>Ver ficha</Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
