import { z } from "zod";
import { createInsertSchema, createUpdateSchema } from "drizzle-orm/zod";
import { party, partyType } from "#/db/index.js";
import {
  emptyToNull,
  idsSchema,
  orderSchema,
  paginationSchema,
  searchQuerySchema,
} from "#/lib/schema.js";

export { idSchema, idParamSchema, deleteManySchema } from "#/lib/schema.js";

const partyTypeEnum = z.enum(partyType.enumValues);

export const partyInsertSchema = createInsertSchema(party, {
  name: (schema) => schema.trim().min(1, "Name is required"),
  phone: (schema) => schema.trim().min(1, "Phone is required"),
  address: () => emptyToNull.nullable().optional(),
  city: () => emptyToNull.nullable().optional(),
  notes: () => emptyToNull.nullable().optional(),
  type: partyTypeEnum,
}).omit({
  id: true,
  organizationId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export const updatePartySchema = createUpdateSchema(party, {
  name: (schema) => schema.trim().min(1, "Name is required").optional(),
  phone: (schema) => schema.trim().min(1, "Phone is required").optional(),
  address: () => emptyToNull.nullable().optional(),
  city: () => emptyToNull.nullable().optional(),
  notes: () => emptyToNull.nullable().optional(),
  type: partyTypeEnum.optional(),
}).omit({
  id: true,
  organizationId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export const partyListSchema = z.object({
  ...paginationSchema,
  order: orderSchema,
  sort: z.enum(["name", "phone", "createdAt"]).default("createdAt"),
  q: searchQuerySchema,
  type: z.preprocess(
    (v) => (v === "" ? undefined : v),
    partyTypeEnum.optional(),
  ),
  id: idsSchema.optional(),
});

export type PartyParams = z.infer<typeof partyListSchema>;
export type PartyInsert = z.infer<typeof partyInsertSchema>;
export type PartyUpdate = z.infer<typeof updatePartySchema>;
