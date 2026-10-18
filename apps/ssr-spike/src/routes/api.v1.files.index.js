import { env } from 'cloudflare:workers'
import { createFileRoute } from '@tanstack/react-router'
import { createDirectoryApi } from '../lib/directory-api.js'
import { createD1DirectoryRepository } from '../lib/directory-repository.js'

const api = createDirectoryApi(createD1DirectoryRepository(env.STAGING_DB), 'files')

export const Route = createFileRoute('/api/v1/files/')({
  server: {
    handlers: {
      GET: ({ request }) => api.list(request),
      HEAD: ({ request }) => api.list(request),
      ANY: () => Response.json({ error: { code: 'method_not_allowed' } }, { status: 405, headers: { Allow: 'GET, HEAD', 'Cache-Control': 'no-store' } }),
    },
  },
})
