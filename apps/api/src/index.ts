import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { env } from "#/config/env.js";
import { problemHandler } from "#/lib/problem.js";
import { auth } from "#/lib/auth.js";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: env.WEB_ORIGIN,
    credentials: true,
  }),
);

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
