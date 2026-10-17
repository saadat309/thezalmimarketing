import { createFileRoute } from '@tanstack/react-router'
import { createDirectoryApi, createMemoryDirectoryRepository } from '../lib/directory-api.js'
import { syntheticFiles, syntheticMaps } from '../lib/directory-fixtures.js'

const api = createDirectoryApi(createMemoryDirectoryRepository({ maps: syntheticMaps, files: syntheticFiles }), 'maps')

export const Route = createFileRoute('/api/v1/maps/')({
  server: {
    handlers: {
      GET: ({ request }) => api.list(request),
      HEAD: ({ request }) => api.list(request),
      ANY: () => Response.json({ error: { code: 'method_not_allowed' } }, { status: 405, headers: { Allow: 'GET, HEAD', 'Cache-Control': 'no-store' } }),
    },
  },
})
