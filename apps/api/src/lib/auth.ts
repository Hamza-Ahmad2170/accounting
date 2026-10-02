import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import { db, organizationProfile } from "#/db/index.js";
import * as authSchema from "#/db/schema/auth.js";
import { env } from "#/config/env.js";
import { asc, eq } from "drizzle-orm";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const [oldest] = await db
            .select({ organizationId: authSchema.member.organizationId })
            .from(authSchema.member)
            .where(eq(authSchema.member.userId, session.userId))
            .orderBy(asc(authSchema.member.createdAt))
            .limit(1);

          return {
            data: {
              ...session,
              activeOrganizationId: oldest?.organizationId ?? null,
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
      organizationHooks: {
        afterCreateOrganization: async ({ organization }) => {
          try {
            await db
              .insert(organizationProfile)
              .values({ organizationId: organization.id })
              .onConflictDoNothing();
          } catch (error) {
            console.error(
              `[auth] failed to create profile for organization ${organization.id}`,
              error,
            );
          }
        },
      },
    }),
  ],
});

export type AuthSession = typeof auth.$Infer.Session | null;
