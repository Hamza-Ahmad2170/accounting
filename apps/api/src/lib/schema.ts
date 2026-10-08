import { z } from "zod";

// 1. Single UUID identifier
export const idSchema = z.object({ id: z.uuid() });
export const id = z.uuid();

// 2. Route param validator for /:id
export const idParamSchema = z.object({ id });

// 3. Reusable ID(s) filter: handles single UUID, array, or comma-separated string
export const idsSchema = z.preprocess(
  (v) => (typeof v === "string" && v.includes(",") ? v.split(",") : v),
  z.union([id, z.array(id)]),
);

// 4. Bulk Delete query schema: DELETE /resource?id=uuid1,uuid2
export const deleteManySchema = z.object({
  id: idsSchema,
});

// 5. Converts empty string from cleared HTML form inputs to null
export const emptyToNull = z
  .string()
  .trim()
  .transform((val) => (val === "" ? null : val));

// 6. Base list query primitives
export const paginationSchema = {
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(100).default(10),
};

export const orderSchema = z
  .enum(["ASC", "DESC", "asc", "desc"])
  .default("ASC")
  .transform((v) => v.toUpperCase() as "ASC" | "DESC");

export const searchQuerySchema = z
  .string()
  .trim()
  .optional()
  .transform((val) => (val === "" ? undefined : val));
