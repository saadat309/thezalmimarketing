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
import { createD1CalculatorRepository } from '../lib/calculator-repository.js'
import { createCalculatorAdminApi } from '../lib/calculator-admin-api.js'

const storage = createD1AdminStorage(env.STAGING_DB)
const auth = createAdminAuth(env, storage)
const api = createAdminDataApi(
  createMemoryAdminRepository(), auth, storage,
  createD1PropertyRepository(env.STAGING_DB), createD1DirectoryRepository(env.STAGING_DB), createD1TaxonomyRepository(env.STAGING_DB), createD1LandingRepository(env.STAGING_DB), createD1QueryRepository(env.STAGING_DB),
)
const calculatorApi = createCalculatorAdminApi(auth, createD1CalculatorRepository(env.STAGING_DB))

export const Route = createFileRoute('/api/v1/admin/$domain/$id')({
  server: {
    handlers: {
      GET: async ({ request, params }) => await calculatorApi(request, params.domain, params.id) || api.item(request, params.domain, params.id),
      PUT: async ({ request, params }) => await calculatorApi(request, params.domain, params.id) || api.item(request, params.domain, params.id),
      PATCH: async ({ request, params }) => await calculatorApi(request, params.domain, params.id) || api.item(request, params.domain, params.id),
      DELETE: async ({ request, params }) => await calculatorApi(request, params.domain, params.id) || api.item(request, params.domain, params.id),
      OPTIONS: async ({ request, params }) => await calculatorApi(request, params.domain, params.id) || api.item(request, params.domain, params.id),
      ANY: async ({ request, params }) => await calculatorApi(request, params.domain, params.id) || api.item(request, params.domain, params.id),
    },
  },
})
