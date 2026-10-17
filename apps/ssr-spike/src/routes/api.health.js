import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/health')({
  server: {
    handlers: {
      GET: async () =>
        Response.json(
          { status: 'ok', environment: 'synthetic' },
          { headers: { 'Cache-Control': 'no-store' } },
        ),
      ANY: async () =>
        Response.json(
          { error: 'Method not allowed' },
          {
            status: 405,
            headers: {
              Allow: 'GET, HEAD',
              'Cache-Control': 'no-store',
            },
          },
        ),
    },
  },
})
