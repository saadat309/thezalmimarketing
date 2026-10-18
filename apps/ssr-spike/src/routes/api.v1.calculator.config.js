import { createFileRoute } from '@tanstack/react-router'
import { handleCalculatorConfig } from '../lib/calculator-api.js'

export const Route = createFileRoute('/api/v1/calculator/config')({
  server: {
    handlers: {
      GET: ({ request }) => handleCalculatorConfig(request),
      HEAD: ({ request }) => handleCalculatorConfig(request),
      ANY: ({ request }) => handleCalculatorConfig(request),
    },
  },
})
