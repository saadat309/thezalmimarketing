import { createMemoryAdminStorage } from './admin-storage.js'

const SESSION_COOKIE = 'zalmi_admin_session'
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60
const USERNAMES = [
  { id: 'staging-admin-1', email: 'admin.one@staging.invalid', name: 'Staging Admin One', role: 'Admin', passwordKey: 'STAGING_ADMIN_1_PASSWORD' },
  { id: 'staging-admin-2', email: 'admin.two@staging.invalid', name: 'Staging Admin Two', role: 'Admin', passwordKey: 'STAGING_ADMIN_2_PASSWORD' },
]

function localHost(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]'
}

function localOrigin(origin) {
  try {
    const url = new URL(origin)
    return url.protocol === 'http:' && localHost(url.hostname)
  } catch {
    return false
  }
}

function isLoopbackRequest(request) {
  try { return localHost(new URL(request.url).hostname) } catch { return false }
}

function originAllowed(request) {
  const origin = request.headers.get('Origin')
  return !origin || localOrigin(origin)
}

function responseHeaders(request, extra = {}) {
  const headers = new Headers({ 'Cache-Control': 'no-store', ...extra })
  const origin = request.headers.get('Origin')
  if (origin && localOrigin(origin)) {
    headers.set('Access-Control-Allow-Origin', origin)
    headers.set('Access-Control-Allow-Credentials', 'true')
    headers.set('Access-Control-Allow-Headers', 'Content-Type, X-CSRF-Token')
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    headers.append('Vary', 'Origin')
  }
  return headers
}

function json(request, data, status = 200, extra = {}) {
  const headers = responseHeaders(request, { 'Content-Type': 'application/json; charset=utf-8', ...extra })
  return new Response(JSON.stringify(data), { status, headers })
}

function isLocalRequest(request, environment) {
  return environment.STAGING_LOCAL_AUTH === 'enabled' && isLoopbackRequest(request) && originAllowed(request)
}

function readCookie(request, name) {
  const cookies = request.headers.get('Cookie') || ''
  for (const item of cookies.split(';')) {
    const [key, ...value] = item.trim().split('=')
    if (key === name) return value.join('=')
  }
  return null
}

async function constantTimeEqual(left, right) {
  const encoder = new TextEncoder()
  const [leftHash, rightHash] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(left)),
    crypto.subtle.digest('SHA-256', encoder.encode(right)),
  ])
  if (typeof crypto.subtle.timingSafeEqual === 'function') return crypto.subtle.timingSafeEqual(leftHash, rightHash)
  const leftBytes = new Uint8Array(leftHash)
  const rightBytes = new Uint8Array(rightHash)
  let difference = 0
  for (let index = 0; index < leftBytes.length; index += 1) difference |= leftBytes[index] ^ rightBytes[index]
  return difference === 0
}

async function passwordMatches(candidate, expected) {
  return constantTimeEqual(candidate, expected)
}

