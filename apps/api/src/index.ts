import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { env } from "#/config/env.js";
import { problemHandler, problems } from "#/lib/problem.js";
import { auth } from "#/lib/auth.js";
import { factory } from "#/lib/factory.js";
import { logger } from "hono/logger";
import { apiRoutes } from "#/modules/index.js";

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

app.all("/api/auth/*", (c) => auth.handler(c.req.raw));
app.route("/api", apiRoutes);

app.notFound((c) => {
  throw problems.create("NOT_FOUND", {
    detail: `Cannot ${c.req.method} ${c.req.path}`,
  });
});

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
