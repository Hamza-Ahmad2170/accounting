import {
  pgTable,
  text,
  timestamp,
  index,
  unique,
  pgEnum,
} from "drizzle-orm/pg-core";
import { organization } from "./auth.js";

export const partyType = pgEnum("party_type", ["customer", "vendor", "both"]);

export const party = pgTable(
  "party",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    address: text("address"),
    city: text("city"),
    notes: text("notes"),
    type: partyType("type").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("party_organization_id_idx").on(table.organizationId),

    unique("party_organization_phone_unique").on(
      table.organizationId,
      table.phone,
    ),
  ],
);
