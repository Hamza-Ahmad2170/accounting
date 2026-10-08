import { defineRelationsPart } from "drizzle-orm";
import { organization } from "./auth.js";
import { organizationProfile } from "./organization_profile.js";
import { party } from "./party.js";

export const appRelations = defineRelationsPart(
  {
    organization,
    organizationProfile,
    party,
  },
  (r) => ({
    organization: {
      profile: r.one.organizationProfile({
        from: r.organization.id,
        to: r.organizationProfile.organizationId,
      }),

      parties: r.many.party({
        from: r.organization.id,
        to: r.party.organizationId,
      }),
    },

    organizationProfile: {
      organization: r.one.organization({
        from: r.organizationProfile.organizationId,
        to: r.organization.id,
      }),
    },

    party: {
      organization: r.one.organization({
        from: r.party.organizationId,
        to: r.organization.id,
      }),
    },
  }),
);
