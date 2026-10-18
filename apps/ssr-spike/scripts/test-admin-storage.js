import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { DatabaseSync } from 'node:sqlite'
import { createAdminAuth } from '../src/lib/admin-auth.js'
import { createAdminDataApi, createMemoryAdminRepository } from '../src/lib/admin-data.js'
import { createD1AdminStorage } from '../src/lib/admin-storage.js'

class LocalD1Statement {
  constructor(database, sql, values = []) {
    this.database = database
    this.sql = sql
    this.values = values
  }

  bind(...values) {
    return new LocalD1Statement(this.database, this.sql, values)
  }

  execute() {
    return this.database.prepare(this.sql).run(...this.values)
  }

  async run() {
    this.execute()
    return { success: true }
  }

  async first() {
    return this.database.prepare(this.sql).get(...this.values) ?? null
  }
}

class LocalD1Database {
  constructor() {
    this.sqlite = new DatabaseSync(':memory:')
  }

  prepare(sql) {
    return new LocalD1Statement(this.sqlite, sql)
  }

  async batch(statements) {
    this.sqlite.exec('BEGIN')
    try {
      const result = statements.map((statement) => statement.execute())
      this.sqlite.exec('COMMIT')
      return result
    } catch (error) {
      this.sqlite.exec('ROLLBACK')
      throw error
    }
  }
}

const database = new LocalD1Database()
database.sqlite.exec(readFileSync(new URL('../migrations/0001_staging_admin_storage.sql', import.meta.url), 'utf8'))
const storage = createD1AdminStorage(database)
const now = Date.now()

const firstFailure = await storage.recordLoginFailure('email-hash', now, now + 60_000)
const secondFailure = await storage.recordLoginFailure('email-hash', now + 1, now + 60_001)
assert.equal(firstFailure.count, 1)
assert.equal(secondFailure.count, 2)
assert.equal((await storage.getLoginFailure('email-hash', now + 2)).count, 2)
await storage.clearLoginFailure('email-hash')
assert.equal(await storage.getLoginFailure('email-hash', now + 3), null)

const session = {
  tokenHash: 'a'.repeat(64),
  userId: 'staging-admin-1',
  csrfToken: 'synthetic-csrf-token',
  createdAt: now,
  expiresAt: now + 7 * 24 * 60 * 60 * 1000,
}
await storage.createSession(session, now)
const restartedStorage = createD1AdminStorage(database)
assert.deepEqual(await restartedStorage.getSession(session.tokenHash, now + 1), {
  userId: session.userId,
  csrfToken: session.csrfToken,
  createdAt: session.createdAt,
  expiresAt: session.expiresAt,
})
assert.equal(await restartedStorage.getSession(session.tokenHash, session.expiresAt), null)

const environment = {
  STAGING_LOCAL_AUTH: 'enabled',
  STAGING_ADMIN_1_PASSWORD: `${crypto.randomUUID()}-${crypto.randomUUID()}`,
  STAGING_ADMIN_2_PASSWORD: `${crypto.randomUUID()}-${crypto.randomUUID()}`,
}
const origin = 'http://127.0.0.1:4182'
const base = 'http://127.0.0.1:4175/api/v1/admin'
const auth = createAdminAuth(environment, restartedStorage)
const login = await auth.login(new Request(`${base}/auth/login`, {
  method: 'POST',
  headers: { Origin: origin, 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin.one@staging.invalid', password: environment.STAGING_ADMIN_1_PASSWORD }),
}))
assert.equal(login.status, 200)
const cookie = login.headers.get('Set-Cookie').split(';')[0]
const loginData = await login.json()
const token = cookie.split('=')[1]
const tokenRow = database.sqlite.prepare('SELECT token_hash FROM admin_sessions WHERE token_hash = ?').get(
  Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))), (byte) => byte.toString(16).padStart(2, '0')).join(''),
)
assert.ok(tokenRow)
assert.notEqual(tokenRow.token_hash, token)

const reinitializedAuth = createAdminAuth(environment, createD1AdminStorage(database))
const afterRestart = await reinitializedAuth.session(new Request(`${base}/auth/session`, {
  headers: { Origin: origin, Cookie: cookie },
}))
assert.equal((await afterRestart.json()).user.email, 'admin.one@staging.invalid')

const profileApi = createAdminDataApi(createMemoryAdminRepository(), reinitializedAuth, createD1AdminStorage(database))
const savedProfileResponse = await profileApi.collection(new Request(`${base}/profile`, {
  method: 'PATCH',
  headers: { Origin: origin, Cookie: cookie, 'X-CSRF-Token': loginData.csrfToken, 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'D1 Synthetic Admin', bio: 'Saved in the local D1 database.' }),
}), 'profile')
assert.equal(savedProfileResponse.status, 200)
const profileApiAfterRestart = createAdminDataApi(createMemoryAdminRepository(), reinitializedAuth, createD1AdminStorage(database))
const persistedProfileResponse = await profileApiAfterRestart.collection(new Request(`${base}/profile`, {
  headers: { Origin: origin, Cookie: cookie },
}), 'profile')
assert.equal((await persistedProfileResponse.json()).user.name, 'D1 Synthetic Admin')

const logout = await reinitializedAuth.logout(new Request(`${base}/auth/logout`, {
  method: 'POST',
  headers: { Origin: origin, Cookie: cookie, 'X-CSRF-Token': loginData.csrfToken },
}))
assert.equal(logout.status, 200)
assert.equal((await (await reinitializedAuth.session(new Request(`${base}/auth/session`, {
  headers: { Origin: origin, Cookie: cookie },
}))).json()).user, null)

for (let index = 0; index < 20; index += 1) {
  await storage.createSession({
    ...session,
    tokenHash: String(index + 1).padStart(64, 'b'),
    createdAt: now + index + 1,
  }, now + index + 1)
}
assert.equal(await storage.getSession(session.tokenHash, now + 100), null)
assert.ok(await storage.getSession(String(20).padStart(64, 'b'), now + 100))

const savedProfile = await storage.saveProfile('staging-admin-1', {
  name: 'Synthetic Admin One',
  bio: 'A synthetic biography that persists.',
}, now)
assert.equal(savedProfile.name, 'Synthetic Admin One')
assert.deepEqual(await restartedStorage.getProfile('staging-admin-1'), savedProfile)

await storage.deleteSession(String(20).padStart(64, 'b'))
assert.equal(await restartedStorage.getSession(String(20).padStart(64, 'b'), now + 100), null)
database.sqlite.close()

console.log('Synthetic D1 admin storage checks passed.')
