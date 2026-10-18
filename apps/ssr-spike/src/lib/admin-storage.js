const MAX_SESSIONS = 20

export function createMemoryAdminStorage() {
  const sessions = new Map()
  const failures = new Map()
  const profiles = new Map()

  return {
    async getLoginFailure(emailHash, now) {
      const failure = failures.get(emailHash)
      return failure && failure.expiresAt > now ? { ...failure } : null
    },
    async recordLoginFailure(emailHash, now, nextExpiry) {
      const previous = failures.get(emailHash)
      const active = previous && previous.expiresAt > now
      const failure = {
        count: active ? previous.count + 1 : 1,
        expiresAt: active ? previous.expiresAt : nextExpiry,
      }
      failures.set(emailHash, failure)
      return { ...failure }
    },
    async clearLoginFailure(emailHash) {
      failures.delete(emailHash)
    },
    async createSession(session, now) {
      for (const [hash, current] of sessions) if (current.expiresAt <= now) sessions.delete(hash)
      if (sessions.size >= MAX_SESSIONS) sessions.delete(sessions.keys().next().value)
      sessions.set(session.tokenHash, { ...session })
    },
    async getSession(tokenHash, now) {
      const session = sessions.get(tokenHash)
      return session && session.expiresAt > now ? { ...session } : null
    },
    async deleteSession(tokenHash) {
      sessions.delete(tokenHash)
    },
    async getProfile(userId) {
      const profile = profiles.get(userId)
      return profile ? { ...profile } : null
    },
    async saveProfile(userId, profile, now) {
      const saved = { userId, ...profile, updatedAt: now }
      profiles.set(userId, saved)
      return { ...saved }
    },
  }
}

export function createD1AdminStorage(database) {
  if (!database) throw new Error('The local staging D1 binding is required.')

  return {
    async getLoginFailure(emailHash, now) {
      const row = await database.prepare(
        'SELECT failure_count AS count, expires_at AS expiresAt FROM admin_login_failures WHERE email_hash = ? AND expires_at > ? LIMIT 1',
      ).bind(emailHash, now).first()
      return row ? { count: Number(row.count), expiresAt: Number(row.expiresAt) } : null
    },
    async recordLoginFailure(emailHash, now, nextExpiry) {
      await database.prepare(`
        INSERT INTO admin_login_failures (email_hash, failure_count, expires_at)
        VALUES (?, 1, ?)
        ON CONFLICT (email_hash) DO UPDATE SET
          failure_count = CASE
            WHEN admin_login_failures.expires_at > ? THEN admin_login_failures.failure_count + 1
            ELSE 1
          END,
          expires_at = CASE
            WHEN admin_login_failures.expires_at > ? THEN admin_login_failures.expires_at
            ELSE excluded.expires_at
          END
      `).bind(emailHash, nextExpiry, now, now).run()
      return this.getLoginFailure(emailHash, now)
    },
    async clearLoginFailure(emailHash) {
      await database.prepare('DELETE FROM admin_login_failures WHERE email_hash = ?').bind(emailHash).run()
    },
    async createSession(session, now) {
      await database.batch([
        database.prepare('DELETE FROM admin_sessions WHERE expires_at <= ?').bind(now),
        database.prepare(`
          DELETE FROM admin_sessions
          WHERE token_hash = (
            SELECT token_hash FROM admin_sessions ORDER BY created_at ASC, token_hash ASC LIMIT 1
          )
          AND (SELECT COUNT(*) FROM admin_sessions) >= ?
        `).bind(MAX_SESSIONS),
        database.prepare(`
          INSERT INTO admin_sessions (token_hash, user_id, csrf_token, created_at, expires_at)
          VALUES (?, ?, ?, ?, ?)
        `).bind(session.tokenHash, session.userId, session.csrfToken, session.createdAt, session.expiresAt),
      ])
    },
    async getSession(tokenHash, now) {
      const row = await database.prepare(`
        SELECT user_id AS userId, csrf_token AS csrfToken, created_at AS createdAt, expires_at AS expiresAt
        FROM admin_sessions WHERE token_hash = ? AND expires_at > ? LIMIT 1
      `).bind(tokenHash, now).first()
      return row ? {
        userId: row.userId,
        csrfToken: row.csrfToken,
        createdAt: Number(row.createdAt),
        expiresAt: Number(row.expiresAt),
      } : null
    },
    async deleteSession(tokenHash) {
      await database.prepare('DELETE FROM admin_sessions WHERE token_hash = ?').bind(tokenHash).run()
    },
    async getProfile(userId) {
      const row = await database.prepare(
        'SELECT user_id AS userId, name, bio, updated_at AS updatedAt FROM admin_profiles WHERE user_id = ? LIMIT 1',
      ).bind(userId).first()
      return row ? { ...row, updatedAt: Number(row.updatedAt) } : null
    },
    async saveProfile(userId, profile, now) {
      await database.prepare(`
        INSERT INTO admin_profiles (user_id, name, bio, updated_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT (user_id) DO UPDATE SET
          name = excluded.name,
          bio = excluded.bio,
          updated_at = excluded.updated_at
      `).bind(userId, profile.name, profile.bio, now).run()
      return { userId, ...profile, updatedAt: now }
    },
  }
}
