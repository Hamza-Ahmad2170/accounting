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
    await authClient.signOut().catch(() => {})
  },

  checkAuth: async () => {
    const { data } = await authClient.getSession()

    if (!data?.session) {
      throw { redirectTo: '/login', message: false }
    }

    if (!data.session.activeOrganizationId) {
      throw { redirectTo: '/create-organization', message: false }
    }
  },

  checkError: async (error?: AuthError) => {
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
