import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  index,
  pgEnum,
  uuid,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { organization } from "./auth.js";

export const partyType = pgEnum("party_type", ["customer", "vendor", "both"]);

export const party = pgTable(
  "party",
  {
    id: uuid("id").defaultRandom().primaryKey(),
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
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    index("party_organization_id_idx").on(table.organizationId),

    uniqueIndex("party_org_phone_active_uidx")
      .on(table.organizationId, table.phone)
      .where(sql`deleted_at IS NULL`),
  ],
);
