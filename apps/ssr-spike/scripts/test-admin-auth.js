import assert from 'node:assert/strict'
import { createAdminAuth } from '../src/lib/admin-auth.js'

const environment = {
  STAGING_LOCAL_AUTH: 'enabled',
  STAGING_ADMIN_1_PASSWORD: `${crypto.randomUUID()}-${crypto.randomUUID()}`,
  STAGING_ADMIN_2_PASSWORD: `${crypto.randomUUID()}-${crypto.randomUUID()}`,
}
const auth = createAdminAuth(environment)
const origin = 'http://127.0.0.1:4182'
const endpoint = 'http://127.0.0.1:4175/api/v1/admin/auth'
const headers = { Origin: origin, 'Content-Type': 'application/json' }

const disabled = createAdminAuth({})
const disabledSession = await disabled.session(new Request(`${endpoint}/session`, { headers }))
assert.equal(disabledSession.status, 200)
assert.equal((await disabledSession.json()).enabled, false)
assert.equal((await auth.session(new Request(`${endpoint}/session`, { headers }))).status, 200)

const invalid = await auth.login(new Request(`${endpoint}/login`, {
  method: 'POST', headers, body: JSON.stringify({ email: 'admin.one@staging.invalid', password: 'wrong-password' }),
}))
assert.equal(invalid.status, 401)
const throttledAuth = createAdminAuth(environment)
let lastFailed = null
for (let attempt = 0; attempt < 6; attempt += 1) {
  lastFailed = await throttledAuth.login(new Request(`${endpoint}/login`, {
    method: 'POST', headers, body: JSON.stringify({ email: 'unknown@staging.invalid', password: 'incorrect' }),
  }))
}
assert.equal(lastFailed.status, 429)

const login = await auth.login(new Request(`${endpoint}/login`, {
  method: 'POST', headers, body: JSON.stringify({ email: 'admin.one@staging.invalid', password: environment.STAGING_ADMIN_1_PASSWORD }),
}))
assert.equal(login.status, 200)
assert.match(login.headers.get('Set-Cookie'), /HttpOnly/)
assert.match(login.headers.get('Set-Cookie'), /SameSite=Strict/)
const account = await login.json()
assert.equal(account.user.role, 'Admin')
assert.equal(account.user.id, 'staging-admin-1')
assert.ok(!('password' in account.user))

const cookie = login.headers.get('Set-Cookie').split(';')[0]
const session = await auth.session(new Request(`${endpoint}/session`, { headers: { ...headers, Cookie: cookie } }))
assert.equal(session.status, 200)
const sessionData = await session.json()
assert.equal(sessionData.user.email, 'admin.one@staging.invalid')

const noCsrf = await auth.logout(new Request(`${endpoint}/logout`, { method: 'POST', headers: { ...headers, Cookie: cookie } }))
assert.equal(noCsrf.status, 403)
const logout = await auth.logout(new Request(`${endpoint}/logout`, {
  method: 'POST', headers: { ...headers, Cookie: cookie, 'X-CSRF-Token': sessionData.csrfToken },
}))
assert.equal(logout.status, 200)
const afterLogout = await auth.session(new Request(`${endpoint}/session`, { headers: { ...headers, Cookie: cookie } }))
assert.equal((await afterLogout.json()).user, null)

const secondLogin = await auth.login(new Request(`${endpoint}/login`, {
  method: 'POST', headers, body: JSON.stringify({ email: 'admin.two@staging.invalid', password: environment.STAGING_ADMIN_2_PASSWORD }),
}))
assert.equal((await secondLogin.json()).user.role, 'Admin')

const remote = await auth.session(new Request('https://api.example.test/api/v1/admin/auth/session', { headers: { Origin: 'https://app.example.test' } }))
assert.equal(remote.status, 404)

console.log('Synthetic admin auth checks passed.')
