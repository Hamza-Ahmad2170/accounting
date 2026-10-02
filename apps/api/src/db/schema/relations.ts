import { defineRelations } from "drizzle-orm";
import {
  user,
  session,
  account,
  organization,
  member,
  invitation,
} from "./auth.js";
import { party } from "./party.js";
import { organizationProfile } from "./organization_profile.js";

export const relations = defineRelations(
  {
    user,
    session,
    account,
    organization,
    member,
    invitation,
    organizationProfile,
    party,
  },
  (r) => ({
    user: {
      sessions: r.many.session({
        from: r.user.id,
        to: r.session.userId,
      }),

      accounts: r.many.account({
        from: r.user.id,
        to: r.account.userId,
      }),

      members: r.many.member({
        from: r.user.id,
        to: r.member.userId,
      }),

      invitations: r.many.invitation({
        from: r.user.id,
        to: r.invitation.inviterId,
      }),
    },

    session: {
      user: r.one.user({
        from: r.session.userId,
        to: r.user.id,
        optional: false,
      }),
      activeOrganization: r.one.organization({
        from: r.session.activeOrganizationId,
        to: r.organization.id,
      }),
    },

    account: {
      user: r.one.user({
        from: r.account.userId,
        to: r.user.id,
      }),
    },

    organization: {
      members: r.many.member({
        from: r.organization.id,
        to: r.member.organizationId,
      }),

      invitations: r.many.invitation({
        from: r.organization.id,
        to: r.invitation.organizationId,
      }),

      profile: r.one.organizationProfile({
        from: r.organization.id,
        to: r.organizationProfile.organizationId,
      }),

      party: r.many.party({
        from: r.organization.id,
        to: r.party.organizationId,
      }),
    },

    member: {
      organization: r.one.organization({
        from: r.member.organizationId,
        to: r.organization.id,
        optional: false,
      }),
      user: r.one.user({
        from: r.member.userId,
        to: r.user.id,
        optional: false,
      }),
    },

    invitation: {
      organization: r.one.organization({
        from: r.invitation.organizationId,
        to: r.organization.id,
      }),

      inviter: r.one.user({
        from: r.invitation.inviterId,
        to: r.user.id,
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
