import { factory } from "#/lib/factory.js";
import { zValidator } from "@hono/zod-validator";
import { zodProblemHook } from "hono-problem-details/zod";
import { requireOrgAdmin, requireOrgMember } from "#/middleware/index.js";
import { updateSettingsSchema } from "./settings.schema.js";
import { getSettings, updateSettings } from "./settings.service.js";

const settingsRoutes = factory
  .createApp()

  .get("/", requireOrgMember, async (c) => {
    const orgId = c.get("session").activeOrganizationId!;
    const settings = await getSettings(orgId);

    return c.json({
      data: settings ?? {
        organizationId: orgId,
        name: "",
        phone: null,
        email: null,
        address: null,
        city: null,
        postalCode: null,
        country: null,
        currency: null,
        invoiceFooter: null,
        notes: null,
      },
    });
  })

  // 2. Update Settings (Restricted to Admins and Owners)
  .put(
    "/",
    requireOrgAdmin,
    zValidator("json", updateSettingsSchema, zodProblemHook()),
    async (c) => {
      const orgId = c.get("session").activeOrganizationId!;
      const data = c.req.valid("json");

      const updated = await updateSettings(orgId, data);
      return c.json({ data: updated });
    },
  );

export default settingsRoutes;
