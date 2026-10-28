import { createServerFn } from '@tanstack/react-start';

function apiOrigin() {
  return import.meta.env.VITE_STAGING_API_ORIGIN || (import.meta.env.DEV
    ? 'http://127.0.0.1:4175'
    : 'https://zalmi-ssr-spike-local.thezalmimarkettingsajidmahmood.workers.dev');
}

export const listPublicLandingSections = createServerFn({ method: 'GET' }).handler(async ({ data } = {}) => {
  const url = new URL('/api/v1/landing-sections', apiOrigin());
  url.searchParams.set('_', String(data?.cacheBust || Date.now()));
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('The landing page configuration is unavailable.');
  const result = await response.json();
  if (!Array.isArray(result.items)) throw new Error('The landing page configuration is invalid.');
  return result.items;
});
