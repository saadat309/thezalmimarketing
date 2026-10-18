import { env } from 'cloudflare:workers'
import { createFileRoute } from '@tanstack/react-router'
import { createD1LandingRepository } from '../lib/landing-repository.js'

const landingRepository = createD1LandingRepository(env.STAGING_DB)

export const Route = createFileRoute('/api/v1/landing-sections')({
  server: {
    handlers: {
      GET: async ({ request }) => Response.json({ items: await landingRepository.listPublic() }, {
        headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
      }),
      HEAD: ({ request }) => new Response(null, { headers: { 'Cache-Control': 'no-store' } }),
      ANY: () => Response.json({ error: { code: 'method_not_allowed' } }, { status: 405, headers: { Allow: 'GET, HEAD' } }),
    },
  },
})
