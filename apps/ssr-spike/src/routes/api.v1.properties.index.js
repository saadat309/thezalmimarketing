import { env } from 'cloudflare:workers'
import { createFileRoute } from '@tanstack/react-router'
import { createPropertyApi } from '../lib/property-api.js'
import { createD1PropertyRepository } from '../lib/property-repository.js'

const properties = createPropertyApi(createD1PropertyRepository(env.STAGING_DB))

export const Route = createFileRoute('/api/v1/properties/')({
  server: {
    handlers: {
      GET: ({ request }) => properties.list(request),
      ANY: () => Response.json(
        { error: { code: 'method_not_allowed' } },
        { status: 405, headers: { Allow: 'GET, HEAD', 'Cache-Control': 'no-store' } },
      ),
    },
  },
})
