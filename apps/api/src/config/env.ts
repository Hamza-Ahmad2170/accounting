import { createEnv } from "@t3-oss/env-core";
import * as z from "zod";

try {
  process.loadEnvFile();
} catch {
  // No .env on disk; fall through to whatever the environment provides.
}

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    /** API port. `apps/web` already occupies 3000 in dev, so the API uses 3001. */
    PORT: z.coerce.number().int().positive().default(3001),

    /** Origin of the front-end, used for CORS and Better Auth's `trustedOrigins`. */
    WEB_ORIGIN: z.url(),

    DATABASE_URL: z.url(),
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.url(),
  },

  clientPrefix: "PUBLIC_",
  client: {},

  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
