import { defineConfig } from 'drizzle-kit'
import { env } from '#/config/env.js'

export default defineConfig({
  /**
   * Points at `schema/index.ts` — the barrel — rather than the `schema/`
   * directory.
   *
   * A directory glob would read the barrel *and* each table module as
   * independent schema sources, registering every table, index, constraint and
   * enum twice. drizzle-kit then fails with `duplicate table name` on every
   * table. Pointing at the file makes drizzle-kit follow the barrel's imports
   * once, so adding a table is a two-step change: create the module, then add
   * one `export * from` line here.
   *
   * `src/db/index.ts` re-exports this barrel, so application code imports the
   * client and the tables from one place: `#/db/index.js`.
   */
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
})
