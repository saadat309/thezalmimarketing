const QUERY_KEYS = new Set(['query', 'city', 'society', 'phase', 'file_type'])
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function error(status, code, fields = {}) {
  return Response.json(
    { error: { code, fields } },
    { status, headers: { 'Cache-Control': 'no-store' } },
  )
}

function directoryOptions(records, kind) {
  const visible = records.filter((item) => item.public === true)
  const unique = (key, label) => [...new Map(visible.map((item) => [item[key], item[label]])).entries()]
    .map(([slug, name]) => ({ slug, name }))
  return {
    cities: unique('city', 'cityName'),
    societies: unique('society', 'societyName'),
    phases: unique('phase', 'phaseName'),
    ...(kind === 'files' ? { fileTypes: [...new Set(visible.map((item) => item.fileType))].sort() } : {}),
  }
}

export function createDirectoryApi(repository, kind) {
  if (!['maps', 'files'].includes(kind)) throw new Error('Unsupported directory kind.')

  return {
    async list(request) {
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        return error(405, 'method_not_allowed', { allow: 'GET, HEAD' })
      }
      const url = new URL(request.url)
      const fields = {}
      for (const key of url.searchParams.keys()) {
        if (!QUERY_KEYS.has(key) || (kind === 'maps' && key === 'file_type')) fields[key] = 'Unsupported filter.'
        if (url.searchParams.getAll(key).length > 1) fields[key] = 'Provide each filter only once.'
      }
      for (const key of ['city', 'society', 'phase']) {
        const value = url.searchParams.get(key)
        if (value !== null && !SLUG.test(value)) fields[key] = 'Must be a valid taxonomy slug.'
      }
      const query = url.searchParams.get('query')
      if (query !== null && query.length > 100) fields.query = 'Must be at most 100 characters.'
      if (Object.keys(fields).length) return error(400, 'invalid_query', fields)

      try {
        const result = await repository.listPublic({
          kind,
          query: query?.trim().toLowerCase() ?? '',
          city: url.searchParams.get('city'),
          society: url.searchParams.get('society'),
          phase: url.searchParams.get('phase'),
          fileType: url.searchParams.get('file_type'),
        })
        const project = kind === 'maps'
          ? ({ slug, title, cityName, societyName, phaseName, description, updatedAt }) => ({ slug, title, cityName, societyName, phaseName, description, updatedAt })
          : ({ slug, title, cityName, societyName, phaseName, fileType, area, price, updatedAt }) => ({ slug, title, cityName, societyName, phaseName, fileType, area, price, updatedAt })
        const body = { items: result.items.map(project), filters: directoryOptions(result.all, kind) }
        return new Response(JSON.stringify(body), {
          status: 200,
          headers: {
            'Cache-Control': 'no-cache, must-revalidate',
            'Content-Type': 'application/json; charset=utf-8',
          },
        })
      } catch {
        return error(500, 'content_unavailable')
      }
    },
  }
}

export function createMemoryDirectoryRepository({ maps, files }) {
  const source = { maps, files }
  return {
    async listPublic({ kind, query, city, society, phase, fileType }) {
      const all = (source[kind] ?? []).filter((item) => item.public === true)
      const items = all.filter((item) => {
        if (city && item.city !== city) return false
        if (society && item.society !== society) return false
        if (phase && item.phase !== phase) return false
        if (fileType && item.fileType !== fileType) return false
        return !query || [item.title, item.cityName, item.societyName, item.phaseName, item.fileType]
          .filter(Boolean).join(' ').toLowerCase().includes(query)
      }).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.slug.localeCompare(b.slug))
      return { all, items }
    },
  }
}
