import { env } from 'cloudflare:workers'
import { createFileRoute } from '@tanstack/react-router'
import { createAdminAuth } from '../lib/admin-auth.js'
import { createD1AdminStorage } from '../lib/admin-storage.js'
import { createLocalMediaStorage } from '../lib/local-media-storage.js'

const auth = createAdminAuth(env, createD1AdminStorage(env.STAGING_DB))
const media = createLocalMediaStorage()

export const Route = createFileRoute('/api/v1/admin/media/$id')({
  server: {
    handlers: {
      OPTIONS: ({ request }) => auth.options(request),
      DELETE: async ({ request, params }) => {
        const access = await auth.requireAdmin(request, { csrf: true })
        if (access.response) return access.response
        return media.remove(params.id)
          ? Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
          : Response.json({ error: { code: 'not_found' } }, { status: 404, headers: { 'Cache-Control': 'no-store' } })
      },
      ANY: () => Response.json({ error: { code: 'method_not_allowed' } }, { status: 405, headers: { Allow: 'DELETE, OPTIONS', 'Cache-Control': 'no-store' } }),
    },
  },
})
