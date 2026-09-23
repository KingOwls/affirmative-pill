import { randomUUID } from "node:crypto";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import type { NextRequest } from "next/server";

import {
  apolloServer,
  type GraphQLContext,
} from "@/src/graphql/server";

import { createLoaders } from "@/src/graphql/loaders";
import { pool } from "@/src/infrastructure/db/pool";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const apolloHandler = startServerAndCreateNextHandler<
  NextRequest,
  GraphQLContext
>(apolloServer, {
  context: async (): Promise<GraphQLContext> => ({
    db: pool,
    loaders: createLoaders(pool),
    requestId: randomUUID(),
  }),
});

export async function GET(
  request: NextRequest
): Promise<Response> {
  return apolloHandler(request);
}

export async function POST(
  request: NextRequest
): Promise<Response> {
  return apolloHandler(request);
}