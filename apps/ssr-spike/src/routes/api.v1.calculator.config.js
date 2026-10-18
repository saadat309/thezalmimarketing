import { createFileRoute } from '@tanstack/react-router'
import { handleCalculatorConfig } from '../lib/calculator-api.js'
import { env } from 'cloudflare:workers'
import { createD1CalculatorRepository } from '../lib/calculator-repository.js'

const repository = createD1CalculatorRepository(env.STAGING_DB)

export const Route = createFileRoute('/api/v1/calculator/config')({
  server: {
    handlers: {
      GET: ({ request }) => handleCalculatorConfig(request, repository),
      HEAD: ({ request }) => handleCalculatorConfig(request, repository),
      ANY: ({ request }) => handleCalculatorConfig(request, repository),
    },
  },
})
