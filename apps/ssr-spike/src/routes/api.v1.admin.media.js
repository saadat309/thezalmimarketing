import { env } from 'cloudflare:workers'
import { createFileRoute } from '@tanstack/react-router'
import { createAdminAuth } from '../lib/admin-auth.js'
import { createD1AdminStorage } from '../lib/admin-storage.js'
import { createLocalMediaStorage } from '../lib/local-media-storage.js'

const auth = createAdminAuth(env, createD1AdminStorage(env.STAGING_DB))
const media = createLocalMediaStorage()

export const Route = createFileRoute('/api/v1/admin/media')({
  server: {
    handlers: {
      OPTIONS: ({ request }) => auth.options(request),
      GET: async ({ request }) => {
        const access = await auth.requireAdmin(request)
        if (access.response) return access.response
        const url = new URL(request.url)
        return Response.json({ items: media.list(url.searchParams.get('owner_type'), url.searchParams.get('owner_id')) }, { headers: { 'Cache-Control': 'no-store' } })
      },
      POST: async ({ request }) => {
        const access = await auth.requireAdmin(request, { csrf: true })
        if (access.response) return access.response
        let form
        try { form = await request.formData() } catch { return Response.json({ error: { message: 'Invalid multipart upload.' } }, { status: 400 }) }
        const result = await media.put({
          ownerType: form.get('owner_type'), ownerId: form.get('owner_id'), kind: form.get('kind'), file: form.get('file'),
        })
        if (result.error) return Response.json({ error: { message: result.error } }, { status: 400 })
        return Response.json(result, { status: 201, headers: { 'Cache-Control': 'no-store' } })
      },
      ANY: () => Response.json({ error: { code: 'method_not_allowed' } }, { status: 405, headers: { Allow: 'GET, POST, OPTIONS', 'Cache-Control': 'no-store' } }),
    },
  },
})
