import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  clientPrefix: 'VITE_',

  client: {
    VITE_APP_TITLE: z.string().min(1).default('Accounting App'),
    VITE_BETTER_AUTH_URL: z.url().default('http://localhost:3001'),
    VITE_API_URL: z.url().default('http://localhost:3001'),
  },

  runtimeEnv: import.meta.env,
  emptyStringAsUndefined: true,
})
