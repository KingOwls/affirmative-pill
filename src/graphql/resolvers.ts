import { GraphQLScalarType, Kind } from "graphql";
import { createOrderCommand } from "@/src/application/commands/createOrder";
import { validatePrescriptionCommand } from "@/src/application/commands/validatePrescription";
import { dispatchOrderCommand } from "@/src/application/commands/dispatchOrder";
import { cancelOrderCommand } from "@/src/application/commands/cancelOrder";
import { getMedicine, searchMedicines, type MedicineRow } from "@/src/application/queries/medicineQueries";
import { getOrderProjection } from "@/src/application/queries/orderQueries";
import type { GraphQLContext } from "@/src/graphql/server";
import type { CreateOrderInput } from "@/src/domain/order";

const DateTime = new GraphQLScalarType({
  name: "DateTime",
  serialize(value) {
    if (value instanceof Date) return value.toISOString();
    return new Date(String(value)).toISOString();
  },
  parseValue(value) {
    return new Date(String(value));
  },
  parseLiteral(ast) {
    return ast.kind === Kind.STRING ? new Date(ast.value) : null;
  },
});

export const resolvers = {
  DateTime,
  Query: {
    medicines: (_: unknown, args: { filter?: { search?: string; category?: string; requiresPrescription?: boolean }; limit?: number; offset?: number }, ctx: GraphQLContext) =>
      searchMedicines(ctx.db, { ...args.filter, limit: args.limit, offset: args.offset }),
    medicine: (_: unknown, args: { id: string }, ctx: GraphQLContext) => getMedicine(ctx.db, args.id),
    order: (_: unknown, args: { id: string }, ctx: GraphQLContext) => getOrderProjection(ctx.db, args.id),
  },
  Mutation: {
    createOrder: (_: unknown, args: { input: CreateOrderInput }, ctx: GraphQLContext) => createOrderCommand(ctx.db, args.input),
    validatePrescription: (_: unknown, args: { orderId: string }, ctx: GraphQLContext) => validatePrescriptionCommand(ctx.db, args.orderId),
    dispatchOrder: (_: unknown, args: { orderId: string }, ctx: GraphQLContext) => dispatchOrderCommand(ctx.db, args.orderId),
    cancelOrder: (_: unknown, args: { orderId: string }, ctx: GraphQLContext) => cancelOrderCommand(ctx.db, args.orderId),
  },
  Medicine: {
    category: (medicine: MedicineRow, _: unknown, ctx: GraphQLContext) => ctx.loaders.categories.load(medicine.categoryId),
    laboratory: (medicine: MedicineRow, _: unknown, ctx: GraphQLContext) => ctx.loaders.laboratories.load(medicine.laboratoryId),
  },
};
