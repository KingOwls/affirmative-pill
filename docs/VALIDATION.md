# Validación realizada al generar este paquete

Se ejecutaron estos controles:

- Transpilación sintáctica de todos los `.ts` y `.tsx` con TypeScript disponible: **OK**.
- Pruebas directas de reglas puras del dominio (`EMPTY_ORDER`, `INVALID_QUANTITY`, comando válido): **OK**.
- Conteo del seed de demostración: **50 medicamentos**.
- Smoke check del contrato GraphQL: Queries, Mutations, `OrderProjection` y comandos principales presentes.
- Smoke check de Docker Compose: `db`, `app`, `projector` y PostgreSQL 16 presentes.
- Validación JSON de `package.json`, `tsconfig.json` y `vercel.json`: **OK**.

## Limitación del entorno de generación

El contenedor utilizado para producir el ZIP no dispone del binario Docker, por lo que no fue posible ejecutar `docker compose up` aquí. También se intentó instalar las dependencias con npm para ejecutar `next build`, pero el acceso al registro npm desde este contenedor agotó el tiempo de espera.

Por ello, el repositorio incluye GitHub Actions (`.github/workflows/quality.yml`) para ejecutar con PostgreSQL real: migración, seed, typecheck, tests y build al subirlo a GitHub, además de `npm run quality` para validarlo localmente.
