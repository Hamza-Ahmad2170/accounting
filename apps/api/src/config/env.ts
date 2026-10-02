import { createEnv } from '@t3-oss/env-core'
import * as z from 'zod'

/**
 * Load `.env` before validation.
 *
 * This lives here rather than in the npm scripts because `drizzle.config.ts`
 * imports this module, and static imports are hoisted — a `loadEnvFile()` call
 * in the config would run *after* the schema below had already been validated.
 *
 * `loadEnvFile` never overrides variables already present in the environment,
 * so real process env wins over `.env`. A missing file is not an error: in
 * production the variables come from the platform, not from disk.
 */
try {
  process.loadEnvFile()
} catch {
  // No .env on disk; fall through to whatever the environment provides.
}

/**
 * Validated server environment. Reading `env.X` anywhere in the app fails fast
 * at startup if the variable is missing or malformed, instead of surfacing as
 * `undefined` deep inside a query.
 */
export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

    /** API port. `apps/web` already occupies 3000 in dev, so the API uses 3001. */
    PORT: z.coerce.number().int().positive().default(3001),

    /** Origin of the front-end, used for CORS and Better Auth's `trustedOrigins`. */
    WEB_ORIGIN: z.url(),

    DATABASE_URL: z.url(),
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.url(),
  },

  /** No client-side variables: this is a server-only app. */
  clientPrefix: 'PUBLIC_',
  client: {},

  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})