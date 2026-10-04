import { createProblemTypeRegistry, problemDetailsHandler } from "hono-problem-details";
import { env } from "#/config/env.js";

/**
 * RFC 9457 problem types for this API.
 *
 * Declared as a registry rather than ad-hoc `problemDetails()` calls so the
 * `type` URI, status and title for each error live in exactly one place. With
 * `autoCode`, every problem also carries a short stable `code` extension, which
 * is what a client should branch on — far easier than matching on `type` URIs.
 *
 * `about:blank` is deliberately avoided: RFC 9457 allows it, but it carries no
 * information once a client needs to tell two errors of the same status apart.
 */
export const problems = createProblemTypeRegistry(
  {
    UNAUTHENTICATED: {
      type: "/problems/unauthenticated",
      status: 401,
      title: "Unauthenticated",
    },
    FORBIDDEN: {
      type: "/problems/forbidden",
      status: 403,
      title: "Forbidden",
    },
    NOT_FOUND: {
      type: "/problems/not-found",
      status: 404,
      title: "Not Found",
    },
    VALIDATION_ERROR: {
      type: "/problems/validation-error",
      status: 422,
      title: "Validation Error",
    },
    /*
     * 400, not 403: this is the state of being signed in with no org selected,
     * not a permission failure. Better Auth agrees -- the org plugin throws
     * `APIError.from("BAD_REQUEST", NO_ACTIVE_ORGANIZATION)`
     * (`plugins/organization/routes/crud-members.mjs`), so a client hitting the
     * plugin's own endpoints sees 400 for the same condition.
     */
    NO_ACTIVE_ORGANIZATION: {
      type: "/problems/no-active-organization",
      status: 400,
      title: "No Active Organization",
    },
  },
  { autoCode: true },
);

/**
 * `app.onError` handler: turns every thrown error into `application/problem+json`.
 *
 * `includeStack` adds a `stack` extension on 500s outside production. `detail`
 * stays the constant "An unexpected error occurred" either way, so a UI that
 * renders `detail` verbatim cannot leak internals.
 *
 * `autoInstance` fills `instance` from the request path when a thrown problem
 * didn't set one.
 *
 * ## What this does NOT cover
 *
 * Two cases return non-problem JSON, by design rather than by oversight:
 *
 * 1. `/api/auth/*` — Better Auth *returns* a Response from `auth.handler()`
 *    rather than throwing, so its errors never reach this handler. They arrive
 *    as `application/json` with `{ message, code }`, e.g.
 *    `{"code":"INVALID_EMAIL_OR_PASSWORD","message":"Invalid email or password"}`.
 * 2. Unmatched routes — Hono's default 404 does not throw either; `notFound`
 *    in `index.ts` converts it.
 *
 * A client must therefore handle two error shapes. See `parseProblem` in the
 * web app's data provider.
 */
export const problemHandler = problemDetailsHandler({
  typePrefix: "/problems",
  includeStack: env.NODE_ENV !== "production",
  autoInstance: true,
});
