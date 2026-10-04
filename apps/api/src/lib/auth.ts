import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import { db } from "#/db/index.js";
import * as authSchema from "#/db/schema/auth.js";
import { env } from "#/config/env.js";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          /*
           * Oldest membership wins, so a user in several orgs lands in the same
           * one on every sign-in. This is the only point where the choice can be
           * made deterministically: later switches go through
           * `organization/set-active` and persist on the session row.
           *
           * Queried from the member table directly rather than through
           * `auth.api.listOrganizations` - that helper authenticates off the
           * request headers, and the session row it would read is the one this
           * hook is in the middle of creating.
           */
          const oldestMembership = await db.query.member.findFirst({
            where: {
              userId: session.userId,
            },
            orderBy: (member, { asc }) => asc(member.createdAt),
          });

          return {
            data: {
              ...session,
              activeOrganizationId: oldestMembership?.organizationId ?? null,
            },
          };
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [env.WEB_ORIGIN],
  plugins: [
    organization({
      allowUserToCreateOrganization: true,
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
