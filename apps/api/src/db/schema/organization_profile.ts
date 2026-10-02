import { pgTable, text, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { organization } from "./auth.js";

export const organizationProfile = pgTable("organization_profile", {
  organizationId: text("organization_id")
    .primaryKey()
    .references(() => organization.id, { onDelete: "cascade" }),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  city: text("city"),
  postalCode: text("postal_code"),
  country: text("country"),
  currency: text("currency"),
  invoiceFooter: text("invoice_footer"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
