import { auth } from "#/lib/auth.js";
import { problems } from "#/lib/problem.js";
import { factory } from "#/lib/factory.js";

export const sessionMiddleware = factory.createMiddleware(async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  /*
   * Thrown, not returned: `app.onError(problemHandler)` in `index.ts` is the only
   * thing that turns a problem into `application/problem+json`, and returning
   * here would skip it and emit a body shape nothing else in this API produces.
   *
   * A throw is safe this early in the chain, since Hono's `compose` wraps every
   * handler in try/catch and routes the error to `onError`, and the `cors`
   * middleware registered before this one still sets its headers afterwards.
   *
   * `UNAUTHENTICATED` rather than `HTTPException` because the registry carries a
   * stable `code` and the `/problems/unauthenticated` type; the library's
   * `HTTPException` branch emits no `code` and would type it
   * `/problems/unauthorized`, so the two would disagree about the same 401.
   */
  if (!session) {
    throw problems.create("UNAUTHENTICATED", {
      detail: "No active session was found for this request.",
    });
  }

  c.set("session", session);
  await next();
});
