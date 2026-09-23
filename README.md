# Afirmative Pill

Proyecto académico de e-commerce farmacéutico construido para demostrar **GraphQL + CQRS + Apollo + DataLoader + PostgreSQL/Supabase** sin endpoints REST para el canal cliente-servidor.

> **Importante sobre el dataset:** el enunciado del taller menciona un archivo externo con 50 medicamentos, pero dicho archivo no estaba incluido en el material recibido para construir este ZIP. `scripts/seed.ts` contiene 50 registros **de demostración** para que el proyecto arranque y pueda probarse. Antes de la entrega final, sustituya ese seed por el dataset oficial del profesor si lo proporciona.

## Stack

- Next.js 16 (React)
- Apollo Client 4
- Apollo Server 5
- GraphQL
- CQRS: comandos + read model de pedidos
- DataLoader por request para evitar N+1
- PostgreSQL, compatible con Supabase
- Docker Compose para entorno reproducible

## Arranque recomendado con Docker

Requisitos: Docker Desktop o Docker Engine con Compose.

```bash
docker compose up --build
```

Abra:

- Aplicación: http://localhost:3000
- GraphQL: http://localhost:3000/graphql
- PostgreSQL local: localhost:5432

Docker crea tres servicios:

1. `db`: PostgreSQL 16.
2. `app`: Next.js + Apollo Server y ejecuta migración/seed.
3. `projector`: consume `order_events` y mantiene `order_projections`.

Para reiniciar completamente los datos:

```bash
docker compose down -v
docker compose up --build
```

## Arranque sin Docker

Necesita PostgreSQL o Supabase.

```bash
cp .env.example .env.local
npm install
npm run db:prepare
npm run dev
```

## Supabase

1. Cree un proyecto Supabase.
2. Copie una cadena PostgreSQL apropiada para aplicaciones serverless, preferiblemente el pooler de transacciones indicado por Supabase.
3. Configure `DATABASE_URL`.
4. Ejecute una vez:

```bash
npm run db:prepare
```

En producción no exponga credenciales de Supabase al navegador. Toda persistencia pasa por Apollo Server.

## Vercel

El proyecto es un único deploy Next.js. Configure:

```text
DATABASE_URL=<conexion de Supabase>
PROJECTION_MODE=inline
```

Luego importe el repositorio en Vercel. El frontend y Apollo Server comparten dominio; Apollo Client usa `/graphql`.

## Operaciones GraphQL principales

### Catálogo selectivo

```graphql
query {
  medicines(filter: { search: "ibuprofeno" }) {
    totalCount
    nodes {
      id
      name
      priceCents
      presentation
    }
  }
}
```

### Demostración de DataLoader

```graphql
query {
  medicines(limit: 50) {
    nodes {
      id
      name
      category { name }
      laboratory { name }
    }
  }
}
```

Observe la consola del backend: verá un batch por entidad, no una consulta por medicamento.

### Crear pedido

```graphql
mutation CreateOrder($input: CreateOrderInput!) {
  createOrder(input: $input) {
    success
    orderId
    status
    errors { code message field }
  }
}
```

Variables de ejemplo:

```json
{
  "input": {
    "patientName": "Paciente Demo",
    "items": [{ "medicineId": "COPIE_UN_ID_DEL_CATALOGO", "quantity": 1 }]
  }
}
```

Si el medicamento exige fórmula, agregue:

```json
"prescription": {
  "prescriptionNumber": "RX-DEMO-001",
  "doctorName": "Profesional Demo",
  "issuedAt": "2026-09-21"
}
```

## Invariantes implementadas

- Cantidad > 0.
- No se puede comprar un medicamento inexistente.
- No se puede reservar más stock que el disponible.
- El stock se bloquea con `FOR UPDATE` y se descuenta dentro de la misma transacción que crea la orden.
- Si algún ítem requiere fórmula, `createOrder` exige soporte de prescripción.
- Solo una orden `PENDING_APPROVAL` puede aprobarse.
- Solo una orden `APPROVED` puede despacharse.
- Cancelar una orden pendiente/aprobada restaura el inventario.

## Estructura relevante

```text
app/
  graphql/route.ts            # único endpoint cliente-servidor
  catalog/                    # Read UI
  medicine/[id]/              # Read UI
  cart/                       # Command UI
  orders/[id]/                # Projection UI
src/
  application/commands/       # Write model / CQRS
  application/queries/        # Read handlers
  application/projections/    # Outbox -> read model
  domain/                     # reglas independientes
  graphql/                    # SDL, resolvers, DataLoader
  infrastructure/db/          # PostgreSQL pool
scripts/
  migrate.ts
  seed.ts
  projector.ts
db/migrations/
```

Vea también `docs/ARCHITECTURE.md`.

## Checklist de sustentación (5-8 min)

1. Abrir catálogo y filtrar por nombre/principio activo.
2. En DevTools > Network mostrar únicamente llamadas `POST /graphql`.
3. Mostrar que la Query del catálogo pide pocos campos y la ficha pide campos clínicos adicionales.
4. Ejecutar query con categoría/laboratorio y enseñar los logs `[DataLoader] ... batch`.
5. Agregar un medicamento OTC y uno con fórmula al carrito.
6. Intentar crear un pedido sin soporte de fórmula desde GraphQL para enseñar `PRESCRIPTION_REQUIRED`.
7. Crear la orden correctamente y mostrar `PENDING_APPROVAL`.
8. Validar la fórmula desde el panel de sustentación y observar cómo la proyección cambia a `APPROVED`.
9. Despachar o cancelar. Al cancelar, explicar que se restaura el stock.
10. Mostrar `createOrder.ts`, especialmente `BEGIN`, `FOR UPDATE`, `COMMIT` y el outbox.

## Calidad

```bash
npm run typecheck
npm test
npm run build
# o todo junto
npm run quality
```

## Nota académica

La implementación deliberadamente mantiene la autenticación fuera del alcance para concentrar la demostración en los criterios arquitectónicos del taller. En un producto real se añadirían identidad, autorización por rol, auditoría clínica y controles regulatorios adicionales.
