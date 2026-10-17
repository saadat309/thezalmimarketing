import { env } from 'cloudflare:workers'
import { createFileRoute } from '@tanstack/react-router'
import { createAdminAuth } from '../lib/admin-auth.js'
import { createAdminDataApi, createMemoryAdminRepository } from '../lib/admin-data.js'

const auth = createAdminAuth(env)
const api = createAdminDataApi(createMemoryAdminRepository(), auth)

export const Route = createFileRoute('/api/v1/admin/$domain/$id')({
  server: {
    handlers: {
      GET: ({ request, params }) => api.item(request, params.domain, params.id),
      PUT: ({ request, params }) => api.item(request, params.domain, params.id),
      PATCH: ({ request, params }) => api.item(request, params.domain, params.id),
      DELETE: ({ request, params }) => api.item(request, params.domain, params.id),
      OPTIONS: ({ request, params }) => api.item(request, params.domain, params.id),
      ANY: ({ request, params }) => api.item(request, params.domain, params.id),
    },
  },
})
