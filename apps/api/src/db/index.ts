import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "#/config/env.js";
import { relations } from "./schema/relations.js";

/**
 * Drizzle client backed by a `pg` pool.
 *
 * `relations` is passed here rather than a `schema` object: drizzle-orm 1.0
 * moved relational-query configuration into this single option. The table
 * modules themselves are handed to Better Auth's drizzle adapter instead, in
 * `lib/auth.ts`.
 *
 * ## Why the schema is re-exported from here
 *
 * `src/db/schema/index.ts` is the barrel that drizzle-kit reads (see
 * `drizzle.config.ts`, where `schema` points at that *file*). Re-exporting it
 * here means application code has one import site for both the client and the
 * tables:
 *
 *     import { db, party, organizationProfile } from "#/db/index.js";
 *
 * The barrel has to be the config's entry point rather than a directory glob.
 * A glob over `src/db/schema/` would pick up the barrel *and* every table
 * module, registering each table twice and failing with `duplicate table name`.
 * Pointing at the file makes drizzle-kit follow the barrel's imports exactly
 * once, so the barrel is safe to keep.
 */
export const db = drizzle(env.DATABASE_URL, {
  relations: relations,
});

export * from "./schema/index.js";
