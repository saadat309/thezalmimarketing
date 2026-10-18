import { env } from 'cloudflare:workers'
import { createFileRoute } from '@tanstack/react-router'
import { createAdminAuth } from '../lib/admin-auth.js'
import { createAdminDataApi, createMemoryAdminRepository } from '../lib/admin-data.js'
import { createD1AdminStorage } from '../lib/admin-storage.js'
import { createD1DirectoryRepository } from '../lib/directory-repository.js'
import { createD1PropertyRepository } from '../lib/property-repository.js'
import { createD1TaxonomyRepository } from '../lib/taxonomy-repository.js'
import { createD1LandingRepository } from '../lib/landing-repository.js'
import { createD1QueryRepository } from '../lib/query-repository.js'

const storage = createD1AdminStorage(env.STAGING_DB)
const auth = createAdminAuth(env, storage)
const api = createAdminDataApi(
  createMemoryAdminRepository(), auth, storage,
  createD1PropertyRepository(env.STAGING_DB), createD1DirectoryRepository(env.STAGING_DB), createD1TaxonomyRepository(env.STAGING_DB), createD1LandingRepository(env.STAGING_DB), createD1QueryRepository(env.STAGING_DB),
)

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
