import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { organization } from "better-auth/plugins";
import { db, organizationProfile } from "#/db/index.js";
import * as authSchema from "#/db/schema/auth.js";
import { env } from "#/config/env.js";
import { devtools } from "better-auth-devtools";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),

  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [env.WEB_ORIGIN],
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const oldestMembership = await db.query.member.findFirst({
            where: {
              userId: session.userId,
            },
            orderBy: {
              createdAt: "asc",
            },
            columns: {
              organizationId: true,
            },
          });

          return {
            data: {
              ...session,
              activeOrganizationId: oldestMembership?.organizationId,
            },
          };
        },
      },
    },
  },
  plugins: [
    devtools({ enabled: true }),
    organization({
      organizationHooks: {
        afterCreateOrganization: async ({ organization, user }) => {
          await db.insert(organizationProfile).values({
            organizationId: organization.id,
            name: user.name,
          });
        },
      },
    }),
  ],
});

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;
export type Role = typeof auth.$Infer.Member.role;
