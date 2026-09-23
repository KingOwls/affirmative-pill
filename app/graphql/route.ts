import { randomUUID } from "node:crypto";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import type { NextRequest } from "next/server";
import { apolloServer } from "@/src/graphql/server";
import { createLoaders } from "@/src/graphql/loaders";
import { pool } from "@/src/infrastructure/db/pool";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handler = startServerAndCreateNextHandler<NextRequest>(apolloServer, {
  context: async () => ({
    db: pool,
    loaders: createLoaders(pool),
    requestId: randomUUID(),
  }),
});

export { handler as GET, handler as POST };
