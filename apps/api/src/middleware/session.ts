import { createMiddleware } from "hono/factory";
import { auth, type AuthSession } from "#/lib/auth.js";

/**
 * Context variables populated by `sessionMiddleware`.
 *
 * `typeof auth.$Infer.Session` is derived from the Better Auth instance rather
 * than hand-written, so the type tracks the instance automatically — including
 * fields contributed by plugins, such as `activeOrganizationId` from the
 * `organization()` plugin enabled in `lib/auth.ts`.
 */
export type AuthVariables = {
  Variables: {
    session: AuthSession;
  };
};

/**
 * Resolves the current session once and stores it on the context.
 *
 * The raw request headers are handed to Better Auth so it parses the session
 * cookie itself — the same cookie the browser sends because the client uses
 * `credentials: "include"`.
 *
 * Attaching this to a route makes the session *available*; it does not require
 * one. Routes that need a signed-in user must check `c.get("session")` and
 * throw `HTTPException(401)` themselves, since the `null` case is legitimate
 * (a first-time visitor).
 */
export const sessionMiddleware = createMiddleware<AuthVariables>(
  async (c, next) => {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });
    c.set("session", session);
    await next();
  },
);
