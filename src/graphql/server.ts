import { ApolloServer } from "@apollo/server";
import type { Pool } from "pg";
import type { Loaders } from "@/src/graphql/loaders";
import { typeDefs } from "@/src/graphql/schema";
import { resolvers } from "@/src/graphql/resolvers";

export type GraphQLContext = {
  db: Pool;
  loaders: Loaders;
  requestId: string;
};

export const apolloServer = new ApolloServer<GraphQLContext>({
  typeDefs,
  resolvers,
  introspection: true,
  formatError(formattedError) {
    console.error("[GraphQL]", formattedError.message);
    return formattedError;
  },
});
