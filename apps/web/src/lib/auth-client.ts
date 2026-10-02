import { createAuthClient } from 'better-auth/react'
import { organizationClient } from 'better-auth/client/plugins'
import { env } from '#/env'

export const authClient = createAuthClient({
  baseURL: env.VITE_BETTER_AUTH_URL || 'http://localhost:3001',

  plugins: [organizationClient()],
})
