const SESSION_COOKIE = 'zalmi_admin_session'
const SESSION_TTL_SECONDS = 30 * 60
const USERNAMES = [
  { id: 'staging-admin-1', email: 'admin.one@staging.invalid', name: 'Staging Admin One', role: 'Admin', passwordKey: 'STAGING_ADMIN_1_PASSWORD' },
  { id: 'staging-admin-2', email: 'admin.two@staging.invalid', name: 'Staging Admin Two', role: 'Admin', passwordKey: 'STAGING_ADMIN_2_PASSWORD' },
]
const sessions = new Map()
const failures = new Map()

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

function constantTimeEqual(left, right) {
  const a = new TextEncoder().encode(left)
  const b = new TextEncoder().encode(right)
  let difference = a.length ^ b.length
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    difference |= (a[i] || 0) ^ (b[i] || 0)
  }
  return difference === 0
}

function passwordMatches(candidate, expected) {
  return constantTimeEqual(candidate, expected)
}

export function createAdminAuth(environment = {}) {
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

      const attemptKey = body.email.trim().toLowerCase()
      const priorFailures = failures.get(attemptKey)
      if (priorFailures && priorFailures.expiresAt > Date.now() && priorFailures.count >= 5) {
        return json(request, { error: { code: 'try_later' } }, 429, { 'Retry-After': String(Math.ceil((priorFailures.expiresAt - Date.now()) / 1000)) })
      }
      let account = null
      for (const user of USERNAMES) {
        const matched = passwordMatches(body.password, environment[user.passwordKey])
        if (user.email === body.email.trim().toLowerCase() && matched) account = user
      }
      if (!account) {
        const current = priorFailures && priorFailures.expiresAt > Date.now() ? priorFailures : { count: 0, expiresAt: Date.now() + 60_000 }
        failures.set(attemptKey, { ...current, count: current.count + 1 })
        return json(request, { error: { code: 'invalid_credentials' } }, 401)
      }
      failures.delete(attemptKey)

      for (const [id, session] of sessions) if (session.expiresAt <= Date.now()) sessions.delete(id)
      if (sessions.size >= 20) sessions.delete(sessions.keys().next().value)

      const sessionId = crypto.randomUUID()
      const csrfToken = crypto.randomUUID()
      sessions.set(sessionId, { userId: account.id, csrfToken, expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000 })
      const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : ''
      return json(request, { user: publicUser(account), csrfToken }, 200, {
        'Set-Cookie': `${SESSION_COOKIE}=${sessionId}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_TTL_SECONDS}${secure}`,
      })
    },

    session(request) {
      if (!isLoopbackRequest(request) || !originAllowed(request)) return json(request, { error: { code: 'not_found' } }, 404)
      if (request.method !== 'GET') return json(request, { error: { code: 'method_not_allowed' } }, 405, { Allow: 'GET, OPTIONS' })
      if (environment.STAGING_LOCAL_AUTH !== 'enabled') return json(request, { enabled: false, user: null })
      const sessionId = readCookie(request, SESSION_COOKIE)
      const session = sessionId && sessions.get(sessionId)
      if (!session || session.expiresAt <= Date.now()) {
        if (sessionId) sessions.delete(sessionId)
        return json(request, { enabled: true, user: null })
      }
      const user = USERNAMES.find((item) => item.id === session.userId)
      if (!user) return json(request, { enabled: true, user: null })
      return json(request, { user: publicUser(user), csrfToken: session.csrfToken })
    },

    logout(request) {
      if (!isLocalRequest(request, environment)) return json(request, { error: { code: 'not_found' } }, 404)
      if (request.method !== 'POST') return json(request, { error: { code: 'method_not_allowed' } }, 405, { Allow: 'POST, OPTIONS' })
      const sessionId = readCookie(request, SESSION_COOKIE)
      const session = sessionId && sessions.get(sessionId)
      if (!session || session.expiresAt <= Date.now()) return json(request, { error: { code: 'unauthenticated' } }, 401)
      if (!constantTimeEqual(request.headers.get('X-CSRF-Token') || '', session.csrfToken)) {
        return json(request, { error: { code: 'csrf_failed' } }, 403)
      }
      sessions.delete(sessionId)
      const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : ''
      return json(request, { ok: true }, 200, {
        'Set-Cookie': `${SESSION_COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secure}`,
      })
    },

    requireAdmin(request, { csrf = false } = {}) {
      if (!isLocalRequest(request, environment)) return { response: json(request, { error: { code: 'not_found' } }, 404) }
      const sessionId = readCookie(request, SESSION_COOKIE)
      const session = sessionId && sessions.get(sessionId)
      if (!session || session.expiresAt <= Date.now()) {
        if (sessionId) sessions.delete(sessionId)
        return { response: json(request, { error: { code: 'unauthenticated' } }, 401) }
      }
      if (csrf && !constantTimeEqual(request.headers.get('X-CSRF-Token') || '', session.csrfToken)) {
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
