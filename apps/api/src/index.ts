import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { env } from "#/config/env.js";
import { problemHandler } from "#/lib/problem.js";
import { auth } from "#/lib/auth.js";
import { factory } from "#/lib/factory.js";
import { logger } from "hono/logger";

/*
 * `factory.createApp()` rather than `new Hono()`: the app has to carry the same
 * `AppEnv` as the middleware, otherwise `app.use(sessionMiddleware)` does not
 * typecheck and every `c.get("session")` downstream is `unknown`.
 */
const app = factory.createApp();

app.use(logger());
app.use(
  "*",
  cors({
    origin: env.WEB_ORIGIN,
    credentials: true,
    exposeHeaders: ["Content-Range"],
  }),
);

/*
 * Order is load-bearing. Hono matches in registration order and a handler that
 * returns without `await next()` stops the chain, so this open route must come
 * BEFORE any `app.use` that authenticates -- otherwise sign-in itself would
 * require a session. Everything registered after this point is gated.
 */
app.all("/api/auth/*", (c) => auth.handler(c.req.raw));

app.onError(problemHandler);

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
