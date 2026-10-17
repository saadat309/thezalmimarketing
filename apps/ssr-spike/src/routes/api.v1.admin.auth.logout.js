import { env } from 'cloudflare:workers'
import { createFileRoute } from '@tanstack/react-router'
import { createAdminAuth } from '../lib/admin-auth.js'

const auth = createAdminAuth(env)

export const Route = createFileRoute('/api/v1/admin/auth/logout')({
  server: {
    handlers: {
      OPTIONS: ({ request }) => auth.options(request),
      POST: ({ request }) => auth.logout(request),
      ANY: ({ request }) => Response.json({ error: { code: 'method_not_allowed' } }, { status: 405, headers: { Allow: 'POST, OPTIONS', 'Cache-Control': 'no-store' } }),
    },
  },
})
