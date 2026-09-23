# Mapeo directo contra la rúbrica

## 1. Diseño e implementación GraphQL - 40%

- SDL: `src/graphql/schema.ts`
- Object Types, Enum, Inputs, Payloads y Scalar: `Medicine`, `OrderStatus`, `MedicineFilterInput`, `CreateOrderInput`, `CommandPayload`, `DateTime`.
- Queries selectivas: `medicines`, `medicine`, `order`.
- Mutations de intención: `createOrder`, `validatePrescription`, `dispatchOrder`, `cancelOrder`.
- Errores de dominio tipados: `DomainError`.
- DataLoader por request: `src/graphql/loaders.ts`.
- Único canal cliente-servidor: `app/graphql/route.ts` -> `/graphql`.

## 2. CQRS y modelo de dominio - 25%

- Commands: `src/application/commands/`.
- Queries: `src/application/queries/`.
- Proyección: `src/application/projections/orderProjector.ts` + tabla `order_projections`.
- Outbox: tabla `order_events`.
- Invariantes de stock/receta: `createOrder.ts`.
- Atomicidad de inventario: `BEGIN`, `SELECT ... FOR UPDATE`, `COMMIT`.
- Consistencia eventual: servicio `projector` en Docker y polling de la vista de seguimiento.

## 3. Frontend Apollo Client - 20%

- `ApolloProvider`: `app/providers.tsx`.
- Caché: `InMemoryCache`.
- `useQuery`: catálogo, detalle y seguimiento.
- `useMutation`: creación, validación, despacho y cancelación.
- Estados `loading`, `error`, `data` tratados en UI.
- Seguimiento refrescado después de comandos mediante `refetch` y polling corto de la proyección.

## 4. Supabase, calidad y sustentación - 15%

- Persistencia PostgreSQL: `db/migrations/001_init.sql`.
- Índices de búsqueda y relaciones incluidos en la migración.
- Conexión server-side: `src/infrastructure/db/pool.ts`.
- Compatible con `DATABASE_URL` de Supabase.
- Docker: `Dockerfile` + `docker-compose.yml`.
- CI: `.github/workflows/quality.yml`.
- Arquitectura: `docs/ARCHITECTURE.md`.
- Guía Vercel: `docs/VERCEL.md`.
- Operaciones para demostración: `docs/demo-queries.graphql`.

## Entregables

- Repositorio listo para Git.
- README con arranque, arquitectura, CQRS, N+1 y checklist del video.
- Schema completo dentro del código.
- Guion práctico de sustentación en el README.

## Pendiente externo

El enunciado referencia un dataset oficial de 50 medicamentos que no estaba adjunto al material utilizado para generar este repositorio. El seed incluido es demostrativo y debe reemplazarse si el profesor entrega el archivo oficial.

GraphQL Subscriptions no se implementaron en esta versión porque el enunciado las presenta como una integración valorada, no como requisito obligatorio. El seguimiento usa polling sobre el read model para mantener el alcance enfocado en los criterios principales.
