# Despliegue en Vercel

La rúbrica escrita no exige Vercel, pero este repositorio queda preparado para la instrucción adicional del profesor.

## Supabase

Cree el proyecto y obtenga la conexión PostgreSQL apropiada para carga serverless. Configure la base una vez:

```bash
DATABASE_URL="..." npm run db:prepare
```

Antes de la entrega, sustituya el seed demo por el dataset oficial de 50 medicamentos si el profesor lo entrega.

## Variables de Vercel

```text
DATABASE_URL=<cadena PostgreSQL/Supabase>
PROJECTION_MODE=inline
DB_POOL_MAX=3
```

No exponga credenciales mediante variables `NEXT_PUBLIC_*`.

## Deploy

Importe el repositorio Git. Vercel detecta Next.js. No hay backend separado: `app/graphql/route.ts` publica `/graphql` en el mismo dominio.

## Evidencia Zero-REST

En DevTools > Network, el catálogo, detalle, creación y seguimiento del pedido deben usar `/graphql`.

## Proyecciones

Docker usa `PROJECTION_MODE=worker`, con un proceso residente que consume el outbox. Vercel usa `inline`, donde el Query Handler procesa eventos pendientes de la orden antes de leer el read model. Esto conserva la separación CQRS sin exigir un worker residente en el hosting.
