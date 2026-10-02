/**
 * Schema barrel — the single entry point drizzle-kit reads.
 *
 * `drizzle.config.ts` points `schema` at this *file*, not at the `schema/`
 * directory. That is what keeps the barrel safe: a directory glob would treat
 * this file and each table module as separate schema sources and register
 * every table twice.
 *
 * To add a table: create its module next to this file, then add one
 * `export * from "./<name>.js"` line below. Nothing else needs updating —
 * `src/db/index.ts` re-exports this barrel, so the table is immediately
 * importable from `#/db/index.js`, and `drizzle-kit` picks it up on the next
 * `db:push` / `db:generate`.
 *
 * Keep `auth.js` first: Better Auth's drizzle adapter in `lib/auth.ts` is
 * keyed on that module's model names.
 */
export * from "./auth.js";
export * from "./party.js";
export * from "./organization_profile.js";
export * from "./relations.js";
