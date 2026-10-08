import { emptyToNull } from "#/lib/schema.js";
import { z } from "zod";

// Helper to convert empty string inputs from HTML forms to null

// 3-letter ISO 4217 Currency Code (e.g. USD, EUR, PKR, GBP)
const currencyCode = z
  .string()
  .trim()
  .toUpperCase()
  .regex(
    /^[A-Z]{3}$/,
    "Currency must be a 3-letter code (e.g. USD, EUR, PKR).",
  );

const emailAddress = z.email("Invalid email address").trim().max(320);

export const updateSettingsSchema = z.object({
  name: z.string().trim().min(1, "Company name is required"),
  phone: emptyToNull.pipe(z.string().max(40).nullable()).optional(),
  email: emptyToNull.pipe(emailAddress.nullable()).optional(),
  address: emptyToNull.pipe(z.string().max(255).nullable()).optional(),
  city: emptyToNull.pipe(z.string().max(120).nullable()).optional(),
  postalCode: emptyToNull.pipe(z.string().max(20).nullable()).optional(),
  country: emptyToNull.pipe(z.string().max(120).nullable()).optional(),
  currency: emptyToNull.pipe(currencyCode.nullable()).optional(),
  invoiceFooter: emptyToNull.pipe(z.string().max(2000).nullable()).optional(),
  notes: emptyToNull.pipe(z.string().max(5000).nullable()).optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
