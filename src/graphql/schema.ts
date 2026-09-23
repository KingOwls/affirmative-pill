export const typeDefs = `#graphql
  scalar DateTime

  enum OrderStatus {
    PENDING_APPROVAL
    APPROVED
    DISPATCHED
    CANCELLED
  }

  type Category { id: ID!, name: String! }
  type Laboratory { id: ID!, name: String! }

  type Medicine {
    id: ID!
    sku: String!
    name: String!
    activeIngredient: String!
    presentation: String!
    indications: String!
    priceCents: Int!
    stock: Int!
    requiresPrescription: Boolean!
    category: Category
    laboratory: Laboratory
  }

  input MedicineFilterInput {
    search: String
    category: String
    requiresPrescription: Boolean
  }

  type MedicineConnection {
    nodes: [Medicine!]!
    totalCount: Int!
  }

  type OrderItemProjection {
    medicineId: ID!
    medicineName: String!
    quantity: Int!
    unitPriceCents: Int!
    subtotalCents: Int!
  }

  type OrderProjection {
    id: ID!
    patientName: String!
    status: OrderStatus!
    totalCents: Int!
    items: [OrderItemProjection!]!
    prescriptionRequired: Boolean!
    prescriptionValidated: Boolean!
    projectedVersion: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
    projectionUpdatedAt: DateTime!
  }

  input OrderItemInput {
    medicineId: ID!
    quantity: Int!
  }

  input PrescriptionInput {
    prescriptionNumber: String!
    doctorName: String!
    issuedAt: String!
  }

  input CreateOrderInput {
    patientName: String!
    items: [OrderItemInput!]!
    prescription: PrescriptionInput
  }

  type DomainError {
    code: String!
    message: String!
    field: String
  }

  type CommandPayload {
    success: Boolean!
    orderId: ID
    status: OrderStatus
    errors: [DomainError!]!
  }

  type Query {
    medicines(filter: MedicineFilterInput, limit: Int = 20, offset: Int = 0): MedicineConnection!
    medicine(id: ID!): Medicine
    order(id: ID!): OrderProjection
  }

  type Mutation {
    createOrder(input: CreateOrderInput!): CommandPayload!
    validatePrescription(orderId: ID!): CommandPayload!
    dispatchOrder(orderId: ID!): CommandPayload!
    cancelOrder(orderId: ID!): CommandPayload!
  }
`;
