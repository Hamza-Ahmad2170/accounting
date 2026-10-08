import { factory } from "#/lib/factory.js";
import { zValidator } from "@hono/zod-validator";
import { zodProblemHook } from "hono-problem-details/zod";
import { problems } from "#/lib/problem.js";
import { requireOrgAdmin } from "#/middleware/index.js";
import {
  idSchema,
  partyInsertSchema,
  updatePartySchema,
  partyListSchema,
  deleteManySchema,
} from "./party.schema.js";
import {
  createParty,
  deleteParties,
  deleteParty,
  findParties,
  findPartyById,
  updateParty,
} from "./party.service.js";

const partyRoutes = factory
  .createApp()
  .use("*", requireOrgAdmin)
  .get(
    "/",
    zValidator("query", partyListSchema, zodProblemHook()),
    async (c) => {
      const query = c.req.valid("query");
      const orgId = c.get("session").activeOrganizationId!;

      const parties = await findParties(orgId, query);
      return c.json(parties);
    },
  )
  .get("/:id", zValidator("param", idSchema, zodProblemHook()), async (c) => {
    const partyId = c.req.valid("param").id;
    const orgId = c.get("session").activeOrganizationId!;

    const found = await findPartyById(orgId, partyId);
    if (!found) {
      throw problems.create("NOT_FOUND", {
        detail: "No party was found with that id in the active organization.",
      });
    }
    return c.json({ data: found });
  })
  .post(
    "/",
    zValidator("json", partyInsertSchema, zodProblemHook()),
    async (c) => {
      const party = c.req.valid("json");
      const orgId = c.get("session").activeOrganizationId!;

      const created = await createParty(orgId, party);
      return c.json({ data: created }, 201);
    },
  )
  .put(
    "/:id",
    zValidator("param", idSchema, zodProblemHook()),
    zValidator("json", updatePartySchema, zodProblemHook()),
    async (c) => {
      const partyId = c.req.valid("param").id;
      const party = c.req.valid("json");
      const orgId = c.get("session").activeOrganizationId!;
      const updated = await updateParty(orgId, partyId, party);
      if (!updated) {
        throw problems.create("NOT_FOUND", {
          detail: "No party was found with that id in the active organization.",
        });
      }
      return c.json({ data: updated });
    },
  )
  .delete(
    "/:id",
    zValidator("param", idSchema, zodProblemHook()),
    async (c) => {
      const { id: partyId } = c.req.valid("param");
      const orgId = c.get("session").activeOrganizationId!;
      const deleted = await deleteParty(orgId, partyId);
      if (!deleted) {
        throw problems.create("NOT_FOUND", {
          detail: "No party was found with that id in the active organization.",
        });
      }
      return c.json({ data: deleted });
    },
  )
  .delete(
    "/",
    zValidator("query", deleteManySchema, zodProblemHook()),
    async (c) => {
      const { id: queryId } = c.req.valid("query");
      const orgId = c.get("session").activeOrganizationId!;
      const ids = Array.isArray(queryId) ? queryId : [queryId];
      const deletedIds = await deleteParties(orgId, ids);
      return c.json({ data: deletedIds });
    },
  );

export default partyRoutes;
