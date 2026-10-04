import { createFactory } from "hono/factory";
import type { Session } from "./auth.js";

export type AppEnv = {
  Variables: {
    /*
     * Not `Session | null`. `Session` in `auth.ts` is already the non-null
     * half, and `sessionMiddleware` throws `UNAUTHENTICATED` *before* it ever
     * calls `c.set`, so nothing downstream can observe a null here. Keeping the
     * `| null` here would force every handler to re-narrow a case that
     * middleware has already ruled out.
     */
    session: Session;
  };
};

export const factory = createFactory<AppEnv>();
