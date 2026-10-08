import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "#/config/env.js";
import { appRelations } from "./schema/relations.js";
import { authRelations } from "./schema/auth.js";

export const db = drizzle(env.DATABASE_URL, {
  relations: { ...appRelations, ...authRelations },
});

export * from "./schema/index.js";
