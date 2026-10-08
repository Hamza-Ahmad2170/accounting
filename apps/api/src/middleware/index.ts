import { db } from "#/db/index.js";
import { auth, type Role } from "#/lib/auth.js";
import { factory } from "#/lib/factory.js";
import { problems } from "#/lib/problem.js";
import { every } from "hono/combine";

export const requireSession = factory.createMiddleware(async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    throw problems.create("UNAUTHENTICATED", {
      detail: "No active session was found for this request.",
    });
  }

  c.set("session", session.session);
  c.set("user", session.user);
  await next();
});

export const requireOrg = factory.createMiddleware(async (c, next) => {
  const session = c.get("session");

  if (!session.activeOrganizationId) {
    throw problems.create("NO_ACTIVE_ORGANIZATION", {
      detail: "No active organization was found for this request.",
    });
  }

  const member = await db.query.member.findFirst({
    where: {
      userId: session.userId,
      organizationId: session.activeOrganizationId,
    },
    columns: {
      role: true,
    },
  });

  if (!member) {
    throw problems.create("FORBIDDEN", {
      detail: "You are no longer a member of the active organization.",
    });
  }

  c.set("role", member.role.split(",") as Role[]);
  await next();
});

export const requireRole = (allowedRoles: [Role, ...Role[]]) =>
  factory.createMiddleware(async (c, next) => {
    const roles = c.get("role");

    if (!roles.some((r) => allowedRoles.includes(r))) {
      throw problems.create("FORBIDDEN", {
        detail: "You do not have permission to perform this action.",
      });
    }

    await next();
  });

export const requireOrgMember = every(requireSession, requireOrg);

export const requireOrgAdmin = every(
  requireSession,
  requireOrg,
  requireRole(["admin", "owner"]),
);
