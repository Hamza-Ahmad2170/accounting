import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const config = defineConfig(({ command }) => {
  // Both of these plugins deadlock `vite dev` on this machine: the dev server
  // starts watching files but never reaches `listen()`, hanging with 0% CPU
  // (no port is ever bound). `vite build` completes fine with both enabled,
  // so they are only registered for the build.
  const isDev = command === 'serve'

  return {
    resolve: { tsconfigPaths: true },
    plugins: [
      isDev ? null : devtools(),
      isDev ? null : nitro({ rollupConfig: { external: [/^@sentry\//] } }),
      tailwindcss(),
      tanstackStart({
        spa: {
          enabled: true,
        },
      }),
      viteReact(),
    ],
  }
})

export default config