async function hashValue(value) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function createAdminAuth(environment = {}, storage = createMemoryAdminStorage()) {
  return {
    options(request) {
      if (!isLocalRequest(request, environment)) return json(request, { error: { code: 'not_found' } }, 404)
      return new Response(null, { status: 204, headers: responseHeaders(request) })
    },

    async login(request) {
      if (!isLocalRequest(request, environment)) return json(request, { error: { code: 'not_found' } }, 404)
      if (request.method !== 'POST') return json(request, { error: { code: 'method_not_allowed' } }, 405, { Allow: 'POST, OPTIONS' })
      if (!USERNAMES.every(({ passwordKey }) => typeof environment[passwordKey] === 'string' && environment[passwordKey].length >= 20)) {
        return json(request, { error: { code: 'local_admin_auth_not_configured' } }, 503)
      }
      const length = Number(request.headers.get('Content-Length') || 0)
      if (length > 2048) return json(request, { error: { code: 'invalid_request' } }, 413)

      let body
      try {
        body = await request.json()
      } catch {
        return json(request, { error: { code: 'invalid_request' } }, 400)
      }
      if (typeof body?.email !== 'string' || typeof body?.password !== 'string' || body.password.length > 512) {
        return json(request, { error: { code: 'invalid_credentials' } }, 401)
      }

      const attemptKey = await hashValue(body.email.trim().toLowerCase())
      const now = Date.now()
      const priorFailures = await storage.getLoginFailure(attemptKey, now)
      if (priorFailures && priorFailures.expiresAt > Date.now() && priorFailures.count >= 5) {
        return json(request, { error: { code: 'try_later' } }, 429, { 'Retry-After': String(Math.ceil((priorFailures.expiresAt - Date.now()) / 1000)) })
      }
      let account = null
      for (const user of USERNAMES) {
        const matched = await passwordMatches(body.password, environment[user.passwordKey])
        if (user.email === body.email.trim().toLowerCase() && matched) account = user
      }
      if (!account) {
        await storage.recordLoginFailure(attemptKey, now, now + 60_000)
        return json(request, { error: { code: 'invalid_credentials' } }, 401)
      }
      await storage.clearLoginFailure(attemptKey)

      const sessionId = crypto.randomUUID()
      const csrfToken = crypto.randomUUID()
      const createdAt = Date.now()
      await storage.createSession({
        tokenHash: await hashValue(sessionId),
        userId: account.id,
        csrfToken,
        createdAt,
        expiresAt: createdAt + SESSION_TTL_SECONDS * 1000,
      }, createdAt)
      const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : ''
      return json(request, { user: publicUser(account), csrfToken }, 200, {
        'Set-Cookie': `${SESSION_COOKIE}=${sessionId}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_TTL_SECONDS}${secure}`,
      })
    },

    async session(request) {
      if (!isLoopbackRequest(request) || !originAllowed(request)) return json(request, { error: { code: 'not_found' } }, 404)
      if (request.method !== 'GET') return json(request, { error: { code: 'method_not_allowed' } }, 405, { Allow: 'GET, OPTIONS' })
      if (environment.STAGING_LOCAL_AUTH !== 'enabled') return json(request, { enabled: false, user: null })
      const sessionId = readCookie(request, SESSION_COOKIE)
      const session = sessionId && await storage.getSession(await hashValue(sessionId), Date.now())
      if (!session) return json(request, { enabled: true, user: null })
      const user = USERNAMES.find((item) => item.id === session.userId)
      if (!user) return json(request, { enabled: true, user: null })
      return json(request, { user: publicUser(user), csrfToken: session.csrfToken })
    },

    async logout(request) {
      if (!isLocalRequest(request, environment)) return json(request, { error: { code: 'not_found' } }, 404)
      if (request.method !== 'POST') return json(request, { error: { code: 'method_not_allowed' } }, 405, { Allow: 'POST, OPTIONS' })
      const sessionId = readCookie(request, SESSION_COOKIE)
      const tokenHash = sessionId && await hashValue(sessionId)
      const session = tokenHash && await storage.getSession(tokenHash, Date.now())
      if (!session) return json(request, { error: { code: 'unauthenticated' } }, 401)
      if (!await constantTimeEqual(request.headers.get('X-CSRF-Token') || '', session.csrfToken)) {
        return json(request, { error: { code: 'csrf_failed' } }, 403)
      }
      await storage.deleteSession(tokenHash)
      const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : ''
      return json(request, { ok: true }, 200, {
        'Set-Cookie': `${SESSION_COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secure}`,
      })
    },

    async requireAdmin(request, { csrf = false } = {}) {
      if (!isLocalRequest(request, environment)) return { response: json(request, { error: { code: 'not_found' } }, 404) }
      const sessionId = readCookie(request, SESSION_COOKIE)
      const session = sessionId && await storage.getSession(await hashValue(sessionId), Date.now())
      if (!session) return { response: json(request, { error: { code: 'unauthenticated' } }, 401) }
      if (csrf && !await constantTimeEqual(request.headers.get('X-CSRF-Token') || '', session.csrfToken)) {
        return { response: json(request, { error: { code: 'csrf_failed' } }, 403) }
      }
      const user = USERNAMES.find((item) => item.id === session.userId)
      return user ? { user: publicUser(user) } : { response: json(request, { error: { code: 'unauthenticated' } }, 401) }
    },
  }
}

function publicUser(user) {
  return { id: user.id, email: user.email, name: user.name, role: 'Admin' }
}
