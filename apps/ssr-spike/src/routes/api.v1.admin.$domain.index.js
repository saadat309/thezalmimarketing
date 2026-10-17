import { env } from 'cloudflare:workers'
import { createFileRoute } from '@tanstack/react-router'
import { createAdminAuth } from '../lib/admin-auth.js'
import { createAdminDataApi, createMemoryAdminRepository } from '../lib/admin-data.js'

const auth = createAdminAuth(env)
const api = createAdminDataApi(createMemoryAdminRepository(), auth)

export const Route = createFileRoute('/api/v1/admin/$domain/')({
  server: {
    handlers: {
      GET: ({ request, params }) => api.collection(request, params.domain),
      POST: ({ request, params }) => api.collection(request, params.domain),
      OPTIONS: ({ request, params }) => api.collection(request, params.domain),
      ANY: ({ request, params }) => api.collection(request, params.domain),
    },
  },
})
