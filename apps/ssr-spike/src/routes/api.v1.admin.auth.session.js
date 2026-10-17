import { env } from 'cloudflare:workers'
import { createFileRoute } from '@tanstack/react-router'
import { createAdminAuth } from '../lib/admin-auth.js'

const auth = createAdminAuth(env)

export const Route = createFileRoute('/api/v1/admin/auth/session')({
  server: {
    handlers: {
      OPTIONS: ({ request }) => auth.options(request),
      GET: ({ request }) => auth.session(request),
      ANY: ({ request }) => Response.json({ error: { code: 'method_not_allowed' } }, { status: 405, headers: { Allow: 'GET, OPTIONS', 'Cache-Control': 'no-store' } }),
    },
  },
})
