import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div>
          <span className="badge">HealthTech · GraphQL · CQRS</span>
          <h1>Farmacia digital, arquitectura visible.</h1>
          <p>
            Demo académica de Afirmative Pill. El cliente consume un único endpoint GraphQL,
            los comandos protegen las invariantes del dominio y las consultas leen proyecciones optimizadas.
          </p>
          <div className="form-row">
            <Link className="btn" href="/catalog">Explorar medicamentos</Link>
            <a className="btn secondary" href="/graphql">Abrir GraphQL</a>
          </div>
        </div>
        <div className="card stack">
          <div><div className="metric">1</div><div className="muted">endpoint cliente-servidor: <code>/graphql</code></div></div>
          <div><div className="metric">CQRS</div><div className="muted">comandos transaccionales + read model proyectado</div></div>
          <div><div className="metric">N+1</div><div className="muted">mitigado con DataLoader por request</div></div>
        </div>
      </section>
      <section className="section">
        <h2>Qué demuestra esta implementación</h2>
        <div className="grid">
          <div className="card"><h3>GraphQL riguroso</h3><p className="muted">Inputs, enums, payloads tipados, errores de dominio y selección exacta de campos.</p></div>
          <div className="card"><h3>Inventario consistente</h3><p className="muted">Bloqueo <code>FOR UPDATE</code> y transacción para impedir sobreventa concurrente.</p></div>
          <div className="card"><h3>Consistencia eventual</h3><p className="muted">Outbox de eventos + proyección de pedidos. Docker usa un projector independiente.</p></div>
        </div>
      </section>
    </>
  );
}
