import { createServerFn } from '@tanstack/react-start';

const FILTERS = [
  'query',
  'category',
  'city',
  'society',
  'phase',
  'property_type',
  'purchase_type',
  'min_beds',
  'min_baths',
  'min_area',
  'area_unit',
  'label',
];

function validateFilters(input = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('Invalid property filters.');
  }

  const filters = {};
  for (const key of FILTERS) {
    const value = input[key];
    if (value === undefined || value === '') continue;
    if (typeof value !== 'string' || value.length > 120) {
      throw new Error('Invalid property filters.');
    }
    filters[key] = value.trim();
  }

  const limit = input.limit === undefined ? 20 : Number(input.limit);
  if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
    throw new Error('Invalid property page size.');
  }
  filters.limit = limit;

  if (input.cursor !== undefined && input.cursor !== '') {
    if (typeof input.cursor !== 'string' || input.cursor.length > 1024 || !/^[A-Za-z0-9_-]+$/.test(input.cursor)) {
      throw new Error('Invalid property cursor.');
    }
    filters.cursor = input.cursor;
  }

  return filters;
}

function apiOrigin() {
  return import.meta.env.VITE_STAGING_API_ORIGIN || (import.meta.env.DEV
    ? 'http://127.0.0.1:4175'
    : 'https://zalmi-ssr-spike-local.thezalmimarkettingsajidmahmood.workers.dev');
}

async function readApiJson(path) {
  let response;
  try {
    response = await fetch(new URL(path, apiOrigin()), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      redirect: 'manual',
    });
  } catch {
    throw new Error('The synthetic staging API is unavailable.');
  }

  if (response.status === 404) return null;
  if (!response.ok) throw new Error('The synthetic staging API is unavailable.');

  try {
    return await response.json();
  } catch {
    throw new Error('The synthetic staging API returned an invalid response.');
  }
}

export const listStagingProperties = createServerFn({ method: 'GET' })
  .validator(validateFilters)
  .handler(async ({ data }) => {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(data)) search.set(key, String(value));

    const result = await readApiJson(`/api/v1/properties?${search}`);
    if (!result || !Array.isArray(result.items) || !result.page) {
      throw new Error('The synthetic staging API returned an invalid property list.');
    }
    return result;
  });

export const getStagingProperty = createServerFn({ method: 'GET' })
  .validator((input) => {
    if (!input || typeof input.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug)) {
      throw new Error('Invalid property slug.');
    }
    return { slug: input.slug };
  })
  .handler(async ({ data }) => {
    return readApiJson(`/api/v1/properties/${encodeURIComponent(data.slug)}`);
  });
