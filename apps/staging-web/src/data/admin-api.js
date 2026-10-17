const ADMIN_API = '/api/v1/admin'

function apiOrigin() {
  return import.meta.env.VITE_STAGING_API_ORIGIN || (import.meta.env.DEV
    ? 'http://127.0.0.1:4175'
    : 'https://zalmi-ssr-spike-local.thezalmimarkettingsajidmahmood.workers.dev')
}

let csrfToken = ''

async function request(path, { method = 'GET', body, csrf = false } = {}) {
  let response
  try {
    response = await fetch(new URL(`${ADMIN_API}${path}`, apiOrigin()), {
      method,
      credentials: 'include',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(csrf && csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })
  } catch {
    throw new Error('The local synthetic dashboard API is unavailable.')
  }
  let data = null
  try { data = await response.json() } catch { /* handled as a generic API error */ }
  if (!response.ok) {
    if (response.status === 401 && path === '/auth/login') throw new Error('Email or password is incorrect.')
    if (response.status === 401) throw new Error('Your local staging session has expired. Please sign in again.')
    if (response.status === 503) throw new Error('Local Admin passwords are not configured. See apps/ssr-spike/README.md.')
    if (response.status === 404) throw new Error('Local Admin auth is disabled or unavailable. Configure the local API as described in apps/ssr-spike/README.md.')
    const fieldError = data?.error?.fields && Object.values(data.error.fields).join(' ')
    throw new Error(fieldError || 'The staging API rejected this request.')
  }
  if (typeof data?.csrfToken === 'string') csrfToken = data.csrfToken
  return data
}

export async function loginAdmin(email, password) {
  const data = await request('/auth/login', { method: 'POST', body: { email, password } })
  csrfToken = data.csrfToken
  return data.user
}

export async function readAdminSession() {
  try {
    const data = await request('/auth/session')
    csrfToken = data.csrfToken
    return data.user
  } catch (error) {
    if (/session has expired/.test(error.message)) return null
    throw error
  }
}

export async function logoutAdmin() {
  await request('/auth/logout', { method: 'POST', csrf: true })
  csrfToken = ''
}

export function readAdminCollection(domain) {
  return request(`/${encodeURIComponent(domain)}`)
}

export function createAdminRecord(domain, data) {
  return request(`/${encodeURIComponent(domain)}`, { method: 'POST', body: data, csrf: true })
}

export function updateAdminRecord(domain, id, data) {
  return request(`/${encodeURIComponent(domain)}/${encodeURIComponent(id)}`, { method: 'PATCH', body: data, csrf: true })
}

export function deleteAdminRecord(domain, id) {
  return request(`/${encodeURIComponent(domain)}/${encodeURIComponent(id)}`, { method: 'DELETE', csrf: true })
}
