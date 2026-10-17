import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import react from '@vitejs/plugin-react'

export default defineConfig({
  optimizeDeps: { noDiscovery: true, include: [] },
  plugins: [
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    tanstackStart({
      router: {
        generatedRouteTree: './routeTree.gen.ts',
        disableTypes: false,
      },
    }),
    react(),
  ],
  server: {
    cors: {
      origin: /^http:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/,
      credentials: true,
    },
  },
})
