import { db, organizationProfile } from "#/db/index.js";
import { eq } from "drizzle-orm";
import type { UpdateSettingsInput } from "./settings.schema.js";

export type OrganizationSettings = typeof organizationProfile.$inferSelect;

export async function getSettings(organizationId: string) {
  const [profile] = await db
    .select()
    .from(organizationProfile)
    .where(eq(organizationProfile.organizationId, organizationId))
    .limit(1);

  return profile ?? null;
}

export async function updateSettings(
  organizationId: string,
  data: UpdateSettingsInput,
) {
  // Strip undefined keys so they don't overwrite existing columns
  const definedEntries = Object.entries(data).filter(
    ([, val]) => val !== undefined,
  );
  const patch = Object.fromEntries(definedEntries);

  const [updated] = await db
    .insert(organizationProfile)
    .values({
      organizationId,
      name: data.name,
      ...patch,
    })
    .onConflictDoUpdate({
      target: organizationProfile.organizationId,
      set: {
        ...patch,
      },
    })
    .returning();

  return updated;
}
