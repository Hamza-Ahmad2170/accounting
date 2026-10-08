import {
  createProblemTypeRegistry,
  problemDetailsHandler,
} from "hono-problem-details";
import { env } from "#/config/env.js";

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

    NO_ACTIVE_ORGANIZATION: {
      type: "/problems/no-active-organization",
      status: 400,
      title: "No Active Organization",
    },
    CONFLICT: {
      type: "/problems/conflict",
      status: 409,
      title: "Conflict",
    },
  },
  { autoCode: true },
);

export const problemHandler = problemDetailsHandler({
  typePrefix: "/problems",
  includeStack: env.NODE_ENV !== "production",
  autoInstance: true,
});
