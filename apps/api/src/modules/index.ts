import { factory } from "#/lib/factory.js";
import partyRoutes from "./party/party.controller.js";
import settingsRoutes from "./settings/settings.controller.js";

export const apiRoutes = factory
  .createApp()
  .route("/parties", partyRoutes)
  .route("/settings", settingsRoutes);

export type ApiRoutes = typeof apiRoutes;
