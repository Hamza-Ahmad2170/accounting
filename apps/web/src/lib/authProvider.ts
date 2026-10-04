import type { AuthProvider } from 'ra-core'
import { authClient } from '#/lib/auth-client'

/**
 * react-admin ↔ Better Auth bridge.
 *
 * Better Auth's client never rejects. Every action resolves to
 * `{ data, error }`, where `error` is `{ message, code, status, statusText }`.
 * Every method below therefore branches on `error` instead of `try/catch` —
 * except where react-admin's own contract makes a rejection unrecoverable, which
 * is called out inline.
 */

/** Shape of a Better Auth client error. */
type AuthError = {
  message?: string
  code?: string
  status?: number
  statusText?: string
}

export const authProvider: AuthProvider = {
  login: async ({ email, username, password }) => {
    const address = email || username

    if (!address || !password) {
      throw new Error('Email and password are required')
    }

    const { error } = await authClient.signIn.email({
      email: address,
      password,
    })

    if (error) {
      // `error.code` is the machine-readable reason (`INVALID_EMAIL_OR_PASSWORD`,
      // `USER_NOT_FOUND`, ...) and `error.message` is already human-readable.
      throw new Error(error.message || 'Invalid email or password')
    }
  },

  logout: async () => {
    // Deliberately swallows the failure. `useLogout()` only clears the
    // react-admin store and navigates to /login inside the `.then()` of this
    // call, so a rejection would strand the user on a page whose data can no
    // longer be fetched. Discarding the session locally is the right outcome
    // either way — the cookie is gone or unreachable, and the next `checkAuth`
    // will send them to /login.
    await authClient.signOut().catch(() => {})
  },

  checkAuth: async () => {
    // Session only — membership of the active organization is deliberately not
    // required here. A user who just signed up belongs to nothing, and must
    // still be able to reach the create-organization page. Enforcing an org
    // here would make that page unreachable.
    //
    // Note `getSession()` resolves to `{ data: null, error: null }` when the
    // cookie is missing or stale — it does not 401 — so the value is what gets
    // checked, never the status.
    const { data } = await authClient.getSession()

    if (!data?.session.activeOrganizationId) {
      throw { redirectTo: '/create-organization', message: false }
    }
  },

  checkError: async (error?: AuthError) => {
    // Throwing here is react-admin's logout signal: `useLogoutIfAccessDenied`
    // catches it, clears the store and redirects to /login. So this must fire
    // *only* when the session is genuinely gone.
    //
    // 401 is the only such status. 403 means the request was refused while the
    // session stayed valid, and this API produces legitimate 403s:
    //   - `USER_IS_NOT_A_MEMBER_OF_THE_ORGANIZATION` from the organization
    //     plugin, which a signed-up-but-orgless user hits on org-scoped routes
    //   - `Missing or null Origin` from Better Auth's `trustedOrigins` CSRF
    //     check, i.e. a deployment misconfiguration
    // Treating either as "session expired" logs the user out mid-flow for
    // something they cannot act on, so everything else falls through and
    // react-admin just displays the error.
    if (error?.status === 401) {
      throw new Error('Session expired')
    }
  },

  getIdentity: async () => {
    const { data } = await authClient.getSession()
    const user = data?.user

    if (!user) {
      throw new Error('Not authenticated')
    }

    return {
      id: user.id,
      fullName: user.name,
      avatar: user.image ?? undefined,
    }
  },

  getPermissions: async () => {
    // Exposes the active membership so `<CanAccess>` can gate on org role.
    // Shape: `{ organizationId, userId, role, id, createdAt, user }`, where
    // `role` is Better Auth's org role (`owner` by default, configurable).
    //
    // Returns `null` rather than rejecting when there is no active
    // organization: `getActiveMember` answers 401 in that case, and a rejected
    // `getPermissions` is fed straight into `checkError`
    // (`usePermissions.js:64`), which would log the user out for being
    // orgless — the exact user who most needs to stay signed in.
    const { data } = await authClient.organization.getActiveMember()

    if (!data) {
      return null
    }

    return {
      organizationId: data.organizationId,
      role: data.role,
    }
  },
}
