import { createServerFn } from '@tanstack/react-start';

function apiOrigin() {
  return import.meta.env.VITE_STAGING_API_ORIGIN || (import.meta.env.DEV
    ? 'http://127.0.0.1:4175'
    : 'https://zalmi-ssr-spike-local.thezalmimarkettingsajidmahmood.workers.dev');
}

function validateDirectoryInput(input = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid directory filters.');
  const result = {};
  for (const key of ['query', 'city', 'society', 'phase', 'file_type']) {
    const value = input[key];
    if (value === undefined || value === '') continue;
    if (typeof value !== 'string' || value.length > 100) throw new Error('Invalid directory filters.');
    result[key] = value.trim();
  }
  return result;
}

async function readDirectory(path, filters) {
  const url = new URL(path, apiOrigin());
  for (const [key, value] of Object.entries(filters)) url.searchParams.set(key, value);
  let response;
  try {
    response = await fetch(url, { method: 'GET', headers: { Accept: 'application/json' }, cache: 'no-store', redirect: 'manual' });
  } catch {
    throw new Error('The synthetic staging API is unavailable.');
  }
  if (!response.ok) throw new Error('The synthetic staging API is unavailable.');
  const result = await response.json();
  if (!Array.isArray(result.items) || !result.filters) throw new Error('The synthetic staging API returned invalid directory data.');
  return result;
}

export const listStagingMaps = createServerFn({ method: 'GET' })
  .validator(validateDirectoryInput)
  .handler(({ data }) => readDirectory('/api/v1/maps/', data));

export const listStagingFiles = createServerFn({ method: 'GET' })
  .validator(validateDirectoryInput)
  .handler(({ data }) => readDirectory('/api/v1/files/', data));

export const readStagingCalculatorConfig = createServerFn({ method: 'GET' })
  .handler(async () => {
    let response;
    try {
      response = await fetch(new URL('/api/v1/calculator/config', apiOrigin()), {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
        redirect: 'manual',
      });
    } catch {
      throw new Error('The synthetic staging calculator API is unavailable.');
    }
    if (!response.ok) throw new Error('The synthetic staging calculator API is unavailable.');
    const config = await response.json();
    const required = ['cities', 'societies', 'calculator_phases', 'calculator_blocks', 'calculator_property_types', 'calculator_rates', 'calculator_transfer_fees', 'calculator_fees', 'calculator_tax_rates', 'calculator_fee_rules'];
    if (required.some((key) => !Array.isArray(config[key]))) throw new Error('The synthetic calculator returned an invalid response.');
    return config;
  });
